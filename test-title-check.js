const { chromium } = require('playwright');

async function checkTitle() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://sapere-system.vercel.app?cache=' + Date.now());
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    const hasStarEmoji = title.includes('⭐');
    
    console.log('🔍 VERIFICANDO TÍTULO DA PÁGINA');
    console.log('Title encontrado:', title);
    console.log('Tem emoji estrela:', hasStarEmoji ? '✅' : '❌');
    
    if (hasStarEmoji) {
      console.log('🎉 NOVA VERSÃO CARREGOU! Testando interface...');
      
      // Se a nova versão carregou, testar login
      await page.fill('input[type="email"]', 'admin@sapere.com.br');
      await page.fill('input[type="password"]', 'Sapere@2025');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const dashboardTitle = await page.textContent('h1');
      console.log('Dashboard title:', dashboardTitle);
      
    } else {
      console.log('❌ AINDA CARREGANDO VERSÃO ANTIGA');
    }
    
  } catch (error) {
    console.log('Erro:', error.message);
  } finally {
    await browser.close();
  }
}

checkTitle();