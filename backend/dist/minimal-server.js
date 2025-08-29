"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Backend Railway minimal - para debug
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
// CORS simplificado
const corsOptions = {
    origin: true, // Permite qualquer origem temporariamente
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Health check simples
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Sapere Minimal API',
        version: '1.0.0'
    });
});
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Sapere Minimal API',
        version: '1.0.0',
        cors: 'enabled'
    });
});
// Rota de login mock para testar CORS
app.post('/api/auth/login', (req, res) => {
    console.log('Login request received:', req.body);
    res.json({
        success: true,
        token: 'test_token_' + Date.now(),
        user: {
            id: '1',
            email: req.body.login || 'test@test.com',
            name: 'Test User',
            role: 'admin'
        },
        message: 'Mock login successful from Railway'
    });
});
// Rota de criação de usuário mock
app.post('/api/admin/users', (req, res) => {
    console.log('Create user request:', req.body);
    res.json({
        success: true,
        user: {
            id: 'user_' + Date.now(),
            name: req.body.name || 'New User',
            email: req.body.email || 'new@test.com',
            role: req.body.role || 'therapist',
            status: 'active',
            created_at: new Date().toISOString()
        },
        message: 'Mock user created successfully from Railway'
    });
});
// Listar usuários mock
app.get('/api/admin/users', (_req, res) => {
    res.json({
        success: true,
        users: [
            {
                id: '1',
                name: 'Admin User',
                email: 'admin@test.com',
                role: 'admin',
                status: 'active',
                created_at: new Date().toISOString()
            }
        ],
        total: 1
    });
});
// Catch all
app.use((req, res) => {
    console.log('Route not found:', req.method, req.path);
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`🚀 Minimal Sapere API running on port ${PORT}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS: Enabled for all origins (debug mode)`);
});
exports.default = app;
//# sourceMappingURL=minimal-server.js.map