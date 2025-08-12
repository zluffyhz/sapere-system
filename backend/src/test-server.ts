import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());

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
  } else {
    res.status(401).json({ error: 'Email ou senha inválidos' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
});