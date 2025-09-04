const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTE FORÇAR NAVEGAÇÃO PROGRAMÁTICA\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    console.log('✅ Login OK\n');
    
    // FORÇAR navegação para /patients usando window.location
    console.log('🔧 FORÇANDO navegação para /patients...');
    await page.evaluate(() => {
      console.log('Antes da navegação:', window.location.href);
      window.location.href = '/patients';
    });
    
    // Aguardar a página carregar
    await page.waitForTimeout(5000);
    
    console.log(`📍 URL após forçar: ${page.url()}`);
    
    // Screenshot
    await page.screenshot({ path: 'forced-patients-page.png', fullPage: true });
    
    // Verificar se carregou a página de pacientes
    const hasPatientTitle = await page.locator('h1:has-text("Pacientes")').count() > 0;
    const hasNewPatientButton = await page.locator('button:has-text("Novo Paciente")').count() > 0;
    const hasPatientData = await page.locator('table, .card:has-text("João Silva")').count() > 0;
    
    console.log(`📋 Título "Pacientes": ${hasPatientTitle ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    console.log(`🔘 Botão "Novo Paciente": ${hasNewPatientButton ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    console.log(`📊 Dados de pacientes: ${hasPatientData ? 'ENCONTRADOS' : 'NÃO ENCONTRADOS'}`);
    
    if (hasNewPatientButton) {
      console.log('\n🎯 TESTANDO BOTÃO "NOVO PACIENTE" NA PÁGINA FORÇADA...');
      await page.locator('button:has-text("Novo Paciente")').click();
      await page.waitForTimeout(2000);
      
      const modalVisible = await page.locator('.modal:visible, [role="dialog"]:visible, .fixed.inset-0').count() > 0;
      console.log(`📝 Modal: ${modalVisible ? 'ABERTO ✅' : 'FECHADO ❌'}`);
      
      if (modalVisible) {
        await page.screenshot({ path: 'modal-patients-success.png' });
        console.log('🎉 BOTÃO FUNCIONA QUANDO NAVEGAMOS FORÇADAMENTE!');
        
        // Testar preenchimento
        const nameInput = await page.locator('input[placeholder*="nome"], input:near(:text("Nome"))').count();
        if (nameInput > 0) {
          await page.locator('input[placeholder*="nome"], input:near(:text("Nome"))').first().fill('Teste Paciente Funcional');
          console.log('✍️  Preenchimento funcionou!');
          await page.screenshot({ path: 'modal-form-filled.png' });
        }
      }
    }
    
    // Testar outras páginas forçadamente
    const pagesToTest = [
      { route: '/appointments', title: 'Agendamentos' },
      { route: '/communication', title: 'Comunicação' },
      { route: '/anamnese', title: 'Anamnese' }
    ];
    
    for (const pageTest of pagesToTest) {
      console.log(`\n🔧 Testando ${pageTest.title}...`);
      await page.evaluate((route) => {
        window.location.href = route;
      }, pageTest.route);
      
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      const hasTitle = await page.locator(`h1:has-text("${pageTest.title}")`).count() > 0;
      const hasAddButton = await page.locator('button:has-text("Adicionar"), button:has-text("Novo"), button:has-text("Criar")').count() > 0;
      
      console.log(`   URL: ${currentUrl}`);
      console.log(`   Título: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   Botão Adicionar: ${hasAddButton ? '✅' : '❌'}`);
      
      if (hasAddButton) {
        console.log(`   🎯 Testando botão...`);
        await page.locator('button:has-text("Adicionar"), button:has-text("Novo"), button:has-text("Criar")').first().click();
        await page.waitForTimeout(2000);
        
        const modal = await page.locator('.modal:visible, [role="dialog"]:visible').count() > 0;
        console.log(`   Modal: ${modal ? '✅ ABERTO' : '❌ FECHADO'}`);
      }
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\n✅ TESTE DE NAVEGAÇÃO FORÇADA CONCLUÍDO!');
})();