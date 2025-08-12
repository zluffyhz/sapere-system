const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Nova hash para admin123:', hash);
  
  // Verificar se funciona
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash válido:', isValid);
}

generateHash();