const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function createSuamy() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'sapere_development',
    user: 'cesarhenrique',
    password: '',
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    console.log('🔄 Criando usuária Suamy...');

    // Verificar se já existe
    const checkQuery = 'SELECT id, email, name, role FROM users WHERE email = $1';
    const checkResult = await client.query(checkQuery, ['suamy@sapere.com']);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Usuária Suamy já existe!');
      console.log('Email:', checkResult.rows[0].email);
      console.log('Nome:', checkResult.rows[0].name);
      console.log('Role:', checkResult.rows[0].role);
      console.log('ID:', checkResult.rows[0].id);
      return;
    }

    // Criar hash da senha
    console.log('🔐 Criando hash da senha...');
    const password = await bcrypt.hash('suamy123', 10);

    // Inserir nova usuária
    const userId = uuidv4();
    const insertQuery = `
      INSERT INTO users (
        id, email, username, password, name, phone, role, status,
        "professionalId", specialties, bio, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, name, role, status;
    `;

    const insertResult = await client.query(insertQuery, [
      userId,
      'suamy@sapere.com',
      'suamy',
      password,
      'Suamy',
      '(11) 98888-8888',
      'THERAPIST',
      'ACTIVE',
      'PSI001',
      ['Psicologia', 'TCC'],
      'Psicóloga especializada em neurodivergentes'
    ]);

    const user = insertResult.rows[0];

    console.log('✅ Suamy criada com sucesso!');
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     CREDENCIAIS DE ACESSO              ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║ Email:    suamy@sapere.com             ║');
    console.log('║ Senha:    suamy123                     ║');
    console.log('║ Role:     THERAPIST                    ║');
    console.log('║ Status:   ACTIVE                       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('ID:', user.id);

  } catch (error) {
    console.error('❌ Erro ao criar usuária:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔒 Conexão com banco fechada.');
  }
}

createSuamy()
  .then(() => {
    console.log('🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na execução:', error);
    process.exit(1);
  });
