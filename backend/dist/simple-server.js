"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3003; // Usar porta diferente
// Middlewares mínimos
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rotas
app.use('/api/auth', auth_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handler
app.use((error, req, res, next) => {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=simple-server.js.map