import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// IMPORTANTE: Configurar trust proxy ANTES de qualquer middleware
// Isso é essencial para o Railway funcionar corretamente
app.set('trust proxy', 1);

// Configuração de CORS
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'https://sapere-system.vercel.app'
    ];
    
    // Permitir requisições sem origin (ex: Postman, aplicativos mobile)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Segurança básica
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP em API
  crossOriginEmbedderPolicy: false
}));

// Configuração de Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  // IMPORTANTE: configurações para funcionar atrás de proxy
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Usar o IP real quando atrás de proxy
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições. Aguarde 15 minutos.'
    });
  }
});

// Rate limit mais restritivo para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // apenas 5 tentativas de login
  message: 'Muitas tentativas de login. Aguarde 15 minutos.',
  skipSuccessfulRequests: true, // não contar logins bem-sucedidos
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limit geral
app.use('/api/', limiter);

// Middlewares para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simples para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path === '/api/auth/login') {
    console.log('Login attempt from IP:', req.ip);
  }
  next();
});

// Rotas
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Aplicar rate limit específico para login
app.use('/api/auth/login', loginLimiter);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Sapere System API',
    status: 'operational',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login'
    }
  });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  
  if (err.message === 'Não permitido pelo CORS') {
    return res.status(403).json({ error: 'CORS: Origem não permitida' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Sapere System API - Produção      ║
╠════════════════════════════════════════╣
║ 🚀 Servidor rodando na porta: ${PORT}    ║
║ 🔧 Ambiente: ${process.env.NODE_ENV || 'development'}          ║
║ 🔒 Trust Proxy: Ativado                ║
║ 🌐 CORS Origins:                       ║`);
  
  const origins = process.env.CORS_ORIGINS?.split(',') || [];
  origins.forEach(origin => {
    console.log(`║    - ${origin.padEnd(33)} ║`);
  });
  
  console.log(`╚════════════════════════════════════════╝
  `);
});

export default app;