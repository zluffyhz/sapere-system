const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DESCOBRIR TODOS OS BOTÕES DISPONÍVEIS\n');
  
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
    
    // Encontrar TODOS os botões
    console.log('🔘 TODOS OS BOTÕES ENCONTRADOS:');
    const allButtons = await page.locator('button').all();
    
    for (let i = 0; i < allButtons.length; i++) {
      try {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        const isEnabled = await allButtons[i].isEnabled();
        
        if (isVisible && isEnabled && text && text.trim()) {
          console.log(`   ${i+1}. "${text.trim()}" (visível: ${isVisible}, habilitado: ${isEnabled})`);
        }
      } catch (e) {
        // Ignorar botões que não conseguimos ler
      }
    }
    
    console.log('\n🔗 TODOS OS LINKS ENCONTRADOS:');
    const allLinks = await page.locator('a').all();
    
    for (let i = 0; i < allLinks.length; i++) {
      try {
        const text = await allLinks[i].textContent();
        const href = await allLinks[i].getAttribute('href');
        const isVisible = await allLinks[i].isVisible();
        
        if (isVisible && text && text.trim() && href) {
          console.log(`   ${i+1}. "${text.trim()}" -> ${href}`);
        }
      } catch (e) {
        // Ignorar links que não conseguimos ler
      }
    }
    
    // Testar alguns botões que vimos na screenshot
    console.log('\n🎯 TESTANDO BOTÕES DA SCREENSHOT...');
    
    const buttonTexts = [
      'Novo Paciente',
      'Agendar Consulta', 
      'Iniciar Terapia',
      'Nova Anamnese'
    ];
    
    for (const btnText of buttonTexts) {
      const found = await page.locator(`button:has-text("${btnText}"), button:text-is("${btnText}")`).count();
      console.log(`   "${btnText}": ${found > 0 ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
      
      if (found > 0) {
        try {
          await page.locator(`button:has-text("${btnText}"), button:text-is("${btnText}")`).click();
          await page.waitForTimeout(1000);
          
          const modal = await page.locator('.modal:visible, [role="dialog"]:visible').count();
          const url = page.url();
          
          console.log(`     → Modal: ${modal > 0 ? 'ABERTO' : 'FECHADO'}, URL: ${url.includes('/') ? 'MUDOU' : 'MESMA'}`);
          
          if (modal > 0) {
            await page.screenshot({ path: `final-test-${btnText.toLowerCase().replace(/\s+/g, '-')}.png` });
            // Fechar modal
            await page.locator('button:has-text("Cancelar"), button:has-text("Fechar")').first().click();
          }
        } catch (e) {
          console.log(`     → Erro ao clicar: ${e.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`💥 Erro: ${error.message}`);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('\n✅ DESCOBERTA CONCLUÍDA!');
})();