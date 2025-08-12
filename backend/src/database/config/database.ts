import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

// Estratégia de banco:
// - Desenvolvimento: SQLite (simples, sem dependências)
// - Produção: PostgreSQL (escalável, robusto)
const usePostgres = process.env.NODE_ENV === 'production' || 
                   process.env.DATABASE_URL || 
                   (process.env.DB_HOST && process.env.DB_HOST !== '');

console.log('🔧 Configuração do banco de dados:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');
console.log('   DB_HOST:', process.env.DB_HOST || 'Não configurado');
console.log('   📊 Banco escolhido:', usePostgres ? '🐘 PostgreSQL' : '📁 SQLite');

let pool: Pool;
let sqliteDb: Database;
let isInitialized = false;

if (usePostgres) {
  // Configuração PostgreSQL para Railway ou produção
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
}

// Inicializar SQLite para desenvolvimento local
async function initSqlite() {
  if (!usePostgres && !isInitialized) {
    const dbPath = path.join(__dirname, '../../../sapere_dev.db');
    sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Criar todas as tabelas necessárias
    await sqliteDb.exec(`
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'therapist',
        status TEXT DEFAULT 'active',
        phone TEXT,
        cpf TEXT,
        birth_date TEXT,
        address TEXT,
        avatar_url TEXT,
        last_login_at TEXT,
        email_verified_at TEXT,
        phone_verified_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        created_by TEXT,
        updated_by TEXT
      );

      -- Tabela de terapeutas
      CREATE TABLE IF NOT EXISTS therapists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        professional_id TEXT,
        specialties TEXT,
        bio TEXT,
        experience_years INTEGER,
        languages TEXT,
        available_hours TEXT,
        consultation_duration INTEGER DEFAULT 60,
        max_daily_appointments INTEGER DEFAULT 8,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Tabela de pacientes
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        social_name TEXT,
        email TEXT,
        phone TEXT,
        birth_date TEXT,
        cpf TEXT,
        rg TEXT,
        gender TEXT,
        address TEXT,
        diagnosis TEXT,
        medications TEXT,
        allergies TEXT,
        special_needs TEXT,
        school_info TEXT,
        work_info TEXT,
        responsible_users TEXT,
        emergency_contacts TEXT,
        general_notes TEXT,
        internal_notes TEXT,
        active INTEGER DEFAULT 1,
        first_appointment_at TEXT,
        last_appointment_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        created_by TEXT,
        updated_by TEXT
      );

      -- Tabela de consultas
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        therapist_id TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        duration INTEGER DEFAULT 60,
        timezone TEXT DEFAULT 'America/Manaus',
        status TEXT DEFAULT 'scheduled',
        confirmed_by_patient INTEGER DEFAULT 0,
        confirmed_at TEXT,
        confirmation_attempts INTEGER DEFAULT 0,
        appointment_type TEXT,
        session_number INTEGER,
        notes TEXT,
        original_appointment_id TEXT,
        rescheduled_reason TEXT,
        rescheduled_at TEXT,
        rescheduled_by TEXT,
        cancelled_reason TEXT,
        cancelled_at TEXT,
        cancelled_by TEXT,
        reminder_sent_at TEXT,
        reminder_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        created_by TEXT,
        updated_by TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (therapist_id) REFERENCES therapists(id)
      );

      -- Tabela de registros médicos
      CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        therapist_id TEXT NOT NULL,
        appointment_id TEXT,
        record_type TEXT DEFAULT 'evolution',
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        assessment_data TEXT,
        evolution_data TEXT,
        goals TEXT,
        interventions TEXT,
        mood TEXT,
        attention_level INTEGER,
        cooperation_level INTEGER,
        family_guidelines TEXT,
        homework TEXT,
        next_steps TEXT,
        next_appointment_notes TEXT,
        version INTEGER DEFAULT 1,
        parent_record_id TEXT,
        is_draft INTEGER DEFAULT 0,
        reviewed_by TEXT,
        reviewed_at TEXT,
        record_date TEXT DEFAULT (datetime('now')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        created_by TEXT,
        updated_by TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (therapist_id) REFERENCES therapists(id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      );

      -- Tabela de anexos de registros
      CREATE TABLE IF NOT EXISTS record_attachments (
        id TEXT PRIMARY KEY,
        record_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        attachment_type TEXT NOT NULL,
        title TEXT,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        uploaded_by TEXT,
        FOREIGN KEY (record_id) REFERENCES records(id)
      );

      -- Tabela de comunicações
      CREATE TABLE IF NOT EXISTS communications (
        id TEXT PRIMARY KEY,
        patient_id TEXT,
        user_id TEXT,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        subject TEXT,
        message TEXT NOT NULL,
        to_phone TEXT,
        to_email TEXT,
        provider TEXT,
        provider_id TEXT,
        provider_response TEXT,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        next_attempt_at TEXT,
        scheduled_for TEXT,
        sent_at TEXT,
        delivered_at TEXT,
        read_at TEXT,
        failed_at TEXT,
        error_message TEXT,
        error_code TEXT,
        appointment_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        created_by TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      );

      -- Tabela de configurações da clínica
      CREATE TABLE IF NOT EXISTS clinic_settings (
        id TEXT PRIMARY KEY,
        clinic_name TEXT NOT NULL,
        clinic_phone TEXT NOT NULL,
        clinic_email TEXT NOT NULL,
        clinic_whatsapp TEXT,
        address TEXT,
        business_hours TEXT,
        appointment_settings TEXT,
        communication_settings TEXT,
        record_settings TEXT,
        default_messages TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        updated_by TEXT
      );

      -- Tabela de logs de atividade
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- Tabela de anamneses
      CREATE TABLE IF NOT EXISTS anamneses (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        categoria TEXT NOT NULL,
        visibilidade TEXT DEFAULT 'privativa',
        paciente_id TEXT NOT NULL,
        paciente_nome TEXT NOT NULL,
        queixa_principal TEXT NOT NULL,
        historia_doenca TEXT,
        avaliacao_inicial TEXT,
        observacoes TEXT,
        dados_familia TEXT,
        desenvolvimento_motor TEXT,
        desenvolvimento_linguagem TEXT,
        desenvolvimento_social TEXT,
        historico_escolar TEXT,
        historico_medico TEXT,
        medicamentos_atuais TEXT,
        conclusoes TEXT,
        recomendacoes TEXT,
        criado_por TEXT NOT NULL,
        atualizado_por TEXT,
        is_favorito INTEGER DEFAULT 0,
        is_template INTEGER DEFAULT 0,
        template_categoria TEXT,
        tags TEXT,
        anexos TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (criado_por) REFERENCES users(id)
      );
    `);

    // 🔑 USUÁRIOS NATIVOS DO SISTEMA - CONFIGURE AQUI SEUS USUÁRIOS PADRÃO
    console.log('🔑 Criando usuários nativos do sistema...');
    
    // Definir usuários e senhas nativos
    const nativeUsers = [
      {
        id: '1',
        email: 'admin@sapere.com.br',
        password: 'Sapere@2025',  // ⚠️ ALTERE ESTA SENHA EM PRODUÇÃO
        name: 'Administrador Sapere',
        role: 'admin',
        phone: '(92) 99230-5850'
      },
      {
        id: '2', 
        email: 'dra.maria@sapere.com.br',
        password: 'Terapia@123',  // ⚠️ ALTERE ESTA SENHA EM PRODUÇÃO
        name: 'Dra. Maria Silva',
        role: 'therapist',
        phone: '(92) 98888-8888'
      },
      {
        id: '3',
        email: 'dr.carlos@sapere.com.br', 
        password: 'Psico@2025',   // ⚠️ ALTERE ESTA SENHA EM PRODUÇÃO
        name: 'Dr. Carlos Santos',
        role: 'therapist',
        phone: '(92) 97777-7777'
      },
      {
        id: '4',
        email: 'recepcao@sapere.com.br',
        password: 'Recepcao@123', // ⚠️ ALTERE ESTA SENHA EM PRODUÇÃO
        name: 'Recepção Sapere',
        role: 'admin',
        phone: '(92) 99230-5850'
      }
    ];

    // Inserir usuários nativos
    for (const user of nativeUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await sqliteDb.run(
        'INSERT OR REPLACE INTO users (id, email, password, name, role, status, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.email, hashedPassword, user.name, user.role, 'active', user.phone, new Date().toISOString()]
      );
      
      console.log(`✅ Usuário criado: ${user.name} (${user.email})`);
    }

    // Inserir perfis de terapeutas para usuários com role 'therapist'
    const therapistProfiles = [
      {
        id: '2',
        user_id: '2',
        professional_id: 'CRP 20/12345',
        specialties: ['Psicologia Clínica', 'Neuropsicologia', 'TDAH'],
        bio: 'Especialista em atendimento a crianças e adolescentes neurodivergentes com mais de 10 anos de experiência.',
        experience_years: 10,
        languages: ['Português', 'Inglês']
      },
      {
        id: '3',
        user_id: '3', 
        professional_id: 'CRP 20/67890',
        specialties: ['Psicologia Infantil', 'TEA', 'Análise Comportamental'],
        bio: 'Psicólogo especializado em Transtorno do Espectro Autista e análise comportamental aplicada.',
        experience_years: 8,
        languages: ['Português']
      }
    ];

    for (const therapist of therapistProfiles) {
      await sqliteDb.run(
        'INSERT OR REPLACE INTO therapists (id, user_id, professional_id, specialties, bio, experience_years, languages, consultation_duration, max_daily_appointments, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          therapist.id, 
          therapist.user_id, 
          therapist.professional_id,
          JSON.stringify(therapist.specialties), 
          therapist.bio, 
          therapist.experience_years, 
          JSON.stringify(therapist.languages), 
          60, // duração padrão da consulta
          8,  // máximo de consultas por dia
          1   // ativo
        ]
      );
      
      console.log(`✅ Perfil de terapeuta criado para: ${therapist.professional_id}`);
    }

    // Inserir pacientes de exemplo
    const patient1Id = 'p1';
    const patient2Id = 'p2';

    await sqliteDb.run(
      'INSERT OR REPLACE INTO patients (id, name, email, phone, birth_date, diagnosis, responsible_users, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [patient1Id, 'João Silva', 'joao@exemplo.com', '(92) 99111-1111', '2010-05-15', JSON.stringify(['TDAH']), JSON.stringify(['1']), 1, new Date().toISOString()]
    );

    await sqliteDb.run(
      'INSERT OR REPLACE INTO patients (id, name, email, phone, birth_date, diagnosis, responsible_users, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [patient2Id, 'Maria Santos', 'maria@exemplo.com', '(92) 99222-2222', '2012-08-20', JSON.stringify(['TEA']), JSON.stringify(['1']), 1, new Date().toISOString()]
    );

    // Inserir configurações da clínica
    await sqliteDb.run(
      'INSERT OR REPLACE INTO clinic_settings (id, clinic_name, clinic_phone, clinic_email, clinic_whatsapp) VALUES (?, ?, ?, ?, ?)',
      ['1', 'Clínica Sapere', '(92) 99230-5850', 'Sapere.recepcao@gmail.com', '+5592992305850']
    );

    console.log('✅ SQLite database initialized with full schema and test data');
    isInitialized = true;
  }
}

