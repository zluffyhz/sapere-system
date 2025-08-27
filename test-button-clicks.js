const { chromium } = require('playwright');

(async () => {
  console.log('🔘 TESTE ESPECÍFICO - FUNCIONAMENTO DOS BOTÕES\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const buttonIssues = [];
  const workingButtons = [];
  const jsErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      jsErrors.push(msg.text());
      console.log(`❌ JS Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    jsErrors.push(`Page Error: ${error.message}`);
    console.log(`💥 Page Error: ${error.message}`);
  });
  
  try {
    // Login
    console.log('🔐 Fazendo login...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    if (page.url().includes('/login')) {
      console.log('❌ Login falhou');
      await browser.close();
      return;
    }
    
    console.log('✅ Login OK\n');
    
    // Testar botões em cada página
    const pagesToTest = [
      { name: 'Dashboard', url: '/' },
      { name: 'Pacientes', url: '/patients' },
      { name: 'Agendamentos', url: '/appointments' },
      { name: 'Anamnese', url: '/anamnese' },
      { name: 'Comunicação', url: '/communication' },
      { name: 'Terapeutas', url: '/therapists' },
      { name: 'Administração', url: '/administration' }
    ];
    
    for (const pageTest of pagesToTest) {
      console.log(`📋 TESTANDO BOTÕES EM: ${pageTest.name}`);
      
      await page.goto(`https://sapere-system.vercel.app${pageTest.url}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      await page.waitForTimeout(2000);
      
      // Screenshot antes
      await page.screenshot({ 
        path: `screenshots/buttons-${pageTest.name.toLowerCase()}-before.png`, 
        fullPage: true 
      });
      
      // Procurar botões específicos para testar
      const buttonSelectors = [
        'button:has-text("Adicionar")',
        'button:has-text("Novo")', 
        'button:has-text("Criar")',
        'button:has-text("+")',
        'button[title*="Adicionar"]',
        'button[aria-label*="Adicionar"]'
      ];
      
      let buttonsFound = 0;
      let buttonsWorking = 0;
      
      for (const selector of buttonSelectors) {
        try {
          const buttons = await page.locator(selector);
          const count = await buttons.count();
          
          if (count > 0) {
            console.log(`   🔘 Encontrado: ${count} botão(ões) "${selector}"`);
            buttonsFound += count;
            
            // Testar o primeiro botão encontrado
            const button = buttons.first();
            
            // Verificar se está visível e habilitado
            const isVisible = await button.isVisible();
            const isEnabled = await button.isEnabled();
            
            console.log(`   👁️  Visível: ${isVisible}, Habilitado: ${isEnabled}`);
            
            if (isVisible && isEnabled) {
              console.log(`   🎯 Clicando no botão...`);
              
              // Capturar estado antes do clique
              const modalsBefore = await page.locator('.modal:visible, [role="dialog"]:visible').count();
              const urlBefore = page.url();
              
              await button.click();
              await page.waitForTimeout(2000); // Aguardar possível animação
              
              // Verificar o que aconteceu
              const modalsAfter = await page.locator('.modal:visible, [role="dialog"]:visible').count();
              const urlAfter = page.url();
              const newContent = await page.locator('.modal, [role="dialog"], .form, .popup').count();
              
              console.log(`   📊 Modais antes: ${modalsBefore}, depois: ${modalsAfter}`);
              console.log(`   🔗 URL mudou: ${urlBefore !== urlAfter ? 'Sim' : 'Não'}`);
              console.log(`   📄 Novo conteúdo: ${newContent > 0 ? 'Sim' : 'Não'}`);
              
              if (modalsAfter > modalsBefore) {
                workingButtons.push(`${pageTest.name} - Botão abre modal`);
                buttonsWorking++;
                console.log(`   ✅ Botão funcionando - Modal aberto!`);
                
                // Screenshot com modal aberto
                await page.screenshot({ 
                  path: `screenshots/buttons-${pageTest.name.toLowerCase()}-modal.png`, 
                  fullPage: true 
                });
                
                // Fechar modal para próximo teste
                const closeBtn = await page.locator('button:has-text("Cancelar"), button:has-text("Fechar"), .modal .close, [aria-label="Close"]');
                if (await closeBtn.count() > 0) {
                  await closeBtn.first().click();
                  await page.waitForTimeout(1000);
                }
                
              } else if (urlBefore !== urlAfter) {
                workingButtons.push(`${pageTest.name} - Botão navega`);
                buttonsWorking++;
                console.log(`   ✅ Botão funcionando - Navegação!`);
                
              } else {
                buttonIssues.push(`${pageTest.name} - Botão "${selector}" não responde`);
                console.log(`   ❌ Botão não responde`);
                
                // Verificar se há erros específicos
                const buttonElement = await button.elementHandle();
                if (buttonElement) {
                  const onclick = await buttonElement.evaluate(el => el.onclick?.toString() || 'sem onclick');
                  const listeners = await buttonElement.evaluate(el => {
                    const events = [];
                    for (let event of ['click', 'mousedown', 'mouseup']) {
                      if (el[`on${event}`] || el.getAttribute(`on${event}`)) {
                        events.push(event);
                      }
                    }
                    return events;
                  });
                  
                  console.log(`   🔍 onClick: ${onclick}`);
                  console.log(`   🎧 Event listeners: ${listeners.join(', ') || 'nenhum'}`);
                }
              }
            } else {
              buttonIssues.push(`${pageTest.name} - Botão "${selector}" não visível/habilitado`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Erro ao testar "${selector}": ${error.message}`);
          buttonIssues.push(`${pageTest.name} - Erro ao testar botão: ${error.message}`);
        }
      }
      
      console.log(`   📈 Resultado: ${buttonsWorking}/${buttonsFound} botões funcionando\n`);
    }
    
  } catch (error) {
    console.log(`💥 Erro crítico: ${error.message}`);
    buttonIssues.push(`Erro crítico: ${error.message}`);
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO - TESTE DE BOTÕES');
  console.log('='.repeat(60));
  
  console.log(`✅ Botões funcionando: ${workingButtons.length}`);
  console.log(`❌ Problemas encontrados: ${buttonIssues.length}`);
  console.log(`🚨 Erros JavaScript: ${jsErrors.length}`);
  
  if (workingButtons.length > 0) {
    console.log('\n✅ BOTÕES FUNCIONANDO:');
    workingButtons.forEach((btn, i) => console.log(`   ${i+1}. ${btn}`));
  }
  
  if (buttonIssues.length > 0) {
    console.log('\n❌ PROBLEMAS COM BOTÕES:');
    buttonIssues.forEach((issue, i) => console.log(`   ${i+1}. ${issue}`));
  }
  
  if (jsErrors.length > 0) {
    console.log('\n🚨 ERROS JAVASCRIPT:');
    jsErrors.slice(0, 5).forEach((error, i) => {
      console.log(`   ${i+1}. ${error.substring(0, 120)}${error.length > 120 ? '...' : ''}`);
    });
  }
  
  const successRate = (workingButtons.length + buttonIssues.length) > 0 
    ? ((workingButtons.length / (workingButtons.length + buttonIssues.length)) * 100).toFixed(1)
    : 0;
    
  console.log(`\n📈 Taxa de sucesso dos botões: ${successRate}%`);
  
  if (successRate < 50) {
    console.log('🔴 STATUS: BOTÕES COM PROBLEMAS CRÍTICOS');
  } else if (successRate < 80) {
    console.log('🟡 STATUS: BOTÕES PARCIALMENTE FUNCIONAIS');  
  } else {
    console.log('🟢 STATUS: BOTÕES MAJORITARIAMENTE FUNCIONAIS');
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
  
  console.log('\n✅ TESTE DE BOTÕES CONCLUÍDO!\n');
})();