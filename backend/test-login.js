const axios = require('axios');
const bcrypt = require('bcryptjs');

async function testDatabase() {
  console.log('🔍 Testando conexão com banco...');
  
  // Testar se a senha hash está correta
  const testPassword = 'admin123';
  const storedHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  const isValid = await bcrypt.compare(testPassword, storedHash);
  console.log('Hash da senha válido:', isValid);
}

async function testLogin() {
  try {
    console.log('🚀 Testando login...');
    
    const response = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'admin@sapere.com.br',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', response.data.token?.substring(0, 50) + '...');
    console.log('Usuário:', response.data.user?.name);
    
  } catch (error) {
    console.error('❌ Erro no login:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar testes
testDatabase().then(() => {
  setTimeout(testLogin, 1000);
});