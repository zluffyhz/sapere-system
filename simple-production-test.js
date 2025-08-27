const { chromium } = require('playwright');

(async () => {
  console.log('🌐 INICIANDO EXAME DA APLICAÇÃO SAPERE EM PRODUÇÃO\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Capturar logs do console
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  try {
    // 1. Acessar a aplicação
    console.log('🚀 Acessando https://sapere-system.vercel.app...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log(`📍 URL atual: ${page.url()}`);
    
    // Screenshot inicial
    await page.screenshot({ path: 'screenshots/prod-initial.png', fullPage: true });
    
    // 2. Verificar se há formulário de login
    const emailField = await page.locator('input[type="email"]');
    const passwordField = await page.locator('input[type="password"]');
    const loginButton = await page.locator('button[type="submit"], button:has-text("Entrar")');
    
    const hasLoginForm = (await emailField.count()) > 0 && (await passwordField.count()) > 0;
    
    if (hasLoginForm) {
      console.log('✅ Formulário de login encontrado!');
      
      // 3. Tentar fazer login com admin
      console.log('🔑 Tentando login com admin@sapere.com...');
      await emailField.fill('admin@sapere.com');
      await passwordField.fill('admin123');
      await loginButton.click();
      
      await page.waitForTimeout(4000);
      
      // Verificar se logou
      const newUrl = page.url();
      if (!newUrl.includes('/login')) {
        console.log('✅ Login bem-sucedido! Examinando dashboard...');
        await page.screenshot({ path: 'screenshots/prod-dashboard.png', fullPage: true });
        
        // 4. Examinar elementos da interface
        const sidebar = await page.locator('.sidebar, nav, [role="navigation"]').count();
        const header = await page.locator('header, .header').count();
        
        console.log(`📚 Sidebar/navegação encontrada: ${sidebar > 0 ? 'Sim' : 'Não'}`);
        console.log(`🎯 Header encontrado: ${header > 0 ? 'Sim' : 'Não'}`);
        
        // 5. Testar navegação
        const menuItems = ['Pacientes', 'Agendamentos', 'Anamnese', 'Comunicação'];
        
        for (const item of menuItems) {
          try {
            const menuLink = await page.locator(`a:has-text("${item}"), button:has-text("${item}")`).first();
            if (await menuLink.isVisible()) {
              console.log(`📄 Navegando para: ${item}`);
              await menuLink.click();
              await page.waitForTimeout(2000);
              
              const itemName = item.toLowerCase().replace('ç', 'c').replace('ã', 'a');
              await page.screenshot({ path: `screenshots/prod-${itemName}.png`, fullPage: true });
            }
          } catch (error) {
            console.log(`❌ Erro ao navegar para ${item}: ${error.message}`);
          }
        }
        
        // 6. Testar responsividade
        console.log('📱 Testando responsividade...');
        
        const viewports = [
          { width: 768, height: 1024, name: 'tablet' },
          { width: 375, height: 667, name: 'mobile' }
        ];
        
        for (const viewport of viewports) {
          await page.setViewportSize(viewport);
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `screenshots/prod-${viewport.name}.png`, fullPage: true });
          console.log(`📱 Screenshot ${viewport.name} capturada`);
        }
        
      } else {
        console.log('❌ Login falhou - ainda na página de login');
        
        // Verificar mensagem de erro
        const errorElement = await page.locator('.error, .alert-error, [role="alert"]');
        if (await errorElement.count() > 0) {
          const errorText = await errorElement.textContent();
          console.log(`💬 Mensagem de erro: ${errorText}`);
        }
      }
    } else {
      console.log('❌ Formulário de login não encontrado');
      
      // Verificar o que existe na página
      const pageText = await page.textContent('body');
      console.log(`📝 Conteúdo da página: ${pageText.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log(`❌ Erro durante o exame: ${error.message}`);
  }
  
  // Aguardar 5 segundos para visualizar
  console.log('⏳ Aguardando 5 segundos para visualização...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  
  console.log('\n✅ EXAME CONCLUÍDO! Verifique as screenshots na pasta screenshots/\n');
})();