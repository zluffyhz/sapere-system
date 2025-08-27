const { chromium } = require('playwright');

(async () => {
  console.log('🌐 TESTANDO APLICAÇÃO PRINCIPAL - https://sapere-system.vercel.app\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  const consoleErrors = [];
  const networkErrors = [];
  const workingFeatures = [];
  const brokenFeatures = [];
  const foundRoutes = [];
  
  // Capturar logs e erros
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
      console.log(`🌐 ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // 1. Acessar URL principal
    console.log('🚀 Acessando aplicação principal...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log(`📍 URL atual: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/main-01-initial.png', fullPage: true });
    
    // 2. Verificar se é página de login ou dashboard
    const isLoginPage = page.url().includes('/login');
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
    
    if (isLoginPage || hasLoginForm) {
      console.log('🔐 Detectada página de login');
      await testLoginAndAuthenticate(page, workingFeatures, brokenFeatures);
    } else {
      console.log('🏠 Detectada página autenticada (dashboard?)');
      await testAuthenticatedApp(page, workingFeatures, brokenFeatures, foundRoutes);
    }
    
    // 3. Mapear todas as rotas disponíveis
    console.log('\n🗺️ MAPEANDO ROTAS DISPONÍVEIS...');
    await mapAvailableRoutes(page, foundRoutes, workingFeatures, brokenFeatures);
    
    // 4. Testar funcionalidades específicas encontradas
    console.log('\n🧪 TESTANDO FUNCIONALIDADES ESPECÍFICAS...');
    await testSpecificFunctionalities(page, workingFeatures, brokenFeatures);
    
    // 5. Testar responsividade da aplicação
    console.log('\n📱 TESTANDO RESPONSIVIDADE...');
    await testResponsiveness(page);
    
  } catch (error) {
    console.log(`💥 Erro crítico: ${error.message}`);
    brokenFeatures.push(`Aplicação - Erro crítico: ${error.message}`);
  }
  
  // 6. RELATÓRIO FINAL DETALHADO
  console.log('\n📊 RELATÓRIO FINAL COMPLETO:');
  console.log('='.repeat(50));
  console.log(`🌐 URL testada: https://sapere-system.vercel.app`);
  console.log(`📍 URL final: ${page.url()}`);
  console.log(`✅ Funcionalidades OK: ${workingFeatures.length}`);
  console.log(`❌ Problemas encontrados: ${brokenFeatures.length}`);
  console.log(`🚨 Erros de console: ${consoleErrors.length}`);
  console.log(`🌐 Erros HTTP: ${networkErrors.length}`);
  console.log(`🗺️ Rotas descobertas: ${foundRoutes.length}`);
  
  if (foundRoutes.length > 0) {
    console.log('\n🗺️ ROTAS ENCONTRADAS:');
    foundRoutes.forEach(route => console.log(`   • ${route}`));
  }
  
  if (workingFeatures.length > 0) {
    console.log('\n✅ FUNCIONALIDADES FUNCIONANDO:');
    workingFeatures.forEach(feature => console.log(`   • ${feature}`));
  }
  
  if (brokenFeatures.length > 0) {
    console.log('\n❌ PROBLEMAS IDENTIFICADOS:');
    brokenFeatures.forEach(feature => console.log(`   • ${feature}`));
  }
  
  if (consoleErrors.length > 0) {
    console.log('\n🚨 ERROS DE CONSOLE:');
    consoleErrors.slice(0, 5).forEach(error => {
      console.log(`   • ${error.substring(0, 80)}${error.length > 80 ? '...' : ''}`);
    });
  }
  
  if (networkErrors.length > 0) {
    console.log('\n🌐 ERROS DE REDE:');
    networkErrors.forEach(error => console.log(`   • ${error}`));
  }
  
  console.log('\n⏳ Aguardando 8 segundos para visualização...');
  await page.waitForTimeout(8000);
  
  await browser.close();
  console.log('\n✅ ANÁLISE DA APLICAÇÃO PRINCIPAL FINALIZADA!\n');
})();

async function testLoginAndAuthenticate(page, workingFeatures, brokenFeatures) {
  console.log('🔐 Testando sistema de login...');
  
  // Verificar elementos do login
  const emailField = await page.locator('input[type="email"], input[name="email"]').count();
  const passwordField = await page.locator('input[type="password"], input[name="password"]').count();
  const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar")').count();
  
  if (emailField > 0) workingFeatures.push('Login - Campo Email presente');
  else brokenFeatures.push('Login - Campo Email ausente');
  
  if (passwordField > 0) workingFeatures.push('Login - Campo Senha presente');
  else brokenFeatures.push('Login - Campo Senha ausente');
  
  if (submitButton > 0) workingFeatures.push('Login - Botão Entrar presente');
  else brokenFeatures.push('Login - Botão Entrar ausente');
  
  // Tentar login se todos os campos estão presentes
  if (emailField > 0 && passwordField > 0 && submitButton > 0) {
    try {
      console.log('🔑 Tentando login com admin@sapere.com...');
      
      await page.locator('input[type="email"], input[name="email"]').fill('admin@sapere.com');
      await page.locator('input[type="password"], input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"], button:has-text("Entrar")').click();
      
      await page.waitForTimeout(4000);
      
      const newUrl = page.url();
      if (!newUrl.includes('/login')) {
        workingFeatures.push('Login - Autenticação funcionando');
        console.log('✅ Login bem-sucedido!');
        await page.screenshot({ path: 'screenshots/main-02-authenticated.png', fullPage: true });
        return true;
      } else {
        brokenFeatures.push('Login - Autenticação falhou');
        console.log('❌ Login falhou');
        return false;
      }
    } catch (error) {
      brokenFeatures.push(`Login - Erro ao tentar autenticar: ${error.message}`);
      return false;
    }
  }
  
  return false;
}

async function testAuthenticatedApp(page, workingFeatures, brokenFeatures, foundRoutes) {
  console.log('🏠 Testando aplicação autenticada...');
  
  // Verificar elementos principais da interface
  const sidebar = await page.locator('.sidebar, nav, [role="navigation"]').count();
  const header = await page.locator('header, .header, [role="banner"]').count();
  const mainContent = await page.locator('main, .main, [role="main"]').count();
  
  if (sidebar > 0) workingFeatures.push('Interface - Sidebar presente');
  else brokenFeatures.push('Interface - Sidebar ausente');
  
  if (header > 0) workingFeatures.push('Interface - Header presente');
  else brokenFeatures.push('Interface - Header ausente');
  
  if (mainContent > 0) workingFeatures.push('Interface - Conteúdo principal presente');
  else brokenFeatures.push('Interface - Conteúdo principal ausente');
  
  // Procurar por links de navegação
  const allLinks = await page.locator('a[href^="/"], a[href^="#/"]').all();
  
  for (const link of allLinks.slice(0, 10)) { // Limitar para evitar muitos links
    try {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && !foundRoutes.includes(href)) {
        foundRoutes.push(href);
        console.log(`🔗 Rota encontrada: ${href} (${text?.trim() || 'sem texto'})`);
      }
    } catch (error) {
      // Ignorar erros de links específicos
    }
  }
}

