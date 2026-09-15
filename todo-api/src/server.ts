import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { router } from './router.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Configuration CORS explicite pour la prod et le local
const corsOptions = {
  origin: [
    'https://react-todo-app.frederickagathe.fr',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Montage des routes
app.use(router);

app.listen(PORT, () => {
  console.log(`Serveur prêt sur http://localhost:${PORT}`);
});
