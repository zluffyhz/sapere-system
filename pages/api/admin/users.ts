import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage (will persist during function lifecycle)
let usersStore = [
  {
    id: '1',
    name: 'Administrador Sapere',
    email: 'admin@sapere.com.br',
    role: 'admin',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Usuário Teste',
    email: 'teste@sapere.com.br',
    role: 'therapist',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock token validation
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autorização necessário' });
  }

  if (req.method === 'GET') {
    // List users from persistent store
    console.log('📊 GET /api/admin/users - Current users count:', usersStore.length);
    
    return res.status(200).json({
      users: usersStore,
      total: usersStore.length,
      message: `Usuários listados com sucesso via Vercel API (${usersStore.length} usuários)`
    });
  }

  if (req.method === 'POST') {
    // Create user
    const { name, email, username, password, role, phone } = req.body;
    
    console.log('Vercel API Create user:', { name, email, role });

    if (!name || !password) {
      return res.status(400).json({
        error: 'Nome e senha são obrigatórios',
        message: 'Campos obrigatórios não preenchidos'
      });
    }

    if (!email && !username) {
      return res.status(400).json({
        error: 'Email ou username é obrigatório',
        message: 'Pelo menos um identificador é necessário'
      });
    }

    const newUser = {
      id: `vercel_user_${Date.now()}`,
      name: name.trim(),
      email: email || null,
      username: username || null,
      role: role || 'therapist',
      phone: phone || null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add user to persistent store
    usersStore.push(newUser);
    
    console.log('✅ POST /api/admin/users - User created:', newUser.name);
    console.log('📊 Total users now:', usersStore.length);

    return res.status(201).json({
      success: true,
      user: newUser,
      message: `✅ Usuário "${newUser.name}" criado com sucesso via Vercel API! (Total: ${usersStore.length} usuários)`
    });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}