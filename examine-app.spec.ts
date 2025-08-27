import { test, expect, Page } from '@playwright/test';

test.describe('Sapere System Examination', () => {
  const BASE_URL = 'http://localhost:5173';
  
  test('Examine application structure and functionality', async ({ page }) => {
    console.log('\n🔍 INICIANDO EXAME COMPLETO DO SISTEMA SAPERE\n');
    
    // 1. Teste da página inicial
    console.log('📱 Testando página inicial...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Screenshot da tela inicial
    await page.screenshot({ path: 'screenshots/01-inicial.png', fullPage: true });
    console.log('✅ Screenshot da página inicial salva');
    
    // Verificar título e elementos básicos
    const title = await page.title();
    console.log(`📋 Título da página: ${title}`);
    
    // 2. Teste da página de login
    console.log('\n🔐 Examinando sistema de autenticação...');
    
    // Verificar se existe formulário de login
    const loginForm = await page.locator('form, [data-testid="login"], input[type="email"], input[type="password"]').first();
    if (await loginForm.isVisible()) {
      console.log('✅ Formulário de login encontrado');
      
      // Screenshot do login
      await page.screenshot({ path: 'screenshots/02-login.png', fullPage: true });
      
      // Examinar campos do formulário
      const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
      
      if (await emailInput.isVisible()) {
        console.log('📧 Campo de email encontrado');
      }
      if (await passwordInput.isVisible()) {
        console.log('🔑 Campo de senha encontrado');
      }
      
      // Tentar login com credenciais de teste
      const testCredentials = [
        { email: 'admin@sapere.com', password: 'admin123' },
        { email: 'admin@admin.com', password: 'admin' },
        { email: 'test@test.com', password: 'test' }
      ];
      
      for (const creds of testCredentials) {
        try {
          console.log(`🧪 Testando login com: ${creds.email}`);
          
          await emailInput.fill(creds.email);
          await passwordInput.fill(creds.password);
          
          // Encontrar botão de submit
          const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Verificar se o login foi bem-sucedido
            const currentUrl = page.url();
            if (currentUrl !== BASE_URL && !currentUrl.includes('login')) {
              console.log(`✅ Login bem-sucedido com ${creds.email}`);
              await examineAuthenticatedArea(page);
              break;
            } else {
              console.log(`❌ Login falhou com ${creds.email}`);
            }
          }
        } catch (error) {
          console.log(`❌ Erro ao tentar login com ${creds.email}: ${error.message}`);
        }
      }
    } else {
      console.log('❌ Formulário de login não encontrado na página inicial');
      // Procurar por link/botão de login
      const loginLink = await page.locator('a:has-text("Login"), a:has-text("Entrar"), button:has-text("Login")').first();
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/02-login-page.png', fullPage: true });
      }
    }
    
    // 3. Examinar estrutura geral da aplicação
    console.log('\n🏗️ Examinando estrutura da aplicação...');
    await examineApplicationStructure(page);
    
    // 4. Testar responsividade
    console.log('\n📱 Testando responsividade...');
    await testResponsiveness(page);
    
    // 5. Examinar console logs e errors
    console.log('\n🐛 Verificando erros no console...');
    await examineConsoleErrors(page);
    
    console.log('\n✅ EXAME COMPLETO FINALIZADO - Verifique a pasta screenshots/\n');
  });
});

async function examineAuthenticatedArea(page: Page) {
  console.log('\n🏠 Examinando área autenticada...');
  
  // Screenshot do dashboard/área principal
  await page.screenshot({ path: 'screenshots/03-dashboard.png', fullPage: true });
  
  // Procurar por elementos de navegação
  const navElements = await page.locator('nav, [role="navigation"], .sidebar, .header, .navbar').all();
  console.log(`🧭 Encontrados ${navElements.length} elementos de navegação`);
  
  // Listar todas as páginas/rotas disponíveis
  const links = await page.locator('a[href], button[data-route], [data-testid*="nav"]').all();
  console.log(`🔗 Encontrados ${links.length} links/rotas`);
  
  // Examinar principais seções
  const sections = [
    'dashboard', 'pacientes', 'agendamentos', 'anamnese', 
    'prontuarios', 'comunicacao', 'terapeutas', 'admin'
  ];
  
  for (const section of sections) {
    const sectionLink = await page.locator(`a:has-text("${section}" i), button:has-text("${section}" i), [data-testid*="${section}"]`).first();
    if (await sectionLink.isVisible()) {
      try {
        console.log(`📄 Navegando para seção: ${section}`);
        await sectionLink.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `screenshots/04-${section.toLowerCase()}.png`, fullPage: true });
      } catch (error) {
        console.log(`❌ Erro ao navegar para ${section}: ${error.message}`);
      }
    }
  }
}

async function examineApplicationStructure(page: Page) {
  // Examinar elementos principais da página
  const mainElements = await page.locator('main, .main, #main, [role="main"]').all();
  console.log(`📋 Encontrados ${mainElements.length} elementos principais`);
  
  const headers = await page.locator('header, .header, [role="banner"]').all();
  console.log(`🎯 Encontrados ${headers.length} cabeçalhos`);
  
  const sidebars = await page.locator('.sidebar, nav, [role="navigation"]').all();
  console.log(`📚 Encontrados ${sidebars.length} elementos de navegação`);
  
  // Examinar formulários
  const forms = await page.locator('form').all();
  console.log(`📝 Encontrados ${forms.length} formulários`);
  
  // Examinar tabelas
  const tables = await page.locator('table, .table, [role="table"]').all();
  console.log(`📊 Encontradas ${tables.length} tabelas`);
  
  // Examinar modais
  const modals = await page.locator('.modal, [role="dialog"], [role="alertdialog"]').all();
  console.log(`🪟 Encontrados ${modals.length} modais`);
}

async function testResponsiveness(page: Page) {
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/05-${viewport.name}.png`, fullPage: true });
    console.log(`📱 Screenshot ${viewport.name} (${viewport.width}x${viewport.height}) capturada`);
  }
}

async function examineConsoleErrors(page: Page) {
  const logs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else {
      logs.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  // Aguardar um pouco para capturar logs
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.log('🚨 ERROS ENCONTRADOS:');
    errors.forEach(error => console.log(`   ❌ ${error}`));
  } else {
    console.log('✅ Nenhum erro crítico encontrado no console');
  }
  
  if (logs.length > 0) {
    console.log(`📝 ${logs.length} mensagens de console capturadas`);
  }
}