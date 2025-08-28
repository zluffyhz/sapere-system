const { chromium } = require('playwright');

async function testAssetsLoading() {
  console.log('🔍 TESTANDO CARREGAMENTO DOS ASSETS\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capturar todas as requisições
  page.on('response', response => {
    console.log(`${response.status()} ${response.url()}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`❌ FALHOU: ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    await page.goto('https://sapere-system.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    
    // Verificar quais scripts estão sendo carregados
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(script => ({
        src: script.src,
        crossorigin: script.crossOrigin,
        type: script.type
      }));
    });
    
    console.log('\n📜 Scripts na página:');
    scripts.forEach(script => {
      console.log(`  ${script.src}`);
      console.log(`    Type: ${script.type}`);
      console.log(`    Crossorigin: ${script.crossorigin}`);
    });
    
    // Tentar carregar manualmente o script principal
    const scriptResult = await page.evaluate(() => {
      const script = document.querySelector('script[src*="index"]');
      if (script) {
        return fetch(script.src).then(r => ({
          status: r.status,
          contentType: r.headers.get('content-type'),
          url: r.url
        })).catch(e => ({ error: e.message }));
      }
      return { error: 'No script found' };
    });
    
    console.log('\n🔧 Script principal:');
    console.log(JSON.stringify(await scriptResult, null, 2));
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✅ TESTE ASSETS CONCLUÍDO');
  }
}

testAssetsLoading();