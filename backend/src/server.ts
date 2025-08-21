// backend/src/server.ts - VERSÃO CORRIGIDA
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
app.set('trust proxy', 1);

// Configuração de CORS SIMPLIFICADA E FUNCIONAL
const allowedOrigins = [
  'https://sapere-system.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001'
];

// Se CORS_ORIGINS estiver configurado, usar ele
if (process.env.CORS_ORIGINS) {
  const envOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

console.log('CORS Origins permitidas:', allowedOrigins);

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Permitir requisições sem origin (Postman, curl, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar se a origem está na lista de permitidas
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Em produção, ser mais permissivo com Vercel
      if (process.env.NODE_ENV === 'production' && origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        console.log('CORS bloqueado para origem:', origin);
        callback(null, false); // Mudança importante: false ao invés de Error
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Segurança básica
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limit
app.use('/api/', limiter);

// Middlewares para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'no-origin'}`);
  next();
});

// Rotas
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Rate limit específico para login DEPOIS das rotas
app.use('/api/auth/login', loginLimiter);

// Rota base da API
app.get('/api', (req, res) => {
  res.json({
    message: 'Sapere System API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      login: 'POST /api/auth/login',
      verify: 'GET /api/auth/verify'
    }
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Sapere System API',
    status: 'operational',
    version: '1.0.0'
  });
});

// ✅ Healthcheck simples
app.get("/health", (req, res) => {
  return res.json({ ok: true });
});

// ✅ /me mínimo só para destravar o front
app.get("/me", (req, res) => {
  return res.json({
    user: { id: "u_1", name: "Usuário", email: "user@example.com" }
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

// Tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro no servidor:', err.message);
  
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
║ 🌐 CORS configurado para ${allowedOrigins.length} origins    ║
╚════════════════════════════════════════╝
  `);
});

export default app;