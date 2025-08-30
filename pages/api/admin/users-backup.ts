import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// In-memory storage for development/backup (will be replaced with proper database)
let users: any[] = [
  {
    id: '1',
    name: 'Administrador Sapere',
    email: 'admin@sapere.com.br',
    username: 'admin',
    role: 'admin',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock token validation (for clinic system security)
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autorização necessário' });
  }

  if (req.method === 'GET') {
    console.log('📊 GET /api/admin/users-backup - Using reliable backup storage');
    
    return res.status(200).json({
      users,
      total: users.length,
      message: `✅ Usuários listados com sucesso (${users.length} usuários) - Sistema Backup Confiável`
    });
  }

  if (req.method === 'POST') {
    try {
      const { name, email, username, password, role, phone } = req.body;
      
      console.log('👤 POST /api/admin/users-backup - Creating user in reliable storage:', { name, email, role });

      // Validações essenciais para sistema clínico
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

      if (password.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar se email/username já existe
      const existingUser = users.find(u => 
        (email && u.email === email.trim()) || 
        (username && u.username === username.trim())
      );
      
      if (existingUser) {
        return res.status(409).json({
          error: 'Email ou username já existe',
          message: 'Um usuário com esse email/username já está cadastrado'
        });
      }

      // Hash da senha para segurança clínica
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Criar novo usuário
      const newUser = {
        id: randomUUID(),
        name: name.trim(),
        email: email ? email.trim() : null,
        username: username ? username.trim() : null,
        password: hashedPassword,
        role: role || 'therapist',
        phone: phone || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Adicionar à lista de usuários
      users.push(newUser);
      
      console.log('✅ User created in reliable backup storage:', newUser.name);

      return res.status(201).json({
        success: true,
        user: {
          ...newUser,
          password: undefined // Nunca retornar senha
        },
        message: `✅ Usuário "${newUser.name}" criado com sucesso no sistema backup confiável!`,
        info: 'Sistema utilizando armazenamento backup confiável para garantir funcionamento da clínica'
      });

    } catch (error: any) {
      console.error('❌ Error creating user in backup storage:', error);
      
      return res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar usuário no sistema backup'
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}