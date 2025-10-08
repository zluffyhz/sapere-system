#!/usr/bin/env node

/**
 * Sapere System Auto-Fix Script
 * Automated error detection and resolution inspired by 1mcpserver capabilities
 * 
 * This script monitors the Sapere system for common development issues and
 * automatically resolves them when possible.
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class SapereSystemAutoFix {
  constructor() {
    this.frontendPath = path.join(__dirname, '..', 'frontend');
    this.backendPath = path.join(__dirname, '..', 'backend');
    this.logFile = path.join(__dirname, 'autofix.log');
    this.fixLog = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    
    console.log(logMessage);
    this.fixLog.push({ timestamp, type, message });
    
    // Append to log file
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async detectAndFixIssues() {
    this.log('🚀 Starting Sapere System Auto-Fix Scan');

    try {
      // Check and fix port conflicts
      await this.fixPortConflicts();
      
      // Check and fix Fast Refresh issues
      await this.fixFastRefreshIssues();
      
      // Check and fix database schema issues
      await this.fixDatabaseIssues();
      
      // Check and fix dependency issues
      await this.fixDependencyIssues();
      
      // Optimize performance
      await this.optimizeSystem();
      
      this.log('✅ Auto-fix scan completed successfully');
      
    } catch (error) {
      this.log(`❌ Auto-fix scan failed: ${error.message}`, 'ERROR');
    }
  }

  async fixPortConflicts() {
    this.log('🔍 Checking for port conflicts...');
    
    try {
      // Check if port 3001 is in use
      const { stdout } = await execAsync('lsof -ti:3001').catch(() => ({ stdout: '' }));
      
      if (stdout.trim()) {
        this.log('⚠️ Port 3001 conflict detected, attempting to resolve...');
        
        const pids = stdout.trim().split('\n');
        for (const pid of pids) {
          try {
            await execAsync(`kill -9 ${pid}`);
            this.log(`✅ Killed conflicting process ${pid}`);
          } catch (error) {
            this.log(`❌ Failed to kill process ${pid}: ${error.message}`, 'ERROR');
          }
        }
      } else {
        this.log('✅ No port conflicts detected');
      }
      
    } catch (error) {
      this.log(`❌ Error checking port conflicts: ${error.message}`, 'ERROR');
    }
  }

  async fixFastRefreshIssues() {
    this.log('🔍 Scanning for Fast Refresh compatibility issues...');
    
    const contextFiles = [
      path.join(this.frontendPath, 'src/context/AuthContext.tsx'),
      path.join(this.frontendPath, 'src/context/SystemNotificationsContext.tsx'),
      path.join(this.frontendPath, 'src/components/common/ProtectedRoute.tsx')
    ];

    for (const file of contextFiles) {
      if (fs.existsSync(file)) {
        await this.validateFastRefreshCompatibility(file);
      }
    }
  }

  async validateFastRefreshCompatibility(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      // Check for common Fast Refresh issues
      const issues = [];
      
      // Check for inconsistent exports
      const hasDefaultExport = content.includes('export default');
      const hasNamedExports = content.includes('export const') || content.includes('export function');
      
      if (hasDefaultExport && hasNamedExports) {
        // Check if it's a proper React component pattern
        if (!content.match(/export default \w+;?\s*$/m) && !content.match(/export { .+ };\s*export default/)) {
          issues.push('Mixed export pattern detected');
        }
      }
      
      // Check for non-component exports in component files
      if (fileName.includes('Context') || fileName.includes('Route')) {
        const exportLines = content.split('\n').filter(line => line.includes('export'));
        exportLines.forEach((line, index) => {
          if (line.includes('export const') && !line.includes('React.FC') && !line.includes('() =>')) {
            issues.push(`Non-component export at line ${index + 1}: ${line.trim()}`);
          }
        });
      }

      if (issues.length > 0) {
        this.log(`⚠️ Fast Refresh issues found in ${fileName}:`);
        issues.forEach(issue => this.log(`  - ${issue}`));
        
        // Attempt to fix known patterns
        await this.applyFastRefreshFixes(filePath, content, issues);
      } else {
        this.log(`✅ ${fileName} is Fast Refresh compatible`);
      }
      
    } catch (error) {
      this.log(`❌ Error validating ${filePath}: ${error.message}`, 'ERROR');
    }
  }

  async applyFastRefreshFixes(filePath, content, issues) {
    let fixedContent = content;
    let appliedFixes = [];

    // Fix: Ensure proper component export pattern
    if (issues.some(issue => issue.includes('Mixed export pattern'))) {
      // Move all named exports before default export
      const lines = content.split('\n');
      const defaultExportLine = lines.findIndex(line => line.match(/^export default/));
      
      if (defaultExportLine > -1) {
        // This is a complex fix, so just log it for manual review
        this.log(`📝 Manual fix needed for export pattern in ${path.basename(filePath)}`);
        appliedFixes.push('Logged export pattern issue for manual review');
      }
    }

    if (appliedFixes.length > 0) {
      this.log(`🔧 Applied fixes to ${path.basename(filePath)}: ${appliedFixes.join(', ')}`);
    }
  }

  async fixDatabaseIssues() {
    this.log('🔍 Checking database schema and connectivity...');
    
    try {
      // Check if database is accessible
      const { stdout } = await execAsync('psql -d sapere_development -c "SELECT 1;" -t').catch(() => ({ stdout: '' }));
      
      if (stdout.includes('1')) {
        this.log('✅ Database connection successful');
        
        // Check for missing columns
        await this.checkMissingColumns();
        
      } else {
        this.log('⚠️ Database connection failed, attempting to start PostgreSQL...');
        
        try {
          // Try different PostgreSQL service management approaches based on platform
          const platform = process.platform;
          let postgresCommand;
          
          if (platform === 'darwin') {
            // macOS - try brew first, then launchctl
            try {
              await execAsync('brew services start postgresql');
              postgresCommand = 'brew services';
            } catch {
              await execAsync('launchctl start postgresql');
              postgresCommand = 'launchctl';
            }
          } else if (platform === 'linux') {
            // Linux - try systemctl, then service
            try {
              await execAsync('sudo systemctl start postgresql');
              postgresCommand = 'systemctl';
            } catch {
              await execAsync('sudo service postgresql start');
              postgresCommand = 'service';
            }
          } else {
            throw new Error(`Unsupported platform: ${platform}`);
          }
          
          this.log(`✅ PostgreSQL service started using ${postgresCommand}`);
        } catch (error) {
          this.log(`❌ Failed to start PostgreSQL: ${error.message}`, 'ERROR');
          this.log('💡 Please ensure PostgreSQL is installed and start it manually', 'INFO');
        }
      }
      
    } catch (error) {
      this.log(`❌ Database check failed: ${error.message}`, 'ERROR');
    }
  }

  async checkMissingColumns() {
    try {
      // Use environment variable for database name, fallback to development default
      const dbName = process.env.DB_NAME || process.env.PGDATABASE || 'sapere_development';
      
      // Check for is_draggable column in appointments table
      const { stdout } = await execAsync(
        `psql -d ${dbName} -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'is_draggable';" -t`
      ).catch(() => ({ stdout: '' }));

      if (!stdout.trim()) {
        this.log('⚠️ Missing is_draggable column detected, adding...');
        
        await execAsync(`psql -d ${dbName} -c "ALTER TABLE appointments ADD COLUMN is_draggable BOOLEAN DEFAULT true;"`);
        this.log('✅ Added is_draggable column to appointments table');
      } else {
        this.log('✅ Database schema is up to date');
      }
      
    } catch (error) {
      this.log(`❌ Failed to check database schema: ${error.message}`, 'ERROR');
    }
  }

  async fixDependencyIssues() {
    this.log('🔍 Checking for dependency issues...');
    
    // Check frontend dependencies
    const frontendPackageJson = path.join(this.frontendPath, 'package.json');
    if (fs.existsSync(frontendPackageJson)) {
      await this.checkPackageIntegrity(frontendPackageJson, 'frontend');
    }

    // Check backend dependencies
    const backendPackageJson = path.join(this.backendPath, 'package.json');
    if (fs.existsSync(backendPackageJson)) {
      await this.checkPackageIntegrity(backendPackageJson, 'backend');
    }
  }

  async checkPackageIntegrity(packageJsonPath, type) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const nodeModulesPath = path.join(path.dirname(packageJsonPath), 'node_modules');
      
      if (!fs.existsSync(nodeModulesPath)) {
        this.log(`⚠️ node_modules missing in ${type}, running npm install...`);
        
        await execAsync('npm install', { cwd: path.dirname(packageJsonPath) });
        this.log(`✅ Installed ${type} dependencies`);
      } else {
        this.log(`✅ ${type} dependencies are installed`);
      }
      
    } catch (error) {
      this.log(`❌ Failed to check ${type} dependencies: ${error.message}`, 'ERROR');
    }
  }

  async optimizeSystem() {
    this.log('🚀 Running system optimizations...');
    
    try {
      // Clear npm cache if it's large
      const { stdout } = await execAsync('npm cache verify').catch(() => ({ stdout: '' }));
      
      if (stdout.includes('cache verified')) {
        this.log('✅ NPM cache is clean');
      }
      
      // Check for large log files and rotate them
      await this.rotateLargeLogs();
      
      this.log('✅ System optimization completed');
      
    } catch (error) {
      this.log(`❌ System optimization failed: ${error.message}`, 'ERROR');
    }
  }

  async rotateLargeLogs() {
    const logPaths = [
      path.join(this.frontendPath, 'logs'),
      path.join(this.backendPath, 'logs'),
      this.logFile
    ];

    for (const logPath of logPaths) {
      if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        const sizeInMB = stats.size / (1024 * 1024);
        
        if (sizeInMB > 10) { // Rotate if larger than 10MB
          const rotatedPath = `${logPath}.${Date.now()}.old`;
          fs.renameSync(logPath, rotatedPath);
          fs.writeFileSync(logPath, '');
          
          this.log(`📝 Rotated large log file: ${path.basename(logPath)} (${sizeInMB.toFixed(1)}MB)`);
        }
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalFixes: this.fixLog.length,
      successfulFixes: this.fixLog.filter(log => log.type === 'INFO' && log.message.includes('✅')).length,
      errors: this.fixLog.filter(log => log.type === 'ERROR').length,
      warnings: this.fixLog.filter(log => log.message.includes('⚠️')).length,
      fixLog: this.fixLog
    };

    console.log('\n📊 SAPERE SYSTEM AUTO-FIX REPORT');
    console.log('==========================================');
    console.log(`Total Actions: ${report.totalFixes}`);
    console.log(`Successful Fixes: ${report.successfulFixes}`);
    console.log(`Warnings: ${report.warnings}`);
    console.log(`Errors: ${report.errors}`);
    console.log('==========================================\n');

    return report;
  }

  async runDaemon() {
    this.log('🔄 Starting Sapere System Auto-Fix Daemon');
    
    setInterval(async () => {
      await this.detectAndFixIssues();
    }, 300000); // Run every 5 minutes

    // Run immediately
    await this.detectAndFixIssues();
  }
}

// CLI Interface
if (require.main === module) {
  const autoFix = new SapereSystemAutoFix();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--daemon')) {
    autoFix.runDaemon();
  } else if (args.includes('--report')) {
    autoFix.detectAndFixIssues().then(() => {
      autoFix.generateReport();
    });
  } else {
    autoFix.detectAndFixIssues().then(() => {
      const report = autoFix.generateReport();
      process.exit(report.errors > 0 ? 1 : 0);
    });
  }
}

module.exports = SapereSystemAutoFix;