// Mostrar qual banco será usado
console.log('🗄️  Configuração de banco:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DATABASE_URL:', process.env.DATABASE_URL);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   Usar PostgreSQL:', usePostgres);

// Garantir inicialização síncrona
if (!usePostgres) {
  console.log('🔧 Inicializando SQLite para desenvolvimento...');
  initSqlite().catch(error => {
    console.error('❌ Erro ao inicializar SQLite:', error);
  });
} else {
  console.log('🐘 Configurando PostgreSQL...');
}

export const query = async (text: string, params?: any[]) => {
  if (usePostgres) {
    return pool.query(text, params);
  } else {
    // Aguardar inicialização do SQLite se necessário
    if (!isInitialized) {
      console.log('⏳ Aguardando inicialização do SQLite...');
      await initSqlite();
    }
    
    console.log('📋 Executando query SQLite:', text.substring(0, 100), 'params:', params);
    
    // Converter query PostgreSQL para SQLite
    let sqliteText = text.replace(/\$(\d+)/g, '?');
    
    // Converter funções PostgreSQL para SQLite
    sqliteText = sqliteText.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");
    sqliteText = sqliteText.replace(/NOW\(\)/g, "datetime('now')");
    
    if (sqliteText.toLowerCase().includes('select')) {
      const result = await sqliteDb.all(sqliteText, params);
      return { rows: result, rowCount: result.length };
    } else if (sqliteText.toLowerCase().includes('insert') && sqliteText.toLowerCase().includes('returning')) {
      // Para INSERT com RETURNING, fazer em duas etapas
      const insertText = sqliteText.split(/\s+RETURNING\s+/i)[0];
      const returningColumns = sqliteText.split(/\s+RETURNING\s+/i)[1];
      
      const info = await sqliteDb.run(insertText, params);
      
      // Buscar o registro inserido
      const selectResult = await sqliteDb.get(`SELECT ${returningColumns} FROM users WHERE rowid = ?`, [info.lastID]);
      return { rows: [selectResult], rowCount: 1 };
    } else if (sqliteText.toLowerCase().includes('update') && sqliteText.toLowerCase().includes('returning')) {
      // Para UPDATE com RETURNING
      const updateText = sqliteText.split(/\s+RETURNING\s+/i)[0];
      const returningColumns = sqliteText.split(/\s+RETURNING\s+/i)[1];
      
      await sqliteDb.run(updateText, params);
      
      // Buscar o registro atualizado (assumindo que o último parâmetro é o ID)
      const userId = params?.[params.length - 1];
      const selectResult = await sqliteDb.get(`SELECT ${returningColumns} FROM users WHERE id = ?`, [userId]);
      return { rows: [selectResult], rowCount: 1 };
    } else {
      const info = await sqliteDb.run(sqliteText, params);
      return { rows: [], rowCount: info.changes || 0 };
    }
  }
};

export const getClient = () => {
  if (usePostgres) {
    return pool.connect();
  }
  return null;
};

export default usePostgres ? pool : sqliteDb;