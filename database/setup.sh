#!/bin/bash

# Script de configuração do banco de dados Sapere
# Execute com: bash setup.sh

echo "🏥 Configurando banco de dados Sapere..."

# Verificar se o PostgreSQL está rodando
if ! pg_isready -q; then
    echo "❌ PostgreSQL não está rodando. Por favor, inicie o serviço PostgreSQL."
    exit 1
fi

# Configurações do banco
DB_NAME="sapere_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "📊 Configurações do banco:"
echo "  - Nome: $DB_NAME"
echo "  - Usuário: $DB_USER"
echo "  - Host: $DB_HOST"
echo "  - Porta: $DB_PORT"

# Criar banco de dados se não existir
echo ""
echo "🔧 Criando banco de dados..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Banco já existe ou erro na criação"

# Executar schema
echo ""
echo "📋 Criando tabelas..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Tabelas criadas com sucesso!"
else
    echo "❌ Erro ao criar tabelas"
    exit 1
fi

# Executar índices
echo ""
echo "⚡ Criando índices..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f indexes.sql

if [ $? -eq 0 ]; then
    echo "✅ Índices criados com sucesso!"
else
    echo "❌ Erro ao criar índices"
    exit 1
fi

# Executar seeds
echo ""
read -p "🌱 Deseja inserir dados de exemplo? (s/n): " insert_seeds

if [[ $insert_seeds =~ ^[Ss]$ ]]; then
    echo "🌱 Inserindo dados de exemplo..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seeds.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Dados de exemplo inseridos com sucesso!"
    else
        echo "❌ Erro ao inserir dados de exemplo"
        exit 1
    fi
else
    echo "⏭️  Pulando inserção de dados de exemplo"
fi

echo ""
echo "🎉 Configuração do banco concluída!"
echo ""
echo "📝 Próximos passos:"
echo "1. Copie o arquivo .env.example para .env no backend"
echo "2. Configure as variáveis do banco no arquivo .env:"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$DB_USER" 
echo "   DB_HOST=$DB_HOST"
echo "   DB_PORT=$DB_PORT"
echo "3. Configure sua senha no arquivo .env"
echo ""
echo "🔑 Usuários de teste criados:"
echo "  - Admin: admin@sapere.com.br (senha: admin123)"
echo "  - Dra. Maria: dra.maria@sapere.com.br (senha: admin123)"
echo "  - Dr. João: dr.joao@sapere.com.br (senha: admin123)"
echo "  - Dra. Ana: dra.ana@sapere.com.br (senha: admin123)"
echo ""
echo "💬 Contatos da clínica configurados:"
echo "  - WhatsApp: +55 92 99230-5850"
echo "  - Email: Sapere.recepcao@gmail.com"