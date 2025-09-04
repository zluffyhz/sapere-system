import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = 3003; // Usar porta diferente

// Middlewares mínimos
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', error);
  res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});