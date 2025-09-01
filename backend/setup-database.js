#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Database configuration
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'sapere_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  };
};

// Main setup function
async function setupDatabase() {
  console.log('🚀 Starting Sapere Database Setup...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  const config = getDatabaseConfig();
  console.log('🔧 Database config:', {
    ...config,
    password: config.password ? '[HIDDEN]' : '[NOT SET]',
    connectionString: config.connectionString ? '[PROVIDED]' : '[NOT PROVIDED]'
  });

  const pool = new Pool({
    ...config,
    max: 5,
    connectionTimeoutMillis: 10000
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Read and execute schema
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, 'init-production.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded successfully');
    
    console.log('🔨 Executing schema...');
    await client.query(schema);
    console.log('✅ Schema executed successfully!');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Verify users were created
    const usersResult = await client.query(`
      SELECT name, email, role, status 
      FROM users 
      ORDER BY role, name
    `);
    
    console.log('👥 Default users created:');
    usersResult.rows.forEach(user => {
      console.log(`   ✓ ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Verify patients were created
    const patientsResult = await client.query(`
      SELECT COUNT(*) as count FROM patients
    `);
    
    console.log(`👤 Sample patients created: ${patientsResult.rows[0].count}`);
    
    // Verify appointments were created
    const appointmentsResult = await client.query(`
      SELECT COUNT(*) as count FROM appointments
    `);
    
    console.log(`📅 Sample appointments created: ${appointmentsResult.rows[0].count}`);
    
    client.release();
    
    console.log('\n🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('\n📝 Default Credentials:');
    console.log('   Admin: admin@sapere.com.br / Sapere@2025');
    console.log('   Therapist: maria@sapere.com.br / Sapere@2025');
    console.log('   Responsible: responsavel@sapere.com.br / Sapere@2025');
    console.log('\n🚀 You can now start the server with: npm start');
    
  } catch (error) {
    console.error('\n❌ DATABASE SETUP FAILED!');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Make sure PostgreSQL is running');
      console.error('   2. Check your database credentials in .env');
      console.error('   3. Verify the database exists');
    }
    
    if (error.code === '28P01') {
      console.error('\n💡 Authentication failed:');
      console.error('   1. Check your database password');
      console.error('   2. Verify the username is correct');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };