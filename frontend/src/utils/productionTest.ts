// Comprehensive production test utilities
import { debugAPI, healthCheck, authAPI } from '../services/api';

export class ProductionTestSuite {
  private results: Array<{
    test: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    details?: any;
  }> = [];

  private log(test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`, details || '');
  }

  async runAllTests(): Promise<typeof this.results> {
    console.log('🚀 STARTING PRODUCTION TEST SUITE');
    this.results = [];

    await this.testEnvironment();
    await this.testAPIConnection();
    await this.testAuthentication();
    await this.testEndpoints();
    
    this.printSummary();
    return this.results;
  }

  private async testEnvironment() {
    console.log('\n🔍 TESTING ENVIRONMENT...');
    
    try {
      const isProduction = import.meta.env.MODE === 'production' || 
                          window.location.hostname.includes('vercel.app') || 
                          window.location.hostname !== 'localhost';
      
      this.log('Environment Detection', 'success', `Detected: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      
      const apiUrl = isProduction 
        ? 'https://sapere-system-production.up.railway.app'
        : 'http://localhost:3002';
      
      this.log('API URL Configuration', 'success', `API URL: ${apiUrl}`);
      
      // Test localStorage availability
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        this.log('LocalStorage', 'success', 'Available and working');
      } catch (error) {
        this.log('LocalStorage', 'error', 'Not available or restricted', error);
      }
      
      // Test sessionStorage availability
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        this.log('SessionStorage', 'success', 'Available and working');
      } catch (error) {
        this.log('SessionStorage', 'error', 'Not available or restricted', error);
      }
      
    } catch (error) {
      this.log('Environment Test', 'error', 'Failed to test environment', error);
    }
  }

  private async testAPIConnection() {
    console.log('\n🌐 TESTING API CONNECTION...');
    
    try {
      const connectionStatus = await debugAPI.testConnection();
      
      if (connectionStatus.health.status === 'healthy') {
        this.log('Health Check', 'success', 'API is healthy and responding');
      } else {
        this.log('Health Check', 'error', 'API health check failed', connectionStatus.health);
      }
      
      this.log('API Environment', 'success', `Environment: ${connectionStatus.environment}`);
      this.log('API Base URL', 'success', `URL: ${connectionStatus.apiUrl}`);
      
    } catch (error) {
      this.log('API Connection', 'error', 'Failed to connect to API', error);
    }
  }

  private async testAuthentication() {
    console.log('\n🔐 TESTING AUTHENTICATION...');
    
    try {
      // Test if user is already authenticated
      const isAuth = authAPI.isAuthenticated();
      
      if (isAuth) {
        this.log('Authentication Status', 'success', 'User is authenticated');
        
        // Test token validity
        try {
          const tokenValid = await authAPI.testToken();
          if (tokenValid) {
            this.log('Token Validation', 'success', 'Token is valid');
          } else {
            this.log('Token Validation', 'warning', 'Token is invalid or expired');
          }
        } catch (error) {
          this.log('Token Validation', 'error', 'Failed to validate token', error);
        }
        
        // Get current user
        const user = authAPI.getCurrentUser();
        if (user) {
          this.log('User Data', 'success', `Logged in as: ${user.name} (${user.role})`);
        } else {
          this.log('User Data', 'warning', 'No user data found');
        }
        
      } else {
        this.log('Authentication Status', 'warning', 'User is not authenticated');
      }
      
    } catch (error) {
      this.log('Authentication Test', 'error', 'Failed to test authentication', error);
    }
  }

  private async testEndpoints() {
    console.log('\n🎯 TESTING API ENDPOINTS...');
    
    // Only test if authenticated
    if (!authAPI.isAuthenticated()) {
      this.log('Endpoint Tests', 'warning', 'Skipped (not authenticated)');
      return;
    }

    // Test dashboard endpoint
    try {
      const { protectedAPI } = await import('../services/api');
      const dashboardData = await protectedAPI.getDashboard();
      this.log('Dashboard Endpoint', 'success', 'Dashboard data loaded successfully', dashboardData);
    } catch (error) {
      this.log('Dashboard Endpoint', 'error', 'Failed to load dashboard', error);
    }

    // Test other protected endpoints removed (role testing functionality has been deprecated)
  }

  private printSummary() {
    console.log('\n📊 TEST SUMMARY:');
    
    const summary = {
      total: this.results.length,
      success: this.results.filter(r => r.status === 'success').length,
      warning: this.results.filter(r => r.status === 'warning').length,
      error: this.results.filter(r => r.status === 'error').length
    };
    
    console.log(`✅ Success: ${summary.success}`);
    console.log(`⚠️  Warning: ${summary.warning}`);
    console.log(`❌ Error: ${summary.error}`);
    
    const successRate = (summary.success / summary.total) * 100;
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 SYSTEM STATUS: HEALTHY');
    } else if (successRate >= 60) {
      console.log('⚠️  SYSTEM STATUS: WARNING');
    } else {
      console.log('🚨 SYSTEM STATUS: CRITICAL');
    }
  }

  getResults() {
    return this.results;
  }
}

// Create global test instance
export const productionTest = new ProductionTestSuite();

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).productionTest = productionTest;
  (window as any).testProduction = () => productionTest.runAllTests();
}