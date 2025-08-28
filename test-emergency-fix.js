const { chromium } = require('playwright');

async function testEmergencyFix() {
  console.log('🚨 TESTANDO CORREÇÃO EMERGENCIAL\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://sapere-system.vercel.app?emergency=' + Date.now(), { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('📱 Carregando com correção emergencial...');
    await page.waitForTimeout(5000);
    
    // Verificar se ainda tem erro
    const pageStatus = await page.evaluate(() => {
      return {
        title: document.title,
        hasRoot: !!document.getElementById('root'),
        rootContent: document.getElementById('root')?.innerHTML?.length || 0,
        hasInputs: document.querySelectorAll('input').length > 0,
        hasButtons: document.querySelectorAll('button').length > 0,
        bodyText: document.body.textContent?.substring(0, 200) || 'NO TEXT'
      };
    });
    
    console.log('🎯 Status da Página:');
    console.log('  Title:', pageStatus.title);
    console.log('  Tem emoji estrela:', pageStatus.title.includes('⭐') ? '✅' : '❌');
    console.log('  Root existe:', pageStatus.hasRoot ? '✅' : '❌');
    console.log('  Root tem conteúdo:', pageStatus.rootContent > 0 ? '✅' : '❌');
    console.log('  Tem inputs:', pageStatus.hasInputs ? '✅' : '❌');
    console.log('  Tem botões:', pageStatus.hasButtons ? '✅' : '❌');
    console.log('  Body text:', pageStatus.bodyText);
    
    if (pageStatus.hasInputs && pageStatus.hasButtons) {
      console.log('\n🎉 LOGIN FUNCIONANDO! Testando...');
      await page.fill('input[type="email"]', 'admin@sapere.com.br');
      await page.fill('input[type="password"]', 'Sapere@2025');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const dashboardTitle = await page.textContent('h1').catch(() => 'Not found');
      console.log('📋 Dashboard title:', dashboardTitle);
      
      const hasEmoji = dashboardTitle.includes('🌟');
      console.log('🌟 Tem emoji:', hasEmoji ? '✅ SUCESSO!' : '❌');
      
    } else {
      console.log('❌ AINDA COM PROBLEMA - Login não carregou');
    }
    
    await page.screenshot({ path: 'emergency-fix-test.png', fullPage: true });
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✅ TESTE EMERGENCIAL CONCLUÍDO');
  }
}

testEmergencyFix();