const { chromium } = require('playwright');

(async () => {
  console.log('🔘 TESTE SIMPLES DE BOTÕES\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login
    console.log('🔐 Login...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      console.log('❌ Login falhou');
      await browser.close();
      return;
    }
    
    console.log('✅ Login OK\n');
    
    // Testar página de pacientes especificamente
    console.log('📋 Testando página de Pacientes...');
    await page.goto('https://sapere-system.vercel.app/patients', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await page.waitForTimeout(3000);
    
    // Screenshot da página
    await page.screenshot({ path: 'debug-patients-page.png', fullPage: true });
    
    // Verificar se carregou corretamente
    const title = await page.textContent('h1');
    console.log(`📄 Título da página: ${title}`);
    
    // Procurar por botão "Novo Paciente"
    const addButton = await page.locator('button:has-text("Novo Paciente")').count();
    console.log(`🔘 Botão "Novo Paciente": ${addButton > 0 ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    
    if (addButton > 0) {
      console.log('🎯 Clicando no botão...');
      await page.locator('button:has-text("Novo Paciente")').click();
      await page.waitForTimeout(2000);
      
      // Verificar se modal abriu
      const modal = await page.locator('.modal:visible, [role="dialog"]:visible').count();
      console.log(`📝 Modal aberto: ${modal > 0 ? 'SIM' : 'NÃO'}`);
      
      if (modal > 0) {
        await page.screenshot({ path: 'debug-modal-opened.png' });
        console.log('✅ BOTÃO FUNCIONA - Modal aberto!');
      } else {
        console.log('❌ BOTÃO NÃO FUNCIONA - Modal não abriu');
      }
    }
    
    // Verificar elementos na página
    const buttons = await page.locator('button').count();
    const forms = await page.locator('form').count();
    const tables = await page.locator('table').count();
    
    console.log(`📊 Elementos encontrados: ${buttons} botões, ${forms} forms, ${tables} tabelas`);
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
    await page.screenshot({ path: 'debug-error.png' });
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\n✅ TESTE CONCLUÍDO!');
})();