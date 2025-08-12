import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../database/config/database';
import { UserRole } from '../types/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: string;
    phone?: string;
    last_login_at?: Date;
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ 
        error: 'Token de acesso requerido',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Buscar dados atualizados do usuário
    const result = await query(
      `SELECT id, email, name, role, status, phone, last_login_at 
       FROM users 
       WHERE id = ? AND status = 'active'`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ 
        error: 'Usuário não encontrado ou inativo',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const user = result.rows[0];

    // Verificar se o role no token ainda é válido
    if (user.role !== decoded.role) {
      res.status(401).json({ 
        error: 'Permissões alteradas. Faça login novamente.',
        code: 'ROLE_CHANGED'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    console.error('Erro na autenticação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
    return;
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Acesso negado. Roles permitidos: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
      return;
    }

    next();
  };
};

// Middleware específicos para roles comuns
export const requireAdmin = requireRole(['admin']);
export const requireTherapist = requireRole(['therapist']);
export const requireGuardian = requireRole(['responsible']); // 'responsible' no DB = 'guardian' no frontend
export const requireTherapistOrAdmin = requireRole(['admin', 'therapist']);
export const requireAnyRole = requireRole(['admin', 'therapist', 'responsible']);

// Middleware para verificar se o usuário pode acessar dados de um paciente específico
export const canAccessPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const patientId = req.params.patientId || req.body.patient_id;
    
    if (!patientId) {
      return res.status(400).json({ error: 'ID do paciente é obrigatório' });
    }

    // Admin, profissional e therapist têm acesso a todos os pacientes
    if (req.user.role === 'admin' || req.user.role === 'profissional' || req.user.role === 'therapist') {
      return next();
    }

    // Guardian só pode acessar pacientes sob sua responsabilidade
    if (req.user.role === 'responsible') {
      const result = await query(
        'SELECT id FROM patients WHERE id = ? AND responsible_users LIKE ? AND active = 1',
        [patientId, `%"${req.user.id}"%`]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para acessar este paciente',
          code: 'PATIENT_ACCESS_DENIED'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar acesso ao paciente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Alias para compatibilidade
export const auth = authenticateToken;

// Middleware para log de atividades
export const logActivity = (action: string, resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log apenas se a operação foi bem-sucedida (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = req.params.id || req.body.id || null;
        
        // Log assíncrono para não bloquear a resposta
        setImmediate(async () => {
          try {
            await query(
              `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, new_values)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                req.user?.id || null,
                action,
                resourceType,
                resourceId,
                req.ip,
                req.get('User-Agent') || null,
                req.method === 'GET' ? null : JSON.stringify(req.body)
              ]
            );
          } catch (error) {
            console.error('Erro ao registrar atividade:', error);
          }
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};