async function mapAvailableRoutes(page, foundRoutes, workingFeatures, brokenFeatures) {
  const routesToTest = [
    '/',
    '/dashboard', 
    '/patients',
    '/appointments',
    '/anamnese',
    '/communication',
    '/therapists',
    '/administration',
    '/profile'
  ];
  
  for (const route of routesToTest) {
    try {
      console.log(`🔍 Testando rota: ${route}`);
      
      const response = await page.goto(`https://sapere-system.vercel.app${route}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      if (response && response.status() === 200) {
        workingFeatures.push(`Rota ${route} - Acessível (200)`);
        foundRoutes.push(route);
        
        // Screenshot da rota
        const routeName = route === '/' ? 'root' : route.replace('/', '');
        await page.screenshot({ path: `screenshots/route-${routeName}.png`, fullPage: true });
        
        // Verificar se tem conteúdo
        const hasContent = await page.locator('main, .main, .content, [role="main"]').count() > 0;
        if (hasContent) {
          workingFeatures.push(`Rota ${route} - Tem conteúdo`);
        } else {
          brokenFeatures.push(`Rota ${route} - Sem conteúdo principal`);
        }
        
      } else {
        const status = response ? response.status() : 'timeout';
        brokenFeatures.push(`Rota ${route} - Erro ${status}`);
      }
      
      await page.waitForTimeout(1000);
      
    } catch (error) {
      brokenFeatures.push(`Rota ${route} - Erro: ${error.message}`);
    }
  }
}

async function testSpecificFunctionalities(page, workingFeatures, brokenFeatures) {
  // Voltar para página principal
  await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Testar formulários
  const forms = await page.locator('form').count();
  if (forms > 0) {
    workingFeatures.push(`Funcionalidades - ${forms} formulário(s) encontrado(s)`);
  }
  
  // Testar botões interativos
  const buttons = await page.locator('button:not([disabled])').count();
  if (buttons > 0) {
    workingFeatures.push(`Funcionalidades - ${buttons} botão(ões) ativo(s)`);
  }
  
  // Testar modais
  const modals = await page.locator('.modal, [role="dialog"], [role="alertdialog"]').count();
  if (modals > 0) {
    workingFeatures.push(`Funcionalidades - ${modals} modal(s) disponível(is)`);
  }
  
  // Testar tabelas
  const tables = await page.locator('table, .table, [role="table"]').count();
  if (tables > 0) {
    workingFeatures.push(`Funcionalidades - ${tables} tabela(s) encontrada(s)`);
  }
}

async function testResponsiveness(page) {
  const viewports = [
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/main-responsive-${viewport.name}.png`, fullPage: true });
    console.log(`📱 Screenshot ${viewport.name} capturada`);
  }
  
  // Voltar para desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
}