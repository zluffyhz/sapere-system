const { chromium } = require('playwright');

(async () => {
  console.log('🔍 TESTANDO CORREÇÃO DO DEPLOYMENT VERCEL\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login first
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    console.log('🔐 Fazendo login...');
    
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Login OK\n');
    
    // Test direct navigation to /patients
    console.log('🎯 TESTANDO NAVEGAÇÃO DIRETA PARA /patients...');
    await page.goto('https://sapere-system.vercel.app/patients', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    
    // Check if we get a 404 or if the page loads
    const currentUrl = page.url();
    console.log(`📍 URL final: ${currentUrl}`);
    
    // Check for 404 error
    const has404 = await page.locator('text=404').count() > 0 || 
                   await page.locator('text=NOT_FOUND').count() > 0;
    
    if (has404) {
      console.log('❌ AINDA TEMOS 404 - Deployment não funcionou ainda');
      await page.screenshot({ path: 'deployment-still-404.png' });
    } else {
      // Check if patients page content loaded
      const hasPatientTitle = await page.locator('h1:has-text("Pacientes")').count() > 0;
      const hasNewPatientButton = await page.locator('button:has-text("Novo Paciente")').count() > 0;
      const hasPatientData = await page.locator('table, .card:has-text("João Silva")').count() > 0;
      
      console.log(`📋 Título "Pacientes": ${hasPatientTitle ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
      console.log(`🔘 Botão "Novo Paciente": ${hasNewPatientButton ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
      console.log(`📊 Dados de pacientes: ${hasPatientData ? '✅ ENCONTRADOS' : '❌ NÃO ENCONTRADOS'}`);
      
      if (hasPatientTitle && hasNewPatientButton) {
        console.log('\n🎉 SUCESSO! CORREÇÃO FUNCIONOU!');
        
        // Test the button
        console.log('🧪 Testando botão "Novo Paciente"...');
        await page.locator('button:has-text("Novo Paciente")').click();
        await page.waitForTimeout(2000);
        
        const modalVisible = await page.locator('.modal:visible, [role="dialog"]:visible').count() > 0;
        console.log(`📝 Modal: ${modalVisible ? '✅ ABERTO' : '❌ FECHADO'}`);
        
        if (modalVisible) {
          await page.screenshot({ path: 'deployment-success-modal.png' });
          console.log('🎊 PERFEITO! Tudo funcionando após correção!');
        }
      } else {
        console.log('⚠️  Página carregou mas conteúdo não apareceu completamente');
      }
      
      await page.screenshot({ path: 'deployment-test-result.png' });
    }
    
    // Test other routes too
    console.log('\n🔍 Testando outras rotas...');
    const routes = ['/appointments', '/communication', '/anamnese'];
    
    for (const route of routes) {
      console.log(`\n📋 Testando ${route}...`);
      await page.goto(`https://sapere-system.vercel.app${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const has404 = await page.locator('text=404').count() > 0;
      console.log(`   ${route}: ${has404 ? '❌ 404' : '✅ OK'}`);
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('\n🏁 TESTE DE DEPLOYMENT CONCLUÍDO!');
})();