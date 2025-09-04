const { chromium } = require('playwright');

(async () => {
  console.log('🎯 TESTE DIRETO - BOTÕES DAS AÇÕES RÁPIDAS\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    console.log('✅ Login OK - Estamos no Dashboard\n');
    
    // TESTAR BOTÕES DIRETAMENTE NA SCREENSHOT
    const buttonsToTest = [
      'Novo Paciente',
      'Agendar Consulta', 
      'Iniciar Terapia',
      'Nova Anamnese'
    ];
    
    for (const btnText of buttonsToTest) {
      console.log(`🔘 TESTANDO BOTÃO: "${btnText}"`);
      
      try {
        // Tentar diferentes seletores para encontrar o botão
        const selectors = [
          `button:has-text("${btnText}")`,
          `a:has-text("${btnText}")`,
          `[role="button"]:has-text("${btnText}")`,
          `div:has-text("${btnText}")`,
          `.btn-primary:has-text("${btnText.split(' ')[0]}")` // Primeira palavra
        ];
        
        let found = false;
        
        for (const selector of selectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`   ✅ Encontrado com: ${selector}`);
            found = true;
            
            // Screenshot antes
            await page.screenshot({ path: `before-${btnText.replace(/\s+/g, '-').toLowerCase()}.png` });
            
            // Clicar
            console.log(`   🖱️  Clicando...`);
            await page.locator(selector).first().click();
            await page.waitForTimeout(3000);
            
            // Screenshot depois  
            await page.screenshot({ path: `after-${btnText.replace(/\s+/g, '-').toLowerCase()}.png` });
            
            // Verificar resultado
            const currentUrl = page.url();
            const modalCount = await page.locator('.modal:visible, [role="dialog"]:visible, .fixed.inset-0').count();
            
            console.log(`   📍 URL: ${currentUrl}`);
            console.log(`   📝 Modais: ${modalCount}`);
            
            if (modalCount > 0) {
              console.log(`   🎉 MODAL ABERTO! BOTÃO FUNCIONA!`);
              
              // Preencher campo de teste se houver
              const nameInput = await page.locator('input[placeholder*="nome"], input:near(:text("Nome"))').count();
              if (nameInput > 0) {
                console.log(`   ✍️  Testando preenchimento...`);
                await page.locator('input[placeholder*="nome"], input:near(:text("Nome"))').first().fill('Teste Paciente');
                await page.screenshot({ path: `form-${btnText.replace(/\s+/g, '-').toLowerCase()}.png` });
              }
              
              // Fechar modal
              const closeBtn = await page.locator('button:has-text("Cancelar"), button:has-text("Fechar"), button:has-text("×")').count();
              if (closeBtn > 0) {
                await page.locator('button:has-text("Cancelar"), button:has-text("Fechar"), button:has-text("×")').first().click();
                await page.waitForTimeout(1000);
              }
              
            } else if (currentUrl !== 'https://sapere-system.vercel.app/') {
              console.log(`   🔗 NAVEGAÇÃO FUNCIONOU!`);
              
              // Voltar para dashboard
              await page.goto('https://sapere-system.vercel.app/', { waitUntil: 'domcontentloaded' });
              await page.waitForTimeout(2000);
              
            } else {
              console.log(`   ❌ Botão não funcionou`);
              
              // Debug: verificar atributos do elemento
              const element = page.locator(selector).first();
              const href = await element.getAttribute('href').catch(() => null);
              const onclick = await element.getAttribute('onclick').catch(() => null);
              const type = await element.getAttribute('type').catch(() => null);
              
              console.log(`   🔍 href: ${href}, onclick: ${onclick}, type: ${type}`);
            }
            
            break;
          }
        }
        
        if (!found) {
          console.log(`   ❌ Botão "${btnText}" não encontrado com nenhum seletor`);
        }
        
      } catch (error) {
        console.log(`   💥 Erro: ${error.message}`);
      }
      
      console.log('');
    }
    
    // Verificar se há JavaScript errors
    console.log('🔍 Verificando erros JavaScript...');
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (logs.length > 0) {
      console.log('🚨 Erros JavaScript encontrados:');
      logs.forEach((log, i) => console.log(`   ${i+1}. ${log}`));
    } else {
      console.log('✅ Nenhum erro JavaScript detectado');
    }
    
  } catch (error) {
    console.log(`💥 Erro crítico: ${error.message}`);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('\n✅ TESTE DIRETO CONCLUÍDO!');
})();