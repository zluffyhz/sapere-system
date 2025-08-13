"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultUsers = createDefaultUsers;
const database_1 = require("../database/config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const defaultUsers = [
    {
        id: '1',
        email: 'admin@sapere.com.br',
        password: 'Sapere@2025', // ⚠️ ALTERE ESTA SENHA EM PRODUÇÃO
        name: 'Administrador Sapere',
        role: 'admin',
        phone: '(92) 99230-5850'
    },
    {
        id: '2',
        email: 'dra.maria@sapere.com.br',
        password: 'Terapia@123', // ⚠️ ALTERE ESTA SENHA EM PRODUÇÃO
        name: 'Dra. Maria Silva',
        role: 'therapist',
        phone: '(92) 98888-8888'
    },
    {
        id: '3',
        email: 'dr.carlos@sapere.com.br',
        password: 'Psico@2025', // ⚠️ ALTERE ESTA SENHA EM PRODUÇÃO
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
async function createDefaultUsers() {
    console.log('🔑 Criando usuários padrão do sistema...');
    try {
        for (const user of defaultUsers) {
            // Verificar se usuário já existe
            const existingResult = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [user.email.toLowerCase()]);
            if (existingResult.rows && existingResult.rows.length > 0) {
                console.log(`⚠️ Usuário ${user.email} já existe, pulando...`);
                continue;
            }
            // Hash da senha
            const hashedPassword = await bcryptjs_1.default.hash(user.password, 10);
            // Criar usuário
            await (0, database_1.query)('INSERT INTO users (id, email, password, name, role, status, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
                user.id,
                user.email.toLowerCase(),
                hashedPassword,
                user.name,
                user.role,
                'active',
                user.phone || null,
                new Date().toISOString(),
                new Date().toISOString()
            ]);
            console.log(`✅ Usuário criado: ${user.name} (${user.email})`);
        }
        // Criar perfis de terapeutas
        console.log('👥 Criando perfis de terapeutas...');
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
            // Verificar se perfil já existe
            const existingProfile = await (0, database_1.query)('SELECT id FROM therapists WHERE user_id = $1', [therapist.user_id]);
            if (existingProfile.rows && existingProfile.rows.length > 0) {
                console.log(`⚠️ Perfil de terapeuta para user_id ${therapist.user_id} já existe, pulando...`);
                continue;
            }
            await (0, database_1.query)('INSERT INTO therapists (id, user_id, professional_id, specialties, bio, experience_years, languages, consultation_duration, max_daily_appointments, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [
                therapist.id,
                therapist.user_id,
                therapist.professional_id,
                JSON.stringify(therapist.specialties),
                therapist.bio,
                therapist.experience_years,
                JSON.stringify(therapist.languages),
                60, // duração padrão da consulta
                8, // máximo de consultas por dia
                true, // ativo
                new Date().toISOString(),
                new Date().toISOString()
            ]);
            console.log(`✅ Perfil de terapeuta criado: ${therapist.professional_id}`);
        }
        console.log('🎉 Usuários padrão criados com sucesso!');
        console.log('\n📋 CREDENCIAIS CRIADAS:');
        console.log('=======================');
        for (const user of defaultUsers) {
            console.log(`👤 ${user.name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔑 Senha: ${user.password}`);
            console.log(`   👔 Role: ${user.role}`);
            console.log('');
        }
    }
    catch (error) {
        console.error('❌ Erro ao criar usuários padrão:', error);
        throw error;
    }
}
// Executar se chamado diretamente
if (require.main === module) {
    createDefaultUsers()
        .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Script falhou:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=createDefaultUsers.js.map