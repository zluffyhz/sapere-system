import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { login, password } = req.body;
  
  console.log('Vercel API Login attempt:', { login });

  // Mock authentication
  const validUsers = {
    'admin@sapere.com.br': 'Sapere@2025',
    'teste@sapere.com.br': 'Sapere@2025'
  };

  if (!validUsers[login as keyof typeof validUsers] || validUsers[login as keyof typeof validUsers] !== password) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      message: 'Email ou senha incorretos'
    });
  }

  const user = {
    id: login === 'admin@sapere.com.br' ? '1' : '2',
    email: login,
    name: login === 'admin@sapere.com.br' ? 'Administrador Sapere' : 'Usuário Teste',
    role: login === 'admin@sapere.com.br' ? 'admin' : 'therapist',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const token = `vercel_token_${Date.now()}_${Math.random()}`;

  res.status(200).json({
    token,
    user,
    message: 'Login realizado com sucesso via Vercel API!'
  });
}