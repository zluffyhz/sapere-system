const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTE CRÍTICO - MODAL DE PACIENTES\n');
  
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
    
    // Navegar para pacientes usando o link do dashboard
    console.log('🔗 Navegando para pacientes via link...');
    await page.locator('a[href="/patients"]').first().click();
    await page.waitForTimeout(3000);
    
    console.log(`📍 URL atual: ${page.url()}`);
    
    // Screenshot da página de pacientes
    await page.screenshot({ path: 'debug-patients-page-full.png', fullPage: true });
    
    // Procurar por QUALQUER botão que possa ser "Novo Paciente"
    console.log('🔍 Procurando botões de "Adicionar/Novo"...\n');
    
    const buttonSelectors = [
      'button:has-text("Novo Paciente")',
      'button:has-text("Adicionar")',
      'button:has-text("Criar")',
      'button:has-text("+")',
      'button[title*="Adicionar"]',
      'button[aria-label*="Adicionar"]',
      'button[class*="btn-primary"]',
      '.btn-primary'
    ];
    
    let buttonFound = false;
    
    for (const selector of buttonSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ Encontrado: ${count} elemento(s) com seletor "${selector}"`);
        
        // Pegar todos os elementos
        const elements = await page.locator(selector).all();
        
        for (let i = 0; i < elements.length; i++) {
          try {
            const text = await elements[i].textContent();
            const isVisible = await elements[i].isVisible();
            const isEnabled = await elements[i].isEnabled();
            
            console.log(`   ${i+1}. Text: "${text?.trim()}", Visível: ${isVisible}, Habilitado: ${isEnabled}`);
            
            if (isVisible && isEnabled && text?.includes('Novo')) {
              console.log(`   🎯 TESTANDO ESTE BOTÃO...`);
              buttonFound = true;
              
              // Aguardar e clicar
              await elements[i].scrollIntoViewIfNeeded();
              await page.waitForTimeout(1000);
              
              console.log('   📸 Screenshot antes do clique...');
              await page.screenshot({ path: 'debug-before-click.png' });
              
              console.log('   🖱️  Clicando...');
              await elements[i].click();
              await page.waitForTimeout(3000);
              
              console.log('   📸 Screenshot depois do clique...');
              await page.screenshot({ path: 'debug-after-click.png' });
              
              // Verificar se modal abriu
              const modalCount = await page.locator('.modal:visible, [role="dialog"]:visible, .fixed.inset-0, .absolute.inset-0').count();
              console.log(`   📝 Modais encontrados: ${modalCount}`);
              
              if (modalCount > 0) {
                console.log('   🎉 MODAL ABRIU!');
                
                // Listar campos do modal
                const inputs = await page.locator('.modal input, [role="dialog"] input, .fixed input').count();
                const textareas = await page.locator('.modal textarea, [role="dialog"] textarea, .fixed textarea').count();
                const selects = await page.locator('.modal select, [role="dialog"] select, .fixed select').count();
                
                console.log(`   📝 Campos: ${inputs} inputs, ${textareas} textareas, ${selects} selects`);
                
                // Screenshot do modal
                await page.screenshot({ path: 'debug-modal-success.png' });
                
                return; // Sucesso!
              } else {
                console.log('   ❌ Modal não abriu');
                
                // Verificar se há erros no console
                await page.evaluate(() => {
                  console.log('Estado após clique:', {
                    url: window.location.href,
                    pathname: window.location.pathname,
                    hash: window.location.hash
                  });
                });
              }
              
              break;
            }
          } catch (e) {
            console.log(`   ❌ Erro ao testar elemento ${i+1}: ${e.message}`);
          }
        }
      } else {
        console.log(`❌ Não encontrado: "${selector}"`);
      }
    }
    
    if (!buttonFound) {
      console.log('\n🔍 INVESTIGANDO ESTRUTURA DA PÁGINA...');
      
      // Listar TODOS os botões visíveis
      const allButtons = await page.locator('button').all();
      console.log(`\n📋 TODOS OS ${allButtons.length} BOTÕES ENCONTRADOS:`);
      
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        try {
          const text = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          const classes = await allButtons[i].getAttribute('class');
          
          if (isVisible) {
            console.log(`   ${i+1}. "${text?.trim()}" (classes: ${classes})`);
          }
        } catch (e) {
          // Ignorar
        }
      }
      
      // Verificar se há elementos com texto "Paciente"
      const patientElements = await page.locator(':has-text("Paciente")').count();
      console.log(`\n🔍 Elementos com "Paciente": ${patientElements}`);
      
      if (patientElements === 0) {
        console.log('❌ PÁGINA PARECE VAZIA - PROBLEMA COM DADOS MOCK?');
      }
    }
    
  } catch (error) {
    console.log(`💥 Erro crítico: ${error.message}`);
    await page.screenshot({ path: 'debug-critical-error.png' });
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\n✅ INVESTIGAÇÃO CONCLUÍDA!');
})();