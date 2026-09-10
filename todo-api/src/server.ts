import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { router } from './router.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const SECRET = process.env.APP_SECRET;

app.use(cors());
app.use(express.json());

// Montage des routes
app.use(router);

app.listen(PORT, () => {
  console.log(`Serveur prêt sur http://localhost:${PORT}`);
});
