import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// PostgreSQL connection for Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:VDcOBkKZgxgSPXPrYJXE@containers-us-west-140.railway.app:5432/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Function to execute queries
async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    console.log('✅ PostgreSQL query successful:', text.substring(0, 50));
    return result;
  } catch (error) {
    console.error('❌ PostgreSQL query failed:', error);
    throw error;
  }
}

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
    try {
      console.log('📊 GET /api/admin/users - Fetching from PostgreSQL');
      
      const result = await query(
        'SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      
      const users = result.rows;
      console.log('✅ Users fetched from PostgreSQL:', users.length);
      
      return res.status(200).json({
        users,
        total: users.length,
        message: `Usuários listados com sucesso via PostgreSQL (${users.length} usuários)`
      });
    } catch (error) {
      console.error('❌ Error fetching users from PostgreSQL:', error);
      
      // Fallback to mock data if PostgreSQL fails
      const fallbackUsers = [
        {
          id: '1',
          name: 'Administrador Sapere',
          email: 'admin@sapere.com.br',
          role: 'admin',
          status: 'active',
          created_at: '2025-01-01T00:00:00.000Z'
        }
      ];
      
      return res.status(200).json({
        users: fallbackUsers,
        total: fallbackUsers.length,
        message: 'Usuários listados (modo fallback - PostgreSQL indisponível)',
        warning: 'Conexão PostgreSQL falhou, usando dados mock'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, email, username, password, role, phone } = req.body;
      
      console.log('👤 POST /api/admin/users - Creating user in PostgreSQL:', { name, email, role });

      // Validações
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

      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserir usuário no PostgreSQL
      const insertResult = await query(
        `INSERT INTO users (name, email, username, password, role, phone, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'active') 
         RETURNING id, name, email, username, role, phone, status, created_at, updated_at`,
        [
          name.trim(),
          email ? email.trim() : null,
          username ? username.trim() : null,
          hashedPassword,
          role || 'therapist',
          phone || null
        ]
      );

      const newUser = insertResult.rows[0];
      console.log('✅ User created in PostgreSQL:', newUser.name);

      return res.status(201).json({
        success: true,
        user: {
          ...newUser,
          password: undefined // Never return password
        },
        message: `✅ Usuário "${newUser.name}" criado com sucesso no PostgreSQL!`
      });

    } catch (error: any) {
      console.error('❌ Error creating user in PostgreSQL:', error);
      
      // Handle specific PostgreSQL errors
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'Email ou username já existe',
          message: 'Um usuário com esse email/username já está cadastrado'
        });
      }

      // Fallback mock creation if PostgreSQL fails
      const fallbackUser = {
        id: `fallback_user_${Date.now()}`,
        name: name.trim(),
        email: email || null,
        username: username || null,
        role: role || 'therapist',
        phone: phone || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        user: fallbackUser,
        message: `⚠️ Usuário "${fallbackUser.name}" criado em modo fallback (PostgreSQL indisponível)`,
        warning: 'Dados não foram salvos permanentemente'
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}