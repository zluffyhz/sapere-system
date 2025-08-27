const { chromium } = require('playwright');

(async () => {
  console.log('🧭 TESTE NAVEGAÇÃO DIRETA - FORÇAR FUNCIONAMENTO\n');
  
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
    
    console.log('✅ Login OK\n');
    
    // FORÇAR navegação via window.history.pushState
    console.log('🔧 FORÇANDO navegação para /patients via JavaScript...');
    await page.evaluate(() => {
      console.log('Forçando navegação...');
      window.history.pushState({}, '', '/patients');
      
      // Disparar evento popstate para React Router detectar
      const event = new PopStateEvent('popstate', { state: {} });
      window.dispatchEvent(event);
      
      // Forçar re-render
      const event2 = new Event('hashchange');
      window.dispatchEvent(event2);
    });
    
    await page.waitForTimeout(3000);
    console.log(`📍 URL após forçar: ${page.url()}`);
    
    // Screenshot
    await page.screenshot({ path: 'debug-forced-navigation.png' });
    
    // Verificar se consegue encontrar conteúdo de pacientes
    const hasPatientTitle = await page.locator('h1:has-text("Pacientes")').count() > 0;
    const hasNewPatientButton = await page.locator('button:has-text("Novo Paciente")').count() > 0;
    const hasPatientTable = await page.locator('table').count() > 0;
    
    console.log(`📋 Título "Pacientes": ${hasPatientTitle ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    console.log(`🔘 Botão "Novo Paciente": ${hasNewPatientButton ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    console.log(`📊 Tabela de pacientes: ${hasPatientTable ? 'ENCONTRADA' : 'NÃO ENCONTRADA'}`);
    
    if (hasNewPatientButton) {
      console.log('\n🎯 TESTANDO BOTÃO "NOVO PACIENTE"...');
      await page.locator('button:has-text("Novo Paciente")').click();
      await page.waitForTimeout(2000);
      
      const modalVisible = await page.locator('.modal:visible, [role="dialog"]:visible').count() > 0;
      console.log(`📝 Modal aberto: ${modalVisible ? 'SIM' : 'NÃO'}`);
      
      if (modalVisible) {
        await page.screenshot({ path: 'debug-modal-success.png' });
        console.log('🎉 BOTÃO FUNCIONA PERFEITAMENTE!');
        
        // Verificar campos do modal
        const nameField = await page.locator('input[placeholder*="nome"], input:near(:text("Nome"))').count();
        const phoneField = await page.locator('input[type="tel"], input[placeholder*="telefone"]').count();
        console.log(`📝 Campo nome: ${nameField > 0 ? 'OK' : 'FALTA'}`);
        console.log(`📞 Campo telefone: ${phoneField > 0 ? 'OK' : 'FALTA'}`);
      }
    }
    
    // Tentar outras rotas também
    const routesToTest = ['/appointments', '/communication', '/anamnese'];
    for (const route of routesToTest) {
      console.log(`\n🔧 Testando ${route}...`);
      await page.evaluate((r) => {
        window.history.pushState({}, '', r);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }, route);
      
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      const hasContent = await page.locator('h1, .card, button').count() > 3;
      console.log(`   URL: ${currentUrl.includes(route) ? 'OK' : 'FAIL'}`);
      console.log(`   Conteúdo: ${hasContent ? 'OK' : 'VAZIO'}`);
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
    await page.screenshot({ path: 'debug-final-error.png' });
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\n✅ TESTE FINAL CONCLUÍDO!');
})();