import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

// PostgreSQL connection for testing
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:VDcOBkKZgxgSPXPrYJXE@containers-us-west-140.railway.app:5432/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      console.log('🔍 Testing PostgreSQL connection...');
      
      // Test basic connection
      const result = await pool.query('SELECT NOW() as current_time, version() as version');
      console.log('✅ Database connection successful');
      
      // Test if users table exists
      const tableCheck = await pool.query(`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      
      if (tableCheck.rows.length === 0) {
        console.log('⚠️ Users table does not exist, creating it...');
        
        // Create users table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE,
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'therapist',
            phone VARCHAR(20),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        console.log('✅ Users table created successfully');
      }
      
      // Recheck table structure
      const finalTableCheck = await pool.query(`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      
      return res.status(200).json({
        success: true,
        database_time: result.rows[0].current_time,
        database_version: result.rows[0].version,
        users_table_exists: finalTableCheck.rows.length > 0,
        table_columns: finalTableCheck.rows,
        message: '✅ Database connection and table setup successful!'
      });
      
    } catch (error: any) {
      console.error('❌ Database test failed:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message,
        message: '❌ Database connection failed'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}