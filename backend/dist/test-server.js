"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3004;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rota de teste básica
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Rota de login de teste sem banco
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@sapere.com.br' && password === 'admin123') {
        res.json({
            message: 'Login realizado com sucesso',
            token: 'test-token-123',
            user: {
                id: '1',
                email: email,
                name: 'Admin Teste',
                role: 'admin'
            }
        });
    }
    else {
        res.status(401).json({ error: 'Email ou senha inválidos' });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
});
//# sourceMappingURL=test-server.js.map