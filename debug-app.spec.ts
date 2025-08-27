import { test, expect } from '@playwright/test';

test('Debug application loading', async ({ page }) => {
  console.log('🔍 DEBUGGING APPLICATION LOADING...');
  
  // Capturar todos os logs do console
  const consoleMessages: string[] = [];
  const networkRequests: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    const message = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(message);
    console.log(`Console: ${message}`);
  });
  
  page.on('pageerror', error => {
    const errorMessage = `Page Error: ${error.message}`;
    errors.push(errorMessage);
    console.log(`❌ ${errorMessage}`);
  });
  
  page.on('request', request => {
    networkRequests.push(`${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`❌ HTTP Error: ${response.status()} ${response.url()}`);
    }
  });
  
  // Ir para a aplicação
  console.log('🌐 Navegando para http://localhost:5173...');
  await page.goto('http://localhost:5173', { 
    waitUntil: 'networkidle',
    timeout: 15000 
  });
  
  // Aguardar mais tempo para a aplicação carregar
  console.log('⏳ Aguardando aplicação carregar...');
  await page.waitForTimeout(5000);
  
  // Capturar screenshot
  await page.screenshot({ path: 'screenshots/debug-loading.png', fullPage: true });
  
  // Verificar se existe o elemento root
  const rootElement = await page.locator('#root');
  const rootExists = await rootElement.count() > 0;
  console.log(`📍 Elemento #root existe: ${rootExists}`);
  
  if (rootExists) {
    const rootContent = await rootElement.textContent();
    console.log(`📝 Conteúdo do #root: "${rootContent || 'VAZIO'}"`);
    
    const rootHTML = await rootElement.innerHTML();
    console.log(`🏷️ HTML do #root: ${rootHTML.substring(0, 200)}`);
  }
  
  // Verificar se React carregou
  const reactLoaded = await page.evaluate(() => {
    return typeof window.React !== 'undefined' || 
           typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' ||
           document.querySelector('[data-reactroot]') !== null ||
           document.querySelector('[data-reactroot]') !== null;
  });
  console.log(`⚛️ React carregado: ${reactLoaded}`);
  
  // Verificar erros específicos
  const hasJSErrors = await page.evaluate(() => {
    return window.performance.getEntriesByType('navigation')[0];
  });
  
  console.log('📊 RESUMO DO DEBUG:');
  console.log(`   • Console messages: ${consoleMessages.length}`);
  console.log(`   • Network requests: ${networkRequests.length}`);
  console.log(`   • Errors: ${errors.length}`);
  console.log(`   • Root exists: ${rootExists}`);
  console.log(`   • React loaded: ${reactLoaded}`);
  
  if (errors.length > 0) {
    console.log('🚨 ERROS ENCONTRADOS:');
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  // Tentar interagir com elementos específicos
  console.log('🔍 Procurando por elementos de login...');
  const loginElements = await page.locator('input[type="email"], input[type="password"], button').all();
  console.log(`🔐 Elementos de login encontrados: ${loginElements.length}`);
  
  // Verificar se há loading spinner
  const loadingSpinner = await page.locator('.animate-spin, [data-loading], .loading').count();
  console.log(`🌀 Loading spinners: ${loadingSpinner}`);
  
  // Verificar title da página
  const title = await page.title();
  console.log(`📰 Título da página: "${title}"`);
  
  console.log('✅ Debug concluído!');
});