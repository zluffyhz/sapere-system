"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Carregar rotas
const auth_1 = __importDefault(require("./routes/auth"));
const anamnese_1 = __importDefault(require("./routes/anamnese"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3002;
// Rate limiting mais rigoroso para produção
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 50 : 100, // Menos requests em produção
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});
// Middlewares de segurança
app.use((0, helmet_1.default)({
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
app.use((0, compression_1.default)());
app.use(limiter);
// Logging configurável
if (process.env.NODE_ENV === 'production') {
    app.use((0, morgan_1.default)('combined'));
}
else {
    app.use((0, morgan_1.default)('dev'));
}
// CORS configurável para produção
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://seu-dominio.com' // Substituir pelo domínio real
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sem origin (mobile apps, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body parsing com limites
app.use(express_1.default.json({
    limit: process.env.NODE_ENV === 'production' ? '1mb' : '10mb'
}));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Criar diretórios necessários
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const backupDir = process.env.BACKUP_DIR || './backups';
[uploadDir, backupDir].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
        console.log(`📁 Diretório criado: ${dir}`);
    }
});
// Servir arquivos estáticos
app.use('/uploads', express_1.default.static(path_1.default.resolve(uploadDir)));
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
app.use('/api/auth', auth_1.default);
app.use('/api/anamneses', anamnese_1.default);
// Servir frontend estático em produção
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path_1.default.join(__dirname, '../../frontend/dist');
    if (fs_1.default.existsSync(frontendPath)) {
        app.use(express_1.default.static(frontendPath));
        // Fallback para SPA routing
        app.get('*', (req, res) => {
            if (!req.path.startsWith('/api/')) {
                res.sendFile(path_1.default.join(frontendPath, 'index.html'));
            }
            else {
                res.status(404).json({ error: 'Rota da API não encontrada' });
            }
        });
    }
}
else {
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
app.use((error, req, res, next) => {
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
const gracefulShutdown = (signal) => {
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
            }
            else {
                console.log('🔧 Modo desenvolvimento');
                console.log('👥 Usuários de teste disponíveis:');
                console.log('   admin@sapere.com.br (senha: admin123)');
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=production-server.js.map