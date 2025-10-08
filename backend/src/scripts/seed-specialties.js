// Script para criar especialidades iniciais
const { query } = require('../database/config/database');
const { v4: uuidv4 } = require('uuid');

async function seedSpecialties() {
  try {
    console.log('🌱 Criando especialidades iniciais...');
    
    const specialties = [
      { name: 'Neuropsicologia', description: 'Avaliação e reabilitação neuropsicológica', category: 'neuropsicologia', icon: 'brain', color: '#8B5CF6' },
      { name: 'TDAH', description: 'Transtorno do Déficit de Atenção com Hiperatividade', category: 'comportamental', icon: 'focus', color: '#3B82F6' },
      { name: 'Terapia TEA', description: 'Transtorno do Espectro Autista', category: 'comportamental', icon: 'heart', color: '#10B981' },
      { name: 'Avaliação Neuropsicológica', description: 'Avaliação cognitiva completa', category: 'neuropsicologia', icon: 'clipboard', color: '#F59E0B' },
      { name: 'Dislexia', description: 'Transtorno específico de aprendizagem', category: 'aprendizagem', icon: 'book', color: '#EF4444' },
      { name: 'Psicoterapia Infantil', description: 'Psicoterapia para crianças', category: 'infantil', icon: 'star', color: '#EC4899' },
      { name: 'Ludoterapia', description: 'Terapia através do brincar', category: 'infantil', icon: 'gamepad2', color: '#06B6D4' }
    ];
    
    for (const specialty of specialties) {
      const { name, description, category, icon, color } = specialty;
      const id = uuidv4();
      
      const result = await query(`
        INSERT INTO specialties (id, name, description, category, icon, color, active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
        RETURNING *
      `, [id, name, description, category, icon, color]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Especialidade criada: ${name}`);
      } else {
        console.log(`ℹ️  Especialidade já existe: ${name}`);
      }
    }
    
    console.log('🎉 Especialidades iniciais processadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar especialidades:', error);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  seedSpecialties()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedSpecialties };