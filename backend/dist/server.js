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
const syncService_1 = __importDefault(require("./services/syncService"));
const backupService_1 = __importDefault(require("./services/backupService"));
const createDefaultUsers_1 = require("./scripts/createDefaultUsers");
const auth_1 = __importDefault(require("./routes/auth"));
const protected_1 = __importDefault(require("./routes/protected"));
const anamnese_1 = __importDefault(require("./routes/anamnese"));
const therapists_1 = __importDefault(require("./routes/therapists"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3002;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo 100 requests por IP por janela
});
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(limiter);
app.use((0, morgan_1.default)('combined'));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Criar diretório de uploads se não existir
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Servir arquivos estáticos (uploads)
app.use('/uploads', express_1.default.static(path_1.default.resolve(uploadDir)));
// Rotas
app.use('/api/auth', auth_1.default);
app.use('/api/protected', protected_1.default);
app.use('/api/anamneses', anamnese_1.default);
app.use('/api/therapists', therapists_1.default);
app.use('/api/admin', admin_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
// Error handler
app.use((error, req, res, next) => {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
});
// Inicializar banco de dados e iniciar servidor
const startServer = async () => {
    try {
        // Inicializar serviço de sincronização
        syncService_1.default.initialize(server);
        // Inicializar serviço de backup
        await backupService_1.default.initialize();
        // Modo PostgreSQL apenas
        console.log('🔧 Sistema configurado para usar PostgreSQL exclusivamente');
        // Criar usuários padrão
        try {
            await (0, createDefaultUsers_1.createDefaultUsers)();
        }
        catch (error) {
            console.warn('⚠️ Erro ao criar usuários padrão (pode já existirem):', error.message);
        }
        server.listen(PORT, () => {
            console.log(`🚀 Servidor Sapere rodando na porta ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/health`);
            console.log(`🔄 WebSocket para sincronização ativo`);
        });
    }
    catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map