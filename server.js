const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Database Connection
let pool = null;

const getPool = () => {
  if (!pool) {
    const config = process.env.DATABASE_URL ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    } : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sapere_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || ''
    };

    pool = new Pool({
      ...config,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }
  return pool;
};

const query = async (text, params = []) => {
  const client = getPool();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'railway_secret_key_2025');
    
    const result = await query('SELECT * FROM users WHERE id = $1 AND status = $2', [decoded.userId, 'active']);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize Database
const initDatabase = async () => {
  try {
    // Create tables
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'therapist',
        status VARCHAR(50) DEFAULT 'active',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login_at TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        birth_date DATE,
        gender VARCHAR(20),
        contacts JSONB DEFAULT '{}',
        responsible JSONB DEFAULT '{}',
        insurance JSONB DEFAULT '{}',
        consent JSONB DEFAULT '{}',
        observations TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id),
        professional_id UUID REFERENCES users(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        type VARCHAR(50) DEFAULT 'consultation',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id)
      );
    `);

    // Create default admin user
    const adminExists = await query('SELECT id FROM users WHERE email = $1', ['admin@sapere.com.br']);
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Sapere@2025', 10);
      await query(`
        INSERT INTO users (name, email, username, password, role, status) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['Administrador', 'admin@sapere.com.br', 'admin', hashedPassword, 'admin', 'active']);
      
      console.log('✅ Default admin user created');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Routes

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'connected' : 'not configured'
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Sapere API is running on Railway',
    timestamp: new Date().toISOString()
  });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const result = await query(
      'SELECT * FROM users WHERE (email = $1 OR username = $1) AND status = $2',
      [login.toLowerCase(), 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await query('UPDATE users SET last_login_at = $1 WHERE id = $2', [new Date(), user.id]);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'railway_secret_key_2025',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

// Users Management (Admin)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await query(`
      SELECT id, name, email, username, role, status, phone, created_at, last_login_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({ 
      success: true,
      users: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, username, password, role = 'therapist', phone } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    if (!email && !username) {
      return res.status(400).json({ error: 'Email or username is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(`
      INSERT INTO users (name, email, username, password, role, status, phone, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, 'active', $6, NOW(), NOW()) 
      RETURNING id, name, email, username, role, status, phone, created_at
    `, [name, email?.toLowerCase(), username?.toLowerCase(), hashedPassword, role, phone]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email or username already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Patients Management
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    let queryText = `
      SELECT p.*, u.name as created_by_name 
      FROM patients p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.active = true
    `;
    const params = [];

    if (search) {
      queryText += ` AND (p.name ILIKE $1 OR p.contacts->>'email' ILIKE $1 OR p.contacts->>'phone' ILIKE $1)`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    const patients = result.rows.map(row => ({
      ...row,
      age: row.birth_date ? calculateAge(row.birth_date) : null,
      contacts: row.contacts || {},
      responsible: row.responsible || {},
      consent: row.consent || {}
    }));

    res.json({
      success: true,
      patients,
      total: patients.length
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, birth_date, gender, contacts = {}, responsible = {}, insurance = {}, consent = {}, observations } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(`
      INSERT INTO patients (name, birth_date, gender, contacts, responsible, insurance, consent, observations, active, created_at, updated_at, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW(), $9) 
      RETURNING *
    `, [name, birth_date, gender, JSON.stringify(contacts), JSON.stringify(responsible), JSON.stringify(insurance), JSON.stringify(consent), observations, req.user.id]);

    const patient = {
      ...result.rows[0],
      age: result.rows[0].birth_date ? calculateAge(result.rows[0].birth_date) : null,
      contacts: result.rows[0].contacts || {},
      responsible: result.rows[0].responsible || {},
      consent: result.rows[0].consent || {}
    };

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Appointments Management
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { date, patient_id, limit = 50 } = req.query;
    let queryText = `
      SELECT a.*, p.name as patient_name, u.name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (date) {
      queryText += ` AND DATE(a.start_time) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    if (patient_id) {
      queryText += ` AND a.patient_id = $${paramIndex}`;
      params.push(patient_id);
      paramIndex++;
    }

    queryText += ` ORDER BY a.start_time DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.json({
      success: true,
      appointments: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { patient_id, start_time, end_time, notes, type = 'consultation' } = req.body;

    if (!patient_id || !start_time || !end_time) {
      return res.status(400).json({ error: 'Patient, start time and end time are required' });
    }

    const result = await query(`
      INSERT INTO appointments (patient_id, professional_id, start_time, end_time, status, type, notes, created_at, updated_at, created_by) 
      VALUES ($1, $2, $3, $4, 'scheduled', $5, $6, NOW(), NOW(), $7) 
      RETURNING *
    `, [patient_id, req.user.id, start_time, end_time, type, notes, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper Functions
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Error Handling
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve React App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Start Server
const startServer = async () => {
  await initDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sapere System running on Railway`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Local'}`);
  });
};

startServer().catch(console.error);