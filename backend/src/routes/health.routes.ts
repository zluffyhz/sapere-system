import { Router, Request, Response } from 'express';
import { Client } from 'pg';

const router = Router();

// Configuração do cliente PostgreSQL
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

// Health check básico
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check com verificação de banco de dados
router.get('/db', async (req: Request, res: Response) => {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    // Teste simples de query
    const result = await client.query('SELECT NOW() as current_time');
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      db_time: result.rows[0].current_time
    });
    
  } catch (error) {
    console.error('Erro no health check do banco:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  } finally {
    await client.end();
  }
});

export default router;