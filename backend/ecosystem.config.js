// Configuração do PM2 para produção na VPS
module.exports = {
  apps: [
    {
      name: 'sapere-backend',
      script: './dist/production-server.js',
      cwd: '/var/www/sapere/backend',
      instances: 'max', // Usar todos os cores disponíveis
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/sapere/error.log',
      out_file: '/var/log/sapere/access.log',
      log_file: '/var/log/sapere/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Configurações de deploy
      post_update: ['npm install', 'npm run build'],
      
      // Health check
      health_check_grace_period: 3000,
      health_check_interval: 30000,
      
      // Configurações de restart
      min_uptime: 10000,
      max_restarts: 5,
      restart_delay: 4000,
      
      // Configurações de log
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Variáveis específicas da VPS
      env_vars: {
        'TZ': 'America/Manaus'
      }
    }
  ],

  deploy: {
    production: {
      user: 'root', // ou usuário da VPS
      host: 'seu-servidor.hostinger.com',
      ref: 'origin/main',
      repo: 'https://github.com/seu-usuario/sapere-system.git',
      path: '/var/www/sapere',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};