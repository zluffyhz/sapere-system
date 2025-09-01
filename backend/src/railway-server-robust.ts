// backend/src/railway-server-robust.ts - VERSÃO ROBUSTA COM POSTGRESQL
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// IMPORTANTE: Configurar trust proxy ANTES de qualquer middleware
app.set('trust proxy', 1);

// Logs de inicialização
console.log('🚀 Starting Sapere System API - Railway Production');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🗄️ DATABASE_URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');

// Configuração de CORS
const allowedOrigins = [
  'https://sapere-system.vercel.app',
  'https://sapere-system-nlswnpxqj-zluffyhzs-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001'
];

if (process.env.CORS_ORIGINS) {
  const envOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

console.log('🌐 CORS Origins configured:', allowedOrigins.length);

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
      if (process.env.NODE_ENV === 'production' && (
        origin.includes('vercel.app') || 
        origin.includes('netlify.app') ||
        origin.includes('sapere-system')
      )) {
        console.log('✅ CORS permitido para:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS bloqueado para:', origin);
        callback(null, false);
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

app.use('/api/', limiter);

// Middlewares para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'no-origin'}`);
  next();
});

// Health check SIMPLES (sem dependência do banco)
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sapere System API - Railway',
    version: '1.0.0',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sapere System API - Railway',
    version: '1.0.0',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

// Importar rotas com error handling
let authRoutes: any = null;
let adminRoutes: any = null;
let patientsRoutes: any = null;
let appointmentsRoutes: any = null;

try {
  authRoutes = require('./routes/auth.routes').default;
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error);
}

try {
  adminRoutes = require('./routes/admin').default;
  console.log('✅ Admin routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error);
}

try {
  patientsRoutes = require('./routes/patients').default;
  console.log('✅ Patients routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load patients routes:', error);
}

try {
  appointmentsRoutes = require('./routes/appointments').default;
  console.log('✅ Appointments routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load appointments routes:', error);
}

// Usar rotas se disponíveis
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered');
}

if (adminRoutes) {
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes registered');
}

if (patientsRoutes) {
  app.use('/api/patients', patientsRoutes);
  console.log('✅ Patients routes registered');
}

if (appointmentsRoutes) {
  app.use('/api/appointments', appointmentsRoutes);
  console.log('✅ Appointments routes registered');
}

// As rotas reais são gerenciadas pelos controladores
// Os mocks foram removidos - usando somente PostgreSQL via controladores

// Rota base da API
app.get('/api', (req, res) => {
  res.json({
    message: 'Sapere System API - Railway PostgreSQL',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      login: 'POST /api/auth/login',
      users: 'GET/POST /api/admin/users'
    }
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Sapere System API - Railway PostgreSQL',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  console.log('❌ Route not found:', req.method, req.path);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 GLOBAL ERROR:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Graceful error handling
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err);
});

// Iniciar servidor
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Sapere System API - Railway       ║
╠════════════════════════════════════════╣
║ 🚀 Server running on port: ${PORT}         ║
║ 🔧 Environment: ${process.env.NODE_ENV || 'development'}         ║
║ 🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Mock'}           ║
║ 🌐 CORS: ${allowedOrigins.length} origins allowed     ║
║ ✅ API Ready for production           ║
╚════════════════════════════════════════╝
  `);
});

export default app;