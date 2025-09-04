// backend/scripts-create-users.js
const { Client } = require('pg');

async function createUsersTable() {
  // Configuração do banco usando variáveis de ambiente
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Criar tabela users se não existir
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('🔄 Criando tabela users...');
    await client.query(createTableQuery);
    console.log('✅ Tabela users criada/verificada com sucesso!');

    // Criar índice no email para melhorar performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;
    
    await client.query(createIndexQuery);
    console.log('✅ Índice no email criado/verificado!');

    // Verificar estrutura da tabela
    const checkTableQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(checkTableQuery);
    console.log('\n📊 Estrutura da tabela users:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔒 Conexão com banco fechada.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createUsersTable();
}

module.exports = { createUsersTable };