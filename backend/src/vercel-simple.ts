import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// CORS simples
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Database simples
let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 
        `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'sapere_db'}`,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 3,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
};

const query = async (text: string, params?: any[]) => {
  try {
    const client = getPool();
    return await client.query(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Middleware de auth simples
const auth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    const result = await query('SELECT * FROM users WHERE id = $1 AND status = $2', [decoded.userId, 'active']);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password required' });
    }
    
    const result = await query(
      'SELECT * FROM users WHERE (email = $1 OR username = $1) AND status = $2',
      [login.toLowerCase(), 'active']
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile
app.get('/api/auth/profile', auth, (req: any, res) => {
  res.json({ user: req.user });
});

// Users (Admin only)
app.get('/api/admin/users', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await query('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/users', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, email, password, role = 'therapist' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (id, name, email, password, role, status, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [name, email.toLowerCase(), hashedPassword, role, 'active']
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Patients
app.get('/api/patients', auth, async (req: any, res) => {
  try {
    const result = await query(`
      SELECT p.*, u.name as created_by_name 
      FROM patients p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.active = true 
      ORDER BY p.created_at DESC
    `);
    
    res.json({ patients: result.rows });
  } catch (error) {
    console.error('Patients error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/patients', auth, async (req: any, res) => {
  try {
    if (!['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const { name, birth_date, contacts = {}, consent = {} } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await query(
      'INSERT INTO patients (id, name, birth_date, contacts, consent, active, created_at, updated_at, created_by) VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW(), $5) RETURNING *',
      [name, birth_date, JSON.stringify(contacts), JSON.stringify(consent), req.user.id]
    );
    
    res.status(201).json({
      message: 'Patient created successfully',
      patient: result.rows[0]
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Appointments
app.get('/api/appointments', auth, async (req: any, res) => {
  try {
    const result = await query(`
      SELECT a.*, p.name as patient_name, u.name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.start_time DESC
    `);
    
    res.json({ appointments: result.rows });
  } catch (error) {
    console.error('Appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', auth, async (req: any, res) => {
  try {
    if (!['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const { patient_id, start_time, end_time, notes } = req.body;
    
    if (!patient_id || !start_time || !end_time) {
      return res.status(400).json({ error: 'Patient, start time and end time required' });
    }
    
    const result = await query(
      'INSERT INTO appointments (id, patient_id, professional_id, start_time, end_time, status, notes, created_at, updated_at, created_by) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW(), $7) RETURNING *',
      [patient_id, req.user.id, start_time, end_time, 'scheduled', notes, req.user.id]
    );
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Server error' });
});

export default app;