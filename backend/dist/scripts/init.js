"use strict";
// Script de inicialização para Railway
// Executa migrations e seeds automaticamente na primeira execução
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
const database_1 = require("../database/config/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const runMigrations = async () => {
    try {
        console.log('🚀 Iniciando setup do banco de dados...');
        // Verificar se as tabelas já existem
        const tablesCheck = await (0, database_1.query)(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
        if (tablesCheck.rows.length > 0) {
            console.log('✅ Banco de dados já está configurado!');
            return;
        }
        console.log('📋 Executando migrations...');
        // Executar schema principal
        const schemaPath = path_1.default.join(__dirname, '../../database');
        const schemaFiles = ['schema.sql', 'indexes.sql', 'seeds.sql'];
        for (const file of schemaFiles) {
            const filePath = path_1.default.join(schemaPath, file);
            if (fs_1.default.existsSync(filePath)) {
                const sql = fs_1.default.readFileSync(filePath, 'utf8');
                if (sql.trim()) {
                    await (0, database_1.query)(sql);
                    console.log(`✅ ${file} executado com sucesso`);
                }
            }
        }
        console.log('🎉 Setup do banco de dados concluído!');
    }
    catch (error) {
        console.error('❌ Erro no setup do banco:', error);
        throw error;
    }
};
exports.runMigrations = runMigrations;
// Executar se chamado diretamente
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
//# sourceMappingURL=init.js.map