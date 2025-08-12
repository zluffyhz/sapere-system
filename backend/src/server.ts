import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import syncService from './services/syncService';
import backupService from './services/backupService';

import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import anamneseRoutes from './routes/anamnese';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP por janela
});

// Middlewares
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Criar diretório de uploads se não existir
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/anamneses', anamneseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar banco de dados e iniciar servidor
const startServer = async () => {
  try {
    // Inicializar serviço de sincronização
    syncService.initialize(server);
    
    // Inicializar serviço de backup
    await backupService.initialize();
    
    // Migrations desabilitadas para desenvolvimento
    console.log('🔧 Modo desenvolvimento - usando banco SQLite com persistência');
    
    server.listen(PORT, () => {
      console.log(`🚀 Servidor Sapere rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔄 WebSocket para sincronização ativo`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();