import { test, expect } from '@playwright/test';

test.describe('Sapere System Production Examination', () => {
  const PROD_URL = 'https://sapere-system.vercel.app';
  
  test('Complete examination of production application', async ({ page }) => {
    console.log('\n🌐 EXAME COMPLETO DA APLICAÇÃO EM PRODUÇÃO\n');
    
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 1. Acessar a aplicação
    console.log('🚀 Acessando aplicação em produção...');
    await page.goto(PROD_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);
    
    await page.screenshot({ path: 'screenshots/prod-01-initial.png', fullPage: true });
    
    // 2. Verificar se foi redirecionado para login
    if (currentUrl.includes('/login')) {
      console.log('✅ Aplicação redirecionou para login corretamente');
      await examineLoginPage(page);
      
      // 3. Tentar fazer login com credenciais de teste
      const loginSuccess = await attemptLogin(page);
      
      if (loginSuccess) {
        await examineAuthenticatedArea(page);
      }
    } else {
      console.log('❓ Não foi redirecionado para login, examinando página atual...');
      await examinePage(page, 'initial');
    }
    
    // 4. Examinar diferentes viewports (responsividade)
    await testResponsiveness(page);
    
    // 5. Tentar acessar rotas específicas
    await examineSpecificRoutes(page);
    
    // 6. Verificar erros do console
    if (consoleErrors.length > 0) {
      console.log('🚨 ERROS ENCONTRADOS NO CONSOLE:');
      consoleErrors.forEach(error => console.log(`   ❌ ${error}`));
    } else {
      console.log('✅ Nenhum erro encontrado no console');
    }
    
    console.log('\n✅ EXAME DA APLICAÇÃO EM PRODUÇÃO CONCLUÍDO\n');
  });
});

async function examineLoginPage(page) {
  console.log('🔐 Examinando página de login...');
  
  // Verificar elementos básicos
  const title = await page.title();
  console.log(`📰 Título da página: ${title}`);
  
  const emailInput = await page.locator('input[type="email"], input[name="email"]');
  const passwordInput = await page.locator('input[type="password"], input[name="password"]');
  const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');
  
  const hasEmailField = await emailInput.count() > 0;
  const hasPasswordField = await passwordInput.count() > 0;
  const hasSubmitButton = await submitButton.count() > 0;
  
  console.log(`📧 Campo de email: ${hasEmailField ? '✅' : '❌'}`);
  console.log(`🔑 Campo de senha: ${hasPasswordField ? '✅' : '❌'}`);
  console.log(`🔘 Botão de submit: ${hasSubmitButton ? '✅' : '❌'}`);
  
  // Verificar logo/branding
  const logo = await page.locator('img[alt*="Sapere"], img[src*="logo"], .logo').count();
  console.log(`🎨 Logo encontrado: ${logo > 0 ? '✅' : '❌'}`);
  
  // Capturar screenshot do login
  await page.screenshot({ path: 'screenshots/prod-02-login.png', fullPage: true });
}

