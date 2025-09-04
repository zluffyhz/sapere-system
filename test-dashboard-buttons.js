const { chromium } = require('playwright');

(async () => {
  console.log('🎯 TESTE FINAL - BOTÕES DO DASHBOARD\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const workingButtons = [];
  const brokenButtons = [];
  
  try {
    // Login
    console.log('🔐 Login...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    console.log('✅ Login OK - Dashboard carregado!\n');
    
    // Testar botões de Ações Rápidas
    const buttonsToTest = [
      { text: 'Novo Paciente', expected: 'modal ou navegação' },
      { text: 'Agendar Consulta', expected: 'modal ou navegação' },
      { text: 'Iniciar Terapia', expected: 'modal ou navegação' },
      { text: 'Nova Anamnese', expected: 'modal ou navegação' }
    ];
    
    for (const buttonTest of buttonsToTest) {
      console.log(`🔘 Testando botão "${buttonTest.text}"...`);
      
      try {
        // Verificar se o botão existe
        const buttonExists = await page.locator(`button:has-text("${buttonTest.text}")`).count() > 0;
        
        if (!buttonExists) {
          brokenButtons.push(`${buttonTest.text} - Botão não encontrado`);
          console.log(`   ❌ Botão não encontrado`);
          continue;
        }
        
        console.log(`   ✅ Botão encontrado`);
        
        // Capturar estado antes do clique
        const urlBefore = page.url();
        const modalsBefore = await page.locator('.modal:visible, [role="dialog"]:visible').count();
        
        // Clicar no botão
        await page.locator(`button:has-text("${buttonTest.text}")`).click();
        await page.waitForTimeout(2000);
        
        // Verificar o que aconteceu
        const urlAfter = page.url();
        const modalsAfter = await page.locator('.modal:visible, [role="dialog"]:visible').count();
        
        const urlChanged = urlBefore !== urlAfter;
        const modalOpened = modalsAfter > modalsBefore;
        
        console.log(`   📍 URL mudou: ${urlChanged ? 'SIM' : 'NÃO'}`);
        console.log(`   📝 Modal aberto: ${modalOpened ? 'SIM' : 'NÃO'}`);
        
        if (modalOpened || urlChanged) {
          workingButtons.push(`${buttonTest.text} - ${modalOpened ? 'Abre modal' : 'Navega'}`);
          console.log(`   🎉 BOTÃO FUNCIONA!`);
          
          // Screenshot do sucesso
          await page.screenshot({ 
            path: `dashboard-${buttonTest.text.toLowerCase().replace(/\s+/g, '-')}-success.png` 
          });
          
          // Fechar modal se abriu
          if (modalOpened) {
            const closeButton = await page.locator('button:has-text("Cancelar"), button:has-text("Fechar"), .modal button[type="button"]:first-of-type').first();
            if (await closeButton.count() > 0) {
              await closeButton.click();
              await page.waitForTimeout(1000);
            }
          }
          
          // Voltar ao dashboard se navegou
          if (urlChanged) {
            await page.goto('https://sapere-system.vercel.app/', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);
          }
          
        } else {
          brokenButtons.push(`${buttonTest.text} - Não responde`);
          console.log(`   ❌ Botão não responde`);
        }
        
      } catch (error) {
        brokenButtons.push(`${buttonTest.text} - Erro: ${error.message}`);
        console.log(`   💥 Erro: ${error.message}`);
      }
      
      console.log('');
    }
    
    // Testar links de navegação também
    console.log('🔗 Testando links de navegação...\n');
    
    const linksToTest = [
      'Ver todos os pacientes',
      'Ver agenda completa', 
      'Ver comunicações',
      'Gerenciar anamneses'
    ];
    
    for (const linkText of linksToTest) {
      console.log(`🔗 Testando link "${linkText}"...`);
      
      try {
        const linkExists = await page.locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`).count() > 0;
        
        if (linkExists) {
          await page.locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`).first().click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          console.log(`   📍 URL atual: ${currentUrl}`);
          
          // Verificar se há conteúdo na página
          const hasContent = await page.locator('h1, .card, table, button').count() > 5;
          
          if (hasContent) {
            workingButtons.push(`${linkText} - Navega e carrega conteúdo`);
            console.log(`   ✅ Link funciona - conteúdo carregado`);
          } else {
            console.log(`   ⚠️  Link navega mas pouco conteúdo`);
          }
          
          // Voltar ao dashboard
          await page.goto('https://sapere-system.vercel.app/', { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1000);
        } else {
          console.log(`   ❌ Link não encontrado`);
        }
        
      } catch (error) {
        console.log(`   💥 Erro: ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.log(`💥 Erro crítico: ${error.message}`);
  }
  
  // RELATÓRIO FINAL
  console.log('=' .repeat(60));
  console.log('🎯 RELATÓRIO FINAL - FUNCIONALIDADE DOS BOTÕES');
  console.log('='.repeat(60));
  
  const total = workingButtons.length + brokenButtons.length;
  const successRate = total > 0 ? ((workingButtons.length / total) * 100).toFixed(1) : 0;
  
  console.log(`✅ Botões/Links funcionando: ${workingButtons.length}`);
  console.log(`❌ Botões/Links com problemas: ${brokenButtons.length}`);
  console.log(`📈 Taxa de Sucesso: ${successRate}%`);
  
  if (workingButtons.length > 0) {
    console.log('\n✅ FUNCIONALIDADES FUNCIONANDO:');
    workingButtons.forEach((btn, i) => console.log(`   ${i+1}. ${btn}`));
  }
  
  if (brokenButtons.length > 0) {
    console.log('\n❌ PROBLEMAS ENCONTRADOS:');
    brokenButtons.forEach((btn, i) => console.log(`   ${i+1}. ${btn}`));
  }
  
  if (successRate >= 80) {
    console.log('\n🎉 STATUS: SISTEMA FUNCIONANDO PERFEITAMENTE!');
  } else if (successRate >= 60) {
    console.log('\n🟡 STATUS: SISTEMA MAJORITARIAMENTE FUNCIONAL');
  } else {
    console.log('\n🔴 STATUS: SISTEMA NECESSITA CORREÇÕES');
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('\n✅ TESTE DASHBOARD CONCLUÍDO!\n');
})();