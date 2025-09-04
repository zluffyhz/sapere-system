import { test, expect, Page } from '@playwright/test';

test.describe('Sapere System Detailed Examination', () => {
  const BASE_URL = 'http://localhost:5173';
  
  test('Detailed examination with login flow', async ({ page }) => {
    console.log('\n🔍 EXAME DETALHADO DO SISTEMA SAPERE\n');
    
    // Capturar erros do console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 1. Verificar se a aplicação carrega
    console.log('🌐 Acessando aplicação...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);
    
    await page.screenshot({ path: 'screenshots/detailed-01-initial.png', fullPage: true });
    
    // 2. Verificar se foi redirecionado para login
    if (currentUrl.includes('/login')) {
      console.log('✅ Redirecionado para página de login');
      await examineLoginPage(page);
    } else {
      console.log('❓ Não foi redirecionado para login, examinando página atual...');
      await examinePage(page, 'initial');
    }
    
    // 3. Tentar acessar login diretamente
    console.log('\n🔐 Navegando para /login diretamente...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/detailed-02-login.png', fullPage: true });
    await examineLoginPage(page);
    
    // 4. Tentar login com credenciais de teste
    const success = await attemptLogin(page);
    
    if (success) {
      console.log('\n🎉 Login bem-sucedido, examinando área autenticada...');
      await examineAuthenticatedArea(page);
    }
    
    // 5. Examinar outras rotas importantes
    await examineRoutes(page);
    
    // 6. Verificar console errors
    if (consoleErrors.length > 0) {
      console.log('\n🚨 ERROS ENCONTRADOS NO CONSOLE:');
      consoleErrors.forEach(error => console.log(`   ❌ ${error}`));
    } else {
      console.log('\n✅ Nenhum erro encontrado no console');
    }
    
    console.log('\n✅ EXAME DETALHADO CONCLUÍDO\n');
  });
});

async function examineLoginPage(page: Page) {
  console.log('🔐 Examinando página de login...');
  
  // Verificar elementos do formulário
  const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  const passwordInput = await page.locator('input[type="password"], input[name="password"]');
  const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');
  
  if (await emailInput.count() > 0) {
    console.log('📧 Campo de email encontrado');
  }
  if (await passwordInput.count() > 0) {
    console.log('🔑 Campo de senha encontrado');
  }
  if (await submitButton.count() > 0) {
    console.log('🔘 Botão de login encontrado');
  }
  
  // Verificar texto da página
  const pageText = await page.textContent('body');
  console.log(`📝 Conteúdo da página (primeiros 200 chars): ${pageText?.substring(0, 200) || 'Vazio'}`);
}

async function attemptLogin(page: Page): Promise<boolean> {
  console.log('\n🧪 Tentando login com credenciais de teste...');
  
  const testCredentials = [
    { email: 'admin@sapere.com', password: 'admin123' },
    { email: 'psi@sapere.com', password: 'psi123' },
    { email: 'fono@sapere.com', password: 'fono123' },
    { email: 'to@sapere.com', password: 'to123' }
  ];
  
  for (const creds of testCredentials) {
    try {
      console.log(`🔑 Testando: ${creds.email} / ${creds.password}`);
      
      const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
      const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible() && await submitButton.isVisible()) {
        await emailInput.fill(creds.email);
        await passwordInput.fill(creds.password);
        await submitButton.click();
        
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          console.log(`✅ Login bem-sucedido com ${creds.email}!`);
          await page.screenshot({ path: 'screenshots/detailed-03-authenticated.png', fullPage: true });
          return true;
        } else {
          console.log(`❌ Login falhou com ${creds.email}`);
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao tentar login: ${error.message}`);
    }
  }
  
  return false;
}

async function examineAuthenticatedArea(page: Page) {
  console.log('🏠 Examinando área autenticada...');
  
  // Verificar elementos de navegação
  const navElements = await page.locator('nav, .sidebar, .navbar, [role="navigation"]');
  const navCount = await navElements.count();
  console.log(`🧭 Encontrados ${navCount} elementos de navegação`);
  
  // Verificar links de navegação
  const links = await page.locator('a[href^="/"], button[data-route]');
  const linkCount = await links.count();
  console.log(`🔗 Encontrados ${linkCount} links internos`);
  
  if (linkCount > 0) {
    console.log('🔗 Links encontrados:');
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`   • ${text?.trim() || 'Sem texto'} -> ${href || 'Sem href'}`);
    }
  }
  
  await examinePage(page, 'authenticated');
}

async function examineRoutes(page: Page) {
  console.log('\n🗺️ Examinando rotas importantes...');
  
  const routes = [
    '/debug-auth',
    '/test-roles', 
    '/nav-test',
    '/button-test',
    '/profile'
  ];
  
  for (const route of routes) {
    try {
      console.log(`📍 Testando rota: ${route}`);
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      
      const routeName = route.replace('/', '').replace('-', '_');
      await page.screenshot({ path: `screenshots/route-${routeName}.png`, fullPage: true });
      
      const pageText = await page.textContent('body');
      if (pageText && pageText.length > 50) {
        console.log(`   ✅ Rota ${route} carregou com sucesso`);
      } else {
        console.log(`   ❓ Rota ${route} pode estar vazia ou com problemas`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao acessar ${route}: ${error.message}`);
    }
  }
}

async function examinePage(page: Page, pageName: string) {
  console.log(`📊 Analisando elementos da página ${pageName}...`);
  
  // Contar elementos básicos
  const forms = await page.locator('form').count();
  const buttons = await page.locator('button').count();
  const inputs = await page.locator('input').count();
  const links = await page.locator('a').count();
  const images = await page.locator('img').count();
  
  console.log(`   📝 Formulários: ${forms}`);
  console.log(`   🔘 Botões: ${buttons}`);
  console.log(`   📋 Inputs: ${inputs}`);
  console.log(`   🔗 Links: ${links}`);
  console.log(`   🖼️ Imagens: ${images}`);
  
  // Verificar se há conteúdo visível
  const bodyText = await page.textContent('body');
  const hasContent = bodyText && bodyText.trim().length > 10;
  console.log(`   📄 Tem conteúdo visível: ${hasContent ? 'Sim' : 'Não'}`);
  
  if (hasContent && bodyText) {
    const preview = bodyText.substring(0, 150).replace(/\s+/g, ' ').trim();
    console.log(`   📖 Preview: "${preview}..."`);
  }
}