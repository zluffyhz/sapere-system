const { chromium } = require('playwright');

(async () => {
  console.log('🎯 TESTE FINAL - HashRouter Solution\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login first
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    console.log('🔐 Fazendo login...');
    
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    console.log('✅ Login OK\n');
    
    // Test HashRouter URLs (com #)
    const hashRoutes = [
      { url: 'https://sapere-system.vercel.app/#/patients', name: 'Pacientes' },
      { url: 'https://sapere-system.vercel.app/#/appointments', name: 'Agendamentos' },
      { url: 'https://sapere-system.vercel.app/#/communication', name: 'Comunicação' },
      { url: 'https://sapere-system.vercel.app/#/anamnese', name: 'Anamnese' }
    ];
    
    console.log('🎯 TESTANDO URLs COM HASHROUTER (#)...\n');
    
    for (const route of hashRoutes) {
      console.log(`🔍 Testando: ${route.name}`);
      
      // Navigate directly to hash URL
      await page.goto(route.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      
      // Check for 404
      const has404 = await page.locator('text=404').count() > 0 || 
                     await page.locator('text=NOT_FOUND').count() > 0;
      
      if (has404) {
        console.log(`   ❌ 404 - ${route.url}`);
      } else {
        // Check if the page loaded correctly
        const hasTitle = await page.locator(`h1:has-text("${route.name}")`).count() > 0;
        const hasAddButton = await page.locator('button:has-text("Novo"), button:has-text("Adicionar"), button:has-text("Criar")').count() > 0;
        
        console.log(`   ✅ Carregou - ${currentUrl}`);
        console.log(`   📋 Título: ${hasTitle ? '✅' : '❌'}`);
        console.log(`   🔘 Botão: ${hasAddButton ? '✅' : '❌'}`);
        
        if (route.name === 'Pacientes' && hasAddButton) {
          console.log('\n🧪 TESTANDO BOTÃO "NOVO PACIENTE"...');
          try {
            await page.locator('button:has-text("Novo Paciente")').click();
            await page.waitForTimeout(2000);
            
            const modalVisible = await page.locator('.modal:visible, [role="dialog"]:visible').count() > 0;
            console.log(`   📝 Modal: ${modalVisible ? '✅ ABERTO' : '❌ FECHADO'}`);
            
            if (modalVisible) {
              console.log('   🎉 BOTÃO FUNCIONANDO PERFEITAMENTE!');
              await page.screenshot({ path: 'hashrouter-success.png' });
            }
          } catch (err) {
            console.log(`   ⚠️  Erro ao testar botão: ${err.message}`);
          }
        }
      }
      
      console.log(''); // linha em branco
    }
    
    // Test if normal URLs (without #) redirect to hash
    console.log('🔄 TESTANDO REDIRECTS PARA HASHROUTER...\n');
    
    const normalRoutes = ['/patients', '/appointments'];
    
    for (const route of normalRoutes) {
      console.log(`🔍 Testando redirect: ${route}`);
      
      await page.goto(`https://sapere-system.vercel.app${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const finalUrl = page.url();
      const redirected = finalUrl.includes('#');
      
      console.log(`   URL final: ${finalUrl}`);
      console.log(`   Redirected: ${redirected ? '✅ SIM' : '❌ NÃO'}`);
      console.log('');
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('🏁 TESTE HASHROUTER CONCLUÍDO!');
})();