import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Carregar rotas
import authRoutes from './routes/auth';
import anamneseRoutes from './routes/anamnese';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3002;

// Rate limiting mais rigoroso para produção
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 50 : 100, // Menos requests em produção
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(compression());
app.use(limiter);

// Logging configurável
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// CORS configurável para produção
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://seu-dominio.com' // Substituir pelo domínio real
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing com limites
app.use(express.json({ 
  limit: process.env.NODE_ENV === 'production' ? '1mb' : '10mb'
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Criar diretórios necessários
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const backupDir = process.env.BACKUP_DIR || './backups';

[uploadDir, backupDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Diretório criado: ${dir}`);
  }
});

// Servir arquivos estáticos
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Health check da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/anamneses', anamneseRoutes);

// Servir frontend estático em produção
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    // Fallback para SPA routing
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
      } else {
        res.status(404).json({ error: 'Rota da API não encontrada' });
      }
    });
  }
} else {
  // Em desenvolvimento, apenas health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });
}

// 404 handler para API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Rota da API não encontrada' });
});

// Error handler global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro no servidor:', error);
  
  // Log detalhado apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.error('Stack trace:', error.stack);
  }
  
  // Não vazar informações em produção
  const errorResponse = process.env.NODE_ENV === 'production' 
    ? { error: 'Erro interno do servidor' }
    : { error: 'Erro interno do servidor', details: error.message };
    
  res.status(500).json(errorResponse);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Recebido ${signal}. Encerrando gracefully...`);
  
  server.close(() => {
    console.log('✅ Servidor HTTP encerrado.');
    process.exit(0);
  });
  
  // Forçar saída após 10 segundos
  setTimeout(() => {
    console.log('⚠️  Forçando encerramento após timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Tratar exceções não capturadas
process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Iniciar servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando Servidor Sapere...');
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Memória disponível: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`);
    
    server.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🔒 Modo produção ativo');
      } else {
        console.log('🔧 Modo desenvolvimento');
        console.log('👥 Usuários de teste disponíveis:');
        console.log('   admin@sapere.com.br (senha: admin123)');
      }
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();