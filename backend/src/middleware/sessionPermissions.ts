import { Response, NextFunction } from 'express';
import { Client } from 'pg';
import { AuthRequest } from './auth';

const getDbClient = () => {
  return new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
};

// Middleware para verificar se o terapeuta pode acessar uma sessão específica
export const canAccessSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Admin pode acessar qualquer sessão
    if (req.user.role === 'admin') {
      return next();
    }

    const sessionId = req.params.id;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const client = getDbClient();
    await client.connect();

    try {
      // Buscar o therapist_id da sessão e verificar se corresponde ao usuário logado
      const query = `
        SELECT s.therapist_id, t.user_id 
        FROM sessions s
        JOIN therapists t ON s.therapist_id = t.id
        WHERE s.id = $1
      `;
      
      const result = await client.query(query, [sessionId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Sessão não encontrada',
          code: 'SESSION_NOT_FOUND'
        });
      }

      const session = result.rows[0];

      // Verificar se o usuário logado é o terapeuta desta sessão
      if (session.user_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para acessar esta sessão',
          code: 'SESSION_ACCESS_DENIED'
        });
      }

      next();
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Erro ao verificar acesso à sessão:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

// Middleware para verificar se o terapeuta pode iniciar uma sessão
export const canStartSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Admin pode iniciar sessão para qualquer terapeuta
    if (req.user.role === 'admin') {
      return next();
    }

    const { therapist_id } = req.body;
    
    if (!therapist_id) {
      return res.status(400).json({ error: 'therapist_id é obrigatório' });
    }

    const client = getDbClient();
    await client.connect();

    try {
      // Verificar se o therapist_id corresponde ao usuário logado
      const query = `
        SELECT user_id 
        FROM therapists 
        WHERE id = $1 AND active = true
      `;
      
      const result = await client.query(query, [therapist_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Terapeuta não encontrado ou inativo',
          code: 'THERAPIST_NOT_FOUND'
        });
      }

      const therapist = result.rows[0];

      // Verificar se o usuário logado é o terapeuta
      if (therapist.user_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'Você só pode iniciar sessões para si mesmo',
          code: 'THERAPIST_ACCESS_DENIED'
        });
      }

      next();
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Erro ao verificar permissão para iniciar sessão:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

// Middleware para verificar se o terapeuta pode acessar sessões de um terapeuta específico
export const canAccessTherapistSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Admin pode acessar sessões de qualquer terapeuta
    if (req.user.role === 'admin') {
      return next();
    }

    const { therapist_id } = req.params;
    
    if (!therapist_id) {
      return res.status(400).json({ error: 'therapist_id é obrigatório' });
    }

    const client = getDbClient();
    await client.connect();

    try {
      // Verificar se o therapist_id corresponde ao usuário logado
      const query = `
        SELECT user_id 
        FROM therapists 
        WHERE id = $1 AND active = true
      `;
      
      const result = await client.query(query, [therapist_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Terapeuta não encontrado ou inativo',
          code: 'THERAPIST_NOT_FOUND'
        });
      }

      const therapist = result.rows[0];

      // Verificar se o usuário logado é o terapeuta
      if (therapist.user_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'Você só pode acessar suas próprias sessões',
          code: 'THERAPIST_SESSIONS_ACCESS_DENIED'
        });
      }

      next();
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Erro ao verificar acesso às sessões do terapeuta:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};