async function attemptLogin(page) {
  console.log('🔑 Tentando fazer login com credenciais de teste...');
  
  const credentials = [
    { email: 'admin@sapere.com', password: 'admin123', role: 'Administrador' },
    { email: 'psi@sapere.com', password: 'psi123', role: 'Psicóloga' },
    { email: 'fono@sapere.com', password: 'fono123', role: 'Fonoaudiólogo' },
    { email: 'to@sapere.com', password: 'to123', role: 'Terapeuta Ocupacional' }
  ];
  
  for (const cred of credentials) {
    try {
      console.log(`🧪 Testando login: ${cred.role} (${cred.email})`);
      
      const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
      const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        await emailInput.clear();
        await emailInput.fill(cred.email);
        await passwordInput.clear();
        await passwordInput.fill(cred.password);
        
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          const newUrl = page.url();
          if (!newUrl.includes('/login')) {
            console.log(`✅ Login bem-sucedido como ${cred.role}!`);
            await page.screenshot({ path: `screenshots/prod-03-${cred.role.toLowerCase().replace(' ', '-')}-dashboard.png`, fullPage: true });
            return true;
          } else {
            console.log(`❌ Login falhou para ${cred.role}`);
            // Verificar se há mensagem de erro
            const errorMsg = await page.locator('.error, .alert-error, [role="alert"]').textContent();
            if (errorMsg) {
              console.log(`   💬 Mensagem de erro: ${errorMsg}`);
            }
          }
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao tentar login como ${cred.role}: ${error.message}`);
    }
  }
  
  return false;
}

async function examineAuthenticatedArea(page) {
  console.log('🏠 Examinando área autenticada...');
  
  // Verificar elementos de navegação
  const sidebar = await page.locator('.sidebar, nav, [role="navigation"]').count();
  const header = await page.locator('header, .header, [role="banner"]').count();
  
  console.log(`📚 Sidebar/navegação: ${sidebar > 0 ? '✅' : '❌'}`);
  console.log(`🎯 Header: ${header > 0 ? '✅' : '❌'}`);
  
  // Verificar menu items principais
  const menuItems = [
    'Dashboard', 'Pacientes', 'Agendamentos', 'Anamnese', 
    'Comunicação', 'Terapeutas', 'Administração', 'Perfil'
  ];
  
  console.log('📋 Verificando items do menu:');
  for (const item of menuItems) {
    const menuItem = await page.locator(`a:has-text("${item}"), button:has-text("${item}"), [data-testid*="${item.toLowerCase()}"]`).count();
    console.log(`   ${item}: ${menuItem > 0 ? '✅' : '❌'}`);
  }
  
  // Tentar navegar para diferentes seções
  const sectionsToTest = ['Pacientes', 'Agendamentos', 'Anamnese'];
  
  for (const section of sectionsToTest) {
    try {
      const sectionLink = await page.locator(`a:has-text("${section}"), button:has-text("${section}")`).first();
      if (await sectionLink.isVisible()) {
        console.log(`📄 Navegando para: ${section}`);
        await sectionLink.click();
        await page.waitForTimeout(2000);
        
        const sectionName = section.toLowerCase().replace('ç', 'c').replace('õ', 'o');
        await page.screenshot({ path: `screenshots/prod-04-${sectionName}.png`, fullPage: true });
        
        const pageContent = await page.textContent('body');
        if (pageContent && pageContent.length > 100) {
          console.log(`   ✅ Seção ${section} carregou com sucesso`);
        } else {
          console.log(`   ❓ Seção ${section} pode estar vazia`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Erro ao navegar para ${section}: ${error.message}`);
    }
  }
}

async function testResponsiveness(page) {
  console.log('📱 Testando responsividade...');
  
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/prod-05-${viewport.name}.png`, fullPage: true });
    console.log(`📱 Screenshot ${viewport.name} (${viewport.width}x${viewport.height}) capturada`);
  }
}

async function examineSpecificRoutes(page) {
  console.log('🗺️ Examinando rotas específicas...');
  
  const baseUrl = 'https://sapere-system.vercel.app';
  const routes = [
    '/login',
    '/dashboard',
    '/patients',
    '/appointments', 
    '/anamnese',
    '/communication',
    '/profile'
  ];
  
  for (const route of routes) {
    try {
      console.log(`📍 Testando rota: ${route}`);
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1500);
      
      const routeName = route.replace('/', 'root').replace('/', '-') || 'home';
      await page.screenshot({ path: `screenshots/prod-route-${routeName}.png`, fullPage: true });
      
      const statusOk = page.url().includes(baseUrl);
      console.log(`   ${statusOk ? '✅' : '❌'} Rota ${route}`);
    } catch (error) {
      console.log(`   ❌ Erro ao acessar ${route}: ${error.message}`);
    }
  }
}

async function examinePage(page, pageName) {
  const forms = await page.locator('form').count();
  const buttons = await page.locator('button').count();
  const inputs = await page.locator('input').count();
  const links = await page.locator('a').count();
  
  console.log(`📊 Análise da página ${pageName}:`);
  console.log(`   📝 Formulários: ${forms}`);
  console.log(`   🔘 Botões: ${buttons}`);
  console.log(`   📋 Inputs: ${inputs}`);
  console.log(`   🔗 Links: ${links}`);
}