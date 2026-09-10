import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import crypto from 'node:crypto';
import { db } from './db.js';

export const router = Router();
const SECRET = process.env.JWT_SECRET || 'dev_secret_fallback';

export interface AuthRequest extends Request {
  userId?: string;
}

// --------------------------------------------------
// Middleware Auth
// --------------------------------------------------
const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Token manquant ou non fourni' });
    return;
  }

  try {
    const payload = jwt.verify(token, SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Session invalide ou expirée' });
  }
};

// --------------------------------------------------
// 1. Authentification
// --------------------------------------------------
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Identifiant et mot de passe requis' });
    return;
  }

  // try {
  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
    [id, username, hashedPassword, 'User']
  );

  res.status(201).json({ id, username, role: 'User' });
  // } catch {
  //   res.status(409).json({ message: 'Cet utilisateur existe déjà' });
  // }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Identifiants incorrects' });
    return;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, {
    expiresIn: '7d',
  });

  res.status(200).json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.get(
  '/auth/profile',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (!rows[0]) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    res.status(200).json(rows[0]);
  }
);

// --------------------------------------------------
// 2. Tags
// --------------------------------------------------
router.get(
  '/tags',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await db.query(
      'SELECT * FROM task_tags WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.status(200).json(rows);
  }
);

router.post(
  '/tags',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, color = 'primary', description } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Le nom du tag est obligatoire' });
      return;
    }

    const id = crypto.randomUUID();
    await db.query(
      'INSERT INTO task_tags (id, name, color, description, user_id) VALUES (?, ?, ?, ?, ?)',
      [id, name, color, description || null, req.userId]
    );

    res.status(201).json({ id, name, color, description, user_id: req.userId });
  }
);

router.get(
  '/tags/:id',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM task_tags WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (!rows[0]) {
      res.status(404).json({ message: 'Tag introuvable' });
      return;
    }

    res.status(200).json(rows[0]);
  }
);

router.put(
  '/tags/:id',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, color, description } = req.body;

    const [result] = await db.query(
      `UPDATE task_tags 
     SET name = COALESCE(?, name), 
         color = COALESCE(?, color), 
         description = COALESCE(?, description) 
     WHERE id = ? AND user_id = ?`,
      [name, color, description, req.params.id, req.userId]
    );

    res.status(200).json({ success: true });
  }
);

router.delete(
  '/tags/:id',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    await db.query('DELETE FROM task_tags WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    res.status(204).send();
  }
);

router.get(
  '/tags/:id/tasks',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE tag_id = ? AND user_id = ? ORDER BY created_at DESC',
      [req.params.id, req.userId]
    );
    res.status(200).json(rows);
  }
);

// --------------------------------------------------
// 3. Tâches
// --------------------------------------------------
router.get(
  '/tasks',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await db.query(
      `SELECT t.*, tg.name AS tag_name, tg.color AS tag_color 
     FROM tasks t 
     LEFT JOIN task_tags tg ON t.tag_id = tg.id 
     WHERE t.user_id = ? 
     ORDER BY t.created_at DESC`,
      [req.userId]
    );
    res.status(200).json(rows);
  }
);

router.post(
  '/tasks',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, is_done, description, due_date, tag_id } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Le nom de la tâche est obligatoire' });
      return;
    }

    const id = crypto.randomUUID();
    await db.query(
      'INSERT INTO tasks (id, name, is_done, description, due_date, tag_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        name,
        is_done || false,
        description || null,
        due_date || null,
        tag_id || null,
        req.userId,
      ]
    );

    res
      .status(201)
      .json({ id, name, description, due_date, tag_id, user_id: req.userId });
  }
);

router.get(
  '/tasks/:id',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT t.*, tg.name AS tag_name, tg.color AS tag_color 
     FROM tasks t 
     LEFT JOIN task_tags tg ON t.tag_id = tg.id 
     WHERE t.id = ? AND t.user_id = ?`,
      [req.params.id, req.userId]
    );

    if (!rows[0]) {
      res.status(404).json({ message: 'Tâche introuvable' });
      return;
    }

    res.status(200).json(rows[0]);
  }
);

router.put(
  '/tasks/:id',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, is_done, description, due_date, tag_id } = req.body;

    await db.query(
      `UPDATE tasks 
     SET name = COALESCE(?, name), 
         is_done = COALESCE(?, is_done),
         description = COALESCE(?, description), 
         due_date = COALESCE(?, due_date), 
         tag_id = COALESCE(?, tag_id) 
     WHERE id = ? AND user_id = ?`,
      [name, is_done, description, due_date, tag_id, req.params.id, req.userId]
    );

    res.status(200).json({ success: true });
  }
);

router.delete(
  '/tasks/:id',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    res.status(204).send();
  }
);
