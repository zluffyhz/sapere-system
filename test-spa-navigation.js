const { chromium } = require('playwright');

(async () => {
  console.log('🧭 TESTE DE NAVEGAÇÃO SPA\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login
    console.log('🔐 Login...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    if (page.url().includes('/login')) {
      console.log('❌ Login falhou');
      await browser.close();
      return;
    }
    
    console.log('✅ Login OK - na dashboard\n');
    await page.screenshot({ path: 'spa-dashboard.png' });
    
    // Tentar navegar usando links internos da aplicação
    console.log('🔗 Procurando links de navegação...');
    const navLinks = await page.locator('a[href="/patients"], nav a[href="/patients"], .sidebar a[href="/patients"]').count();
    console.log(`   Encontrados ${navLinks} links para /patients`);
    
    if (navLinks > 0) {
      console.log('🎯 Clicando no link Pacientes...');
      await page.locator('a[href="/patients"], nav a[href="/patients"], .sidebar a[href="/patients"]').first().click();
      await page.waitForTimeout(3000);
      
      console.log(`📍 URL atual: ${page.url()}`);
      await page.screenshot({ path: 'spa-patients-via-link.png' });
      
      // Verificar se carregou corretamente
      const pageTitle = await page.locator('h1').first().textContent().catch(() => 'não encontrado');
      console.log(`📄 Título da página: ${pageTitle}`);
      
      if (pageTitle.includes('Pacientes')) {
        console.log('✅ NAVEGAÇÃO SPA FUNCIONANDO!');
        
        // Procurar botão
        const addButton = await page.locator('button:has-text("Novo Paciente")').count();
        console.log(`🔘 Botão "Novo Paciente": ${addButton > 0 ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
        
        if (addButton > 0) {
          console.log('🎯 Testando botão...');
          await page.locator('button:has-text("Novo Paciente")').click();
          await page.waitForTimeout(2000);
          
          const modal = await page.locator('.modal:visible, [role="dialog"]:visible').count();
          console.log(`📝 Modal: ${modal > 0 ? 'ABERTO' : 'FECHADO'}`);
          
          if (modal > 0) {
            await page.screenshot({ path: 'spa-modal-success.png' });
            console.log('🎉 BOTÃO FUNCIONA PERFEITAMENTE!');
          }
        }
      }
    } else {
      console.log('❌ Não encontrou links de navegação');
      
      // Listar todos os links disponíveis
      const allLinks = await page.locator('a[href^="/"]').count();
      console.log(`📋 Total de links internos: ${allLinks}`);
      
      if (allLinks > 0) {
        for (let i = 0; i < Math.min(allLinks, 5); i++) {
          const href = await page.locator('a[href^="/"]').nth(i).getAttribute('href');
          const text = await page.locator('a[href^="/"]').nth(i).textContent();
          console.log(`   ${i+1}. "${text}" -> ${href}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
    await page.screenshot({ path: 'spa-error.png' });
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\n✅ TESTE CONCLUÍDO!');
})();