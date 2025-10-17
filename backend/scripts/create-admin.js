const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createAdmin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'sapere_development',
    user: process.env.DB_USER || 'cesarhenrique',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await client.connect();
    console.log('📦 Conectado ao banco de dados');

    // Verificar se já existe admin
    const checkQuery = `
      SELECT id, email FROM users WHERE email = 'admin@sapere.com'
    `;
    const checkResult = await client.query(checkQuery);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Usuário admin já existe!');
      console.log('Email:', checkResult.rows[0].email);
      console.log('ID:', checkResult.rows[0].id);
      return;
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Senha criptografada');

    // Criar usuário admin
    const insertQuery = `
      INSERT INTO users (
        email, password, name, phone, role, status, bio, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING id, email, name, role
    `;

    const values = [
      'admin@sapere.com',
      hashedPassword,
      'Administrador Sapere',
      '(11) 99999-9999',
      'admin',
      'active',
      'Administrador do sistema Sapere'
    ];

    const result = await client.query(insertQuery, values);
    const admin = result.rows[0];

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     CREDENCIAIS DE ACESSO              ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║ Email:    admin@sapere.com             ║');
    console.log('║ Senha:    admin123                     ║');
    console.log('║ Role:     ADMIN                        ║');
    console.log('║ Status:   ACTIVE                       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('ID do usuário:', admin.id);

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

// Executar
createAdmin()
  .then(() => {
    console.log('🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na execução:', error);
    process.exit(1);
  });
