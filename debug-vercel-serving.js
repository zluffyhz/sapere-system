const { chromium } = require('playwright');

async function debugVercelServing() {
  console.log('🔍 DEBUGANDO O QUE O VERCEL ESTÁ SERVINDO\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Verificar o que está sendo carregado
    await page.goto('https://sapere-system.vercel.app?v=' + Date.now(), { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('📱 Página carregada, verificando estrutura...');
    
    // Verificar se está carregando o React app correto
    const pageStructure = await page.evaluate(() => {
      return {
        title: document.title,
        headContent: document.head.innerHTML,
        bodyContent: document.body.innerHTML.substring(0, 500),
        scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
        stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
        reactRoot: !!document.getElementById('root'),
        reactAppLoaded: !!document.querySelector('[data-reactroot]') || !!window.React,
        currentURL: window.location.href,
        userAgent: navigator.userAgent
      };
    });
    
    console.log('📋 Estrutura da página:');
    console.log('  Title:', pageStructure.title);
    console.log('  React Root:', pageStructure.reactRoot ? '✅' : '❌');
    console.log('  React App Loaded:', pageStructure.reactAppLoaded ? '✅' : '❌');
    console.log('  Current URL:', pageStructure.currentURL);
    console.log('  Scripts:', pageStructure.scripts);
    console.log('  Stylesheets:', pageStructure.stylesheets);
    
    // Tentar fazer login e ver o que acontece
    await page.waitForTimeout(3000);
    
    const loginElements = await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = document.querySelector('button[type="submit"]');
      
      return {
        hasEmailInput: !!emailInput,
        hasPasswordInput: !!passwordInput,
        hasSubmitButton: !!submitButton,
        allInputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          name: i.name
        })),
        allButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent)
      };
    });
    
    console.log('\n🔐 Elementos de login:');
    console.log('  Email Input:', loginElements.hasEmailInput ? '✅' : '❌');
    console.log('  Password Input:', loginElements.hasPasswordInput ? '✅' : '❌');
    console.log('  Submit Button:', loginElements.hasSubmitButton ? '✅' : '❌');
    console.log('  All Inputs:', loginElements.allInputs);
    console.log('  All Buttons:', loginElements.allButtons);
    
    // Se os elementos existem, tentar fazer login
    if (loginElements.hasEmailInput && loginElements.hasPasswordInput) {
      await page.fill('input[type="email"]', 'admin@sapere.com.br');
      await page.fill('input[type="password"]', 'Sapere@2025');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      // Verificar para onde foi redirecionado
      const afterLogin = await page.evaluate(() => {
        return {
          currentURL: window.location.href,
          hash: window.location.hash,
          pathname: window.location.pathname,
          mainContent: document.body.innerHTML.substring(0, 1000)
        };
      });
      
      console.log('\n🔄 Após login:');
      console.log('  Current URL:', afterLogin.currentURL);
      console.log('  Hash:', afterLogin.hash);
      console.log('  Pathname:', afterLogin.pathname);
    }
    
    // Capturar screenshot para análise
    await page.screenshot({ path: 'debug-vercel-serving.png', fullPage: true });
    console.log('\n📸 Screenshot capturado para análise');
    
  } catch (error) {
    console.log(`❌ Erro durante debug: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✅ DEBUG VERCEL CONCLUÍDO');
  }
}

debugVercelServing();