// Super simple Node.js server for Railway debug
const http = require('http');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;
  const method = req.method;
  
  console.log(`${new Date().toISOString()} ${method} ${url}`);

  // Health check
  if (url === '/health' || url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Super Simple Sapere API'
    }));
    return;
  }

  // Mock login
  if (url === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        token: 'simple_token_' + Date.now(),
        user: {
          id: '1',
          email: 'test@railway.com',
          name: 'Railway Test User',
          role: 'admin'
        },
        message: 'Simple login from Railway works!'
      }));
    });
    return;
  }

  // Mock create user
  if (url === '/api/admin/users' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: {
          id: 'railway_user_' + Date.now(),
          name: 'Railway Created User',
          email: 'created@railway.com',
          role: 'therapist',
          status: 'active'
        },
        message: 'User created successfully on Railway!'
      }));
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not found',
    path: url,
    method: method
  }));
});

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(`🚀 Super Simple API running on port ${PORT}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});