import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração: Apenas PostgreSQL
const usePostgres = true;

console.log('🔧 Configuração do banco de dados:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');
console.log('   DB_HOST:', process.env.DB_HOST || 'Não configurado');
console.log('   📊 Banco escolhido: 🐘 PostgreSQL');

let pool: Pool;

// Configuração PostgreSQL
const databaseConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sapere_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    };

pool = new Pool({
  ...databaseConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


// Mostrar configuração do banco
console.log('🗄️  Configuração de banco:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DATABASE_URL:', process.env.DATABASE_URL);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   🐘 Configurando PostgreSQL...');

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

export default pool;