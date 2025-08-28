const { chromium } = require('playwright');

async function debugWhiteScreen() {
  console.log('🚨 DEBUGANDO TELA BRANCA - ERRO CRÍTICO\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capturar erros do console
  page.on('console', msg => {
    console.log(`CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ ERRO JAVASCRIPT: ${error.message}`);
  });
  
  try {
    await page.goto('https://sapere-system.vercel.app?debug=' + Date.now(), { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('📱 Página carregada, verificando erros...');
    await page.waitForTimeout(5000);
    
    // Verificar se React carregou
    const reactStatus = await page.evaluate(() => {
      return {
        hasRoot: !!document.getElementById('root'),
        rootContent: document.getElementById('root')?.innerHTML?.length || 0,
        bodyContent: document.body.innerHTML.length,
        hasReact: typeof window.React !== 'undefined',
        hasReactDOM: typeof window.ReactDOM !== 'undefined',
        consoleErrors: window.console?.errors || [],
        windowErrors: window.errors || []
      };
    });
    
    console.log('🔍 Status do React:');
    console.log('  Root existe:', reactStatus.hasRoot ? '✅' : '❌');
    console.log('  Root tem conteúdo:', reactStatus.rootContent > 0 ? '✅' : '❌');
    console.log('  Root content length:', reactStatus.rootContent);
    console.log('  Body content length:', reactStatus.bodyContent);
    console.log('  React carregado:', reactStatus.hasReact ? '✅' : '❌');
    
    // Verificar se scripts carregaram
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(script => ({
        src: script.src,
        loaded: script.readyState || 'unknown'
      }));
    });
    
    console.log('\n📜 Scripts:');
    scripts.forEach(script => {
      console.log(`  ${script.loaded === 'complete' ? '✅' : '❌'} ${script.src}`);
    });
    
    // Tentar encontrar qualquer elemento
    const elements = await page.evaluate(() => {
      return {
        divs: document.querySelectorAll('div').length,
        inputs: document.querySelectorAll('input').length,
        buttons: document.querySelectorAll('button').length,
        forms: document.querySelectorAll('form').length,
        anyText: document.body.textContent?.trim() || 'NO TEXT'
      };
    });
    
    console.log('\n🔍 Elementos na página:');
    console.log('  Divs:', elements.divs);
    console.log('  Inputs:', elements.inputs);
    console.log('  Buttons:', elements.buttons);
    console.log('  Forms:', elements.forms);
    console.log('  Texto:', elements.anyText.substring(0, 100));
    
    await page.screenshot({ path: 'debug-white-screen.png', fullPage: true });
    console.log('\n📸 Screenshot da tela branca capturado');
    
  } catch (error) {
    console.log(`❌ Erro durante debug: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✅ DEBUG TELA BRANCA CONCLUÍDO');
  }
}

debugWhiteScreen();