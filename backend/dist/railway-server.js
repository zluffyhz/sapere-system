"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/railway-server.ts - VERSÃO CORRIGIDA
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
// Carregar variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
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
    origin: function (origin, callback) {
        // Permitir requisições sem origin (Postman, curl, etc)
        if (!origin) {
            return callback(null, true);
        }
        // Verificar se a origem está na lista de permitidas
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            // Em produção, ser mais permissivo com Vercel
            if (process.env.NODE_ENV === 'production' && origin.includes('vercel.app')) {
                callback(null, true);
            }
            else {
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
app.use((0, cors_1.default)(corsOptions));
// Segurança básica
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
});
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});
// Aplicar rate limit
app.use('/api/', limiter);
// Middlewares para parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'no-origin'}`);
    next();
});
// Rotas
app.use('/api/health', health_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
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
// === ALIAS NA RAIZ (fora de /api) — ADICIONE ANTES DO 404 ===
app.get("/health", (_req, res) => {
    return res.json({ ok: true });
});
app.get("/me", (_req, res) => {
    // Dummy só para destravar as abas. Depois você pode trocar por auth real.
    return res.json({
        user: { id: "u_1", name: "Usuário", email: "user@example.com" }
    });
});
// === FIM DOS ALIAS ===
// Tratamento de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method
    });
});
// Tratamento de erros
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=railway-server.js.map