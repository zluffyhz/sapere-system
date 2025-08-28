const { chromium } = require('playwright');

(async () => {
  console.log('🔗 TESTE DEFINITIVO - LINKS DO DASHBOARD\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    console.log('✅ Login OK - Dashboard carregado\n');
    
    // TESTAR OS LINKS DO DASHBOARD (não os botões, os LINKS AZUIS)
    console.log('🔗 TESTANDO LINK: "Ver todos os pacientes"...');
    
    // Screenshot antes
    await page.screenshot({ path: 'dashboard-before-link.png' });
    
    // Clicar no link "Ver todos os pacientes →"
    const linkExists = await page.locator('a:has-text("Ver todos os pacientes")').count();
    console.log(`Link encontrado: ${linkExists > 0 ? 'SIM' : 'NÃO'}`);
    
    if (linkExists > 0) {
      console.log('🖱️  Clicando no link...');
      await page.locator('a:has-text("Ver todos os pacientes")').click();
      await page.waitForTimeout(5000); // Aguardar mais tempo
      
      // Screenshot depois
      await page.screenshot({ path: 'after-patients-link.png', fullPage: true });
      
      const currentUrl = page.url();
      console.log(`📍 URL atual: ${currentUrl}`);
      
      // Verificar se a página mudou de alguma forma
      const pageContent = await page.textContent('body');
      const hasPatientContent = pageContent.includes('Pacientes') || pageContent.includes('paciente');
      const hasNewPatientButton = await page.locator('button:has-text("Novo Paciente"), button:has-text("Adicionar")').count() > 0;
      const hasTableOrCard = await page.locator('table, .card, .grid').count() > 0;
      
      console.log(`📋 Conteúdo de pacientes: ${hasPatientContent ? 'ENCONTRADO' : 'NÃO'}`);
      console.log(`🔘 Botão Novo/Adicionar: ${hasNewPatientButton ? 'ENCONTRADO' : 'NÃO'}`);
      console.log(`📊 Tabela/Cards: ${hasTableOrCard ? 'ENCONTRADOS' : 'NÃO'}`);
      
      if (hasNewPatientButton) {
        console.log('\n🎯 ENCONTREI BOTÃO! TESTANDO...');
        await page.locator('button:has-text("Novo Paciente"), button:has-text("Adicionar")').first().click();
        await page.waitForTimeout(3000);
        
        const modalVisible = await page.locator('.modal:visible, [role="dialog"]:visible, .fixed.inset-0').count() > 0;
        console.log(`📝 Modal: ${modalVisible ? '✅ ABERTO!' : '❌ FECHADO'}`);
        
        if (modalVisible) {
          await page.screenshot({ path: 'MODAL-SUCCESS-FINAL.png' });
          console.log('🎉🎉🎉 BOTÃO FUNCIONA! MODAL ABRIU! 🎉🎉🎉');
          
          // Testar preenchimento para confirmar
          const nameField = await page.locator('input[type="text"], input[placeholder*="nome"]').first();
          if (await nameField.count() > 0) {
            await nameField.fill('TESTE FINAL FUNCIONAL');
            console.log('✍️  Campo preenchido com sucesso!');
            await page.screenshot({ path: 'FORM-WORKING-FINAL.png' });
          }
          
          return; // SUCESSO!
        }
      }
      
      // Se chegou aqui, vamos analisar o que tem na página
      console.log('\n🔍 ANALISANDO CONTEÚDO DA PÁGINA...');
      const allButtons = await page.locator('button').all();
      console.log(`Total de botões: ${allButtons.length}`);
      
      for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
        try {
          const text = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          if (isVisible && text?.trim()) {
            console.log(`  Botão ${i+1}: "${text.trim()}"`);
          }
        } catch (e) {
          // Ignorar
        }
      }
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
    await page.screenshot({ path: 'error-dashboard-links.png' });
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('\n✅ TESTE DE LINKS CONCLUÍDO!');
})();