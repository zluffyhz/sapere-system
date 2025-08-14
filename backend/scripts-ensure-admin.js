// backend/scripts-ensure-admin.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function ensureAdminUser() {
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

    // Dados do admin padrão
    const adminEmail = 'admin@sapere.com.br';
    const adminPassword = 'Sapere@2025';
    const adminName = 'Administrador Sapere';

    // Verificar se o admin já existe
    const checkQuery = 'SELECT id, email, role FROM users WHERE email = $1';
    const checkResult = await client.query(checkQuery, [adminEmail]);

    if (checkResult.rows.length > 0) {
      console.log('ℹ️  Usuário admin já existe:', adminEmail);
      
      // Atualizar para garantir que é admin e está ativo
      const updateQuery = `
        UPDATE users 
        SET role = 'admin', 
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = $1
        RETURNING id, email, role;
      `;
      
      const updateResult = await client.query(updateQuery, [adminEmail]);
      console.log('✅ Admin atualizado:', updateResult.rows[0]);
    } else {
      // Criar hash da senha
      console.log('🔄 Criando hash da senha...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Inserir novo admin
      const insertQuery = `
        INSERT INTO users (name, email, password, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, role;
      `;
      
      const insertResult = await client.query(insertQuery, [
        adminName,
        adminEmail,
        hashedPassword,
        'admin',
        true
      ]);
      
      console.log('✅ Admin criado com sucesso:', insertResult.rows[0]);
    }

    // Listar todos os usuários admin para confirmação
    const listAdminsQuery = `
      SELECT id, name, email, role, is_active, created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at;
    `;
    
    const adminsResult = await client.query(listAdminsQuery);
    console.log('\n📊 Usuários admin no sistema:');
    adminsResult.rows.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.name}) - Ativo: ${admin.is_active}`);
    });

    // Verificar total de usuários
    const countQuery = 'SELECT COUNT(*) as total FROM users';
    const countResult = await client.query(countQuery);
    console.log(`\n📈 Total de usuários no sistema: ${countResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Erro ao garantir admin:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔒 Conexão com banco fechada.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  ensureAdminUser();
}

module.exports = { ensureAdminUser };