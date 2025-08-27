const { chromium } = require('playwright');

(async () => {
  console.log('🔑 TESTANDO CREDENCIAIS CORRETAS - admin@sapere.com.br / Sapere@2025\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Aguardar um pouco para o deploy do Vercel
    console.log('⏳ Aguardando deploy Vercel (30 segundos)...');
    await page.waitForTimeout(30000);
    
    console.log('🚀 Acessando aplicação após deploy...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log(`📍 URL atual: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/test-new-creds-01.png', fullPage: true });
    
    // Verificar se está na página de login
    const emailField = await page.locator('input[type="email"], input[name="email"]');
    const passwordField = await page.locator('input[type="password"], input[name="password"]');
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      console.log('✅ Formulário de login encontrado!');
      
      // Testar com credenciais corretas
      console.log('🔐 Fazendo login com: admin@sapere.com.br / Sapere@2025');
      
      await emailField.fill('admin@sapere.com.br');
      await passwordField.fill('Sapere@2025');
      
      const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar")').first();
      await submitButton.click();
      
      console.log('⏳ Aguardando resposta da autenticação...');
      await page.waitForTimeout(5000);
      
      const finalUrl = page.url();
      console.log(`📍 URL final: ${finalUrl}`);
      
      if (!finalUrl.includes('/login')) {
        console.log('🎉 LOGIN BEM-SUCEDIDO!');
        console.log('✅ Sistema funcionando corretamente!');
        
        await page.screenshot({ path: 'screenshots/test-new-creds-success.png', fullPage: true });
        
        // Testar navegação para outras páginas
        const testRoutes = ['/patients', '/appointments', '/dashboard'];
        
        for (const route of testRoutes) {
          try {
            await page.goto(`https://sapere-system.vercel.app${route}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            const routeName = route.replace('/', '') || 'home';
            await page.screenshot({ path: `screenshots/test-${routeName}-working.png`, fullPage: true });
            
            if (page.url().includes(route) && !page.url().includes('/login')) {
              console.log(`✅ Rota ${route} funcionando!`);
            } else {
              console.log(`❌ Rota ${route} redirecionou para login`);
            }
          } catch (error) {
            console.log(`❌ Erro ao testar ${route}: ${error.message}`);
          }
        }
        
      } else {
        console.log('❌ Login falhou - ainda na página de login');
        
        // Verificar mensagem de erro
        const errorMsg = await page.locator('.error, .alert-error, [role="alert"]').textContent();
        if (errorMsg) {
          console.log(`💬 Mensagem de erro: ${errorMsg}`);
        }
      }
    } else {
      console.log('❌ Formulário de login não encontrado');
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
  }
  
  console.log('\n⏳ Aguardando 10 segundos para visualização...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('\n✅ TESTE CONCLUÍDO!\n');
})();