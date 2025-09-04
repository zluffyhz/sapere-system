const { chromium } = require('playwright');

(async () => {
  console.log('🔍 ANÁLISE PROFUNDA DAS FUNCIONALIDADES INTERNAS\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const brokenFeatures = [];
  const workingFeatures = [];
  const consoleErrors = [];
  const networkErrors = [];
  
  // Capturar todos os erros
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
    console.log(`💥 Page Error: ${error.message}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
      console.log(`🌐 Network Error: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // 1. Login
    console.log('🔐 Fazendo login...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    if (page.url().includes('/login')) {
      console.log('❌ Login falhou, parando análise');
      return;
    }
    
    console.log('✅ Login bem-sucedido, iniciando análise das funcionalidades...\n');
    
    // 2. ANÁLISE DETALHADA DE CADA SEÇÃO
    await analyzeSection(page, 'Dashboard', '/', brokenFeatures, workingFeatures);
    await analyzeSection(page, 'Pacientes', '/patients', brokenFeatures, workingFeatures);
    await analyzeSection(page, 'Agendamentos', '/appointments', brokenFeatures, workingFeatures);
    await analyzeSection(page, 'Anamnese', '/anamnese', brokenFeatures, workingFeatures);
    await analyzeSection(page, 'Comunicação', '/communication', brokenFeatures, workingFeatures);
    await analyzeSection(page, 'Terapeutas', '/therapists', brokenFeatures, workingFeatures);
    await analyzeSection(page, 'Administração', '/administration', brokenFeatures, workingFeatures);
    
    // 3. TESTAR NAVEGAÇÃO INTERNA
    console.log('\n🧭 TESTANDO NAVEGAÇÃO INTERNA...');
    await testInternalNavigation(page, brokenFeatures, workingFeatures);
    
    // 4. TESTAR COMPONENTES INTERATIVOS
    console.log('\n🎯 TESTANDO COMPONENTES INTERATIVOS...');
    await testInteractiveComponents(page, brokenFeatures, workingFeatures);
    
  } catch (error) {
    console.log(`💥 Erro crítico: ${error.message}`);
    brokenFeatures.push(`Sistema - Erro crítico: ${error.message}`);
  }
  
  // RELATÓRIO FINAL DETALHADO
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL - ANÁLISE FUNCIONAL PROFUNDA');
  console.log('='.repeat(60));
  
  console.log(`✅ Funcionalidades OK: ${workingFeatures.length}`);
  console.log(`❌ Funcionalidades com problemas: ${brokenFeatures.length}`);
  console.log(`🚨 Erros de console: ${consoleErrors.length}`);
  console.log(`🌐 Erros de rede: ${networkErrors.length}`);
  
  if (workingFeatures.length > 0) {
    console.log('\n✅ FUNCIONALIDADES FUNCIONANDO:');
    workingFeatures.forEach((feature, i) => console.log(`   ${i+1}. ${feature}`));
  }
  
  if (brokenFeatures.length > 0) {
    console.log('\n❌ FUNCIONALIDADES COM PROBLEMAS:');
    brokenFeatures.forEach((feature, i) => console.log(`   ${i+1}. ${feature}`));
  }
  
  if (consoleErrors.length > 0) {
    console.log('\n🚨 PRINCIPAIS ERROS DE CONSOLE:');
    consoleErrors.slice(0, 10).forEach((error, i) => {
      console.log(`   ${i+1}. ${error.substring(0, 120)}${error.length > 120 ? '...' : ''}`);
    });
  }
  
  if (networkErrors.length > 0) {
    console.log('\n🌐 ERROS DE REDE:');
    networkErrors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
  }
  
  // Calcular % de funcionalidades
  const totalFeatures = workingFeatures.length + brokenFeatures.length;
  const successRate = totalFeatures > 0 ? ((workingFeatures.length / totalFeatures) * 100).toFixed(1) : 0;
  
  console.log('\n📈 RESUMO EXECUTIVO:');
  console.log(`   🎯 Taxa de Sucesso: ${successRate}%`);
  console.log(`   🔧 Funcionalidades OK: ${workingFeatures.length}/${totalFeatures}`);
  console.log(`   🚨 Necessitam Correção: ${brokenFeatures.length}/${totalFeatures}`);
  
  if (successRate < 70) {
    console.log('   🔴 STATUS: CRÍTICO - Muitas funcionalidades quebradas');
  } else if (successRate < 90) {
    console.log('   🟡 STATUS: ATENÇÃO - Algumas funcionalidades precisam correção');
  } else {
    console.log('   🟢 STATUS: BOM - Sistema majoritariamente funcional');
  }
  
  await page.waitForTimeout(8000);
  await browser.close();
  
  console.log('\n✅ ANÁLISE PROFUNDA CONCLUÍDA!\n');
})();

async function analyzeSection(page, sectionName, route, brokenFeatures, workingFeatures) {
  console.log(`\n📋 ANALISANDO SEÇÃO: ${sectionName.toUpperCase()}`);
  
  try {
    // Navegar para a seção
    await page.goto(`https://sapere-system.vercel.app${route}`, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      brokenFeatures.push(`${sectionName} - Redireciona para login (sem acesso)`);
      return;
    }
    
    workingFeatures.push(`${sectionName} - Página carrega sem redirecionamento`);
    
    // Screenshot da seção
    const safeName = sectionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await page.screenshot({ path: `screenshots/deep-${safeName}.png`, fullPage: true });
    
    // Análise dos elementos da página
    const pageElements = {
      forms: await page.locator('form').count(),
      buttons: await page.locator('button:not([disabled])').count(),
      inputs: await page.locator('input').count(),
      tables: await page.locator('table, .table, [role="table"]').count(),
      modals: await page.locator('.modal, [role="dialog"]').count(),
      links: await page.locator('a[href]').count()
    };
    
    console.log(`   📊 Elementos encontrados:`);
    console.log(`      📝 Formulários: ${pageElements.forms}`);
    console.log(`      🔘 Botões ativos: ${pageElements.buttons}`);
    console.log(`      📋 Inputs: ${pageElements.inputs}`);
    console.log(`      📊 Tabelas: ${pageElements.tables}`);
    console.log(`      🪟 Modais: ${pageElements.modals}`);
    console.log(`      🔗 Links: ${pageElements.links}`);
    
    if (pageElements.forms > 0) {
      workingFeatures.push(`${sectionName} - Tem ${pageElements.forms} formulário(s)`);
    }
    
    if (pageElements.buttons > 0) {
      workingFeatures.push(`${sectionName} - Tem ${pageElements.buttons} botão(ões) ativo(s)`);
      
      // Testar botões principais
      await testSectionButtons(page, sectionName, brokenFeatures, workingFeatures);
    } else {
      brokenFeatures.push(`${sectionName} - Nenhum botão ativo encontrado`);
    }
    
    if (pageElements.tables > 0) {
      workingFeatures.push(`${sectionName} - Tem ${pageElements.tables} tabela(s)`);
    }
    
    // Verificar se a página tem conteúdo útil
    const bodyText = await page.textContent('body');
    const hasUsefulContent = bodyText && bodyText.length > 200 && !bodyText.includes('404') && !bodyText.includes('Error');
    
    if (hasUsefulContent) {
      workingFeatures.push(`${sectionName} - Tem conteúdo significativo`);
    } else {
      brokenFeatures.push(`${sectionName} - Conteúdo insuficiente ou erro`);
    }
    
  } catch (error) {
    brokenFeatures.push(`${sectionName} - Erro ao carregar: ${error.message}`);
    console.log(`   ❌ Erro: ${error.message}`);
  }
}

async function testSectionButtons(page, sectionName, brokenFeatures, workingFeatures) {
  // Botões comuns para testar
  const buttonsToTest = [
    { text: 'Adicionar', action: 'add' },
    { text: 'Novo', action: 'create' },
    { text: 'Criar', action: 'create' },
    { text: 'Editar', action: 'edit' },
    { text: 'Salvar', action: 'save' },
    { text: 'Excluir', action: 'delete' },
    { text: 'Cancelar', action: 'cancel' },
    { text: 'Filtrar', action: 'filter' },
    { text: 'Pesquisar', action: 'search' }
  ];
  
  for (const buttonTest of buttonsToTest) {
    try {
      const button = await page.locator(`button:has-text("${buttonTest.text}"), [role="button"]:has-text("${buttonTest.text}")`).first();
      
      if (await button.count() > 0 && await button.isVisible()) {
        console.log(`   🔘 Testando botão: ${buttonTest.text}`);
        
        // Clicar no botão e ver o que acontece
        await button.click();
        await page.waitForTimeout(1500);
        
        // Verificar se algo aconteceu (modal abriu, página mudou, etc)
        const modalOpened = await page.locator('.modal:visible, [role="dialog"]:visible').count() > 0;
        const urlChanged = !page.url().includes(sectionName.toLowerCase()) || page.url().includes('?') || page.url().includes('#');
        const newContent = await page.locator('.loading, .spinner, .form, .table').count() > 0;
        
        if (modalOpened) {
          workingFeatures.push(`${sectionName} - Botão "${buttonTest.text}" abre modal`);
          
          // Fechar modal se possível
          const closeButton = await page.locator('button:has-text("Fechar"), button:has-text("Cancelar"), .modal .close, [aria-label="Close"]').first();
          if (await closeButton.count() > 0) {
            await closeButton.click();
            await page.waitForTimeout(500);
          }
        } else if (urlChanged) {
          workingFeatures.push(`${sectionName} - Botão "${buttonTest.text}" navega/filtra`);
        } else if (newContent) {
          workingFeatures.push(`${sectionName} - Botão "${buttonTest.text}" carrega conteúdo`);
        } else {
          brokenFeatures.push(`${sectionName} - Botão "${buttonTest.text}" não responde`);
        }
      }
    } catch (error) {
      brokenFeatures.push(`${sectionName} - Erro ao testar botão "${buttonTest.text}": ${error.message}`);
    }
  }
}

async function testInternalNavigation(page, brokenFeatures, workingFeatures) {
  // Voltar para dashboard
  await page.goto('https://sapere-system.vercel.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Procurar elementos de navegação (sidebar, menu, tabs)
  const navElements = await page.locator('.sidebar, .nav, .menu, .tabs, [role="navigation"], [role="tablist"]').all();
  
  console.log(`   🧭 Encontrados ${navElements.length} elementos de navegação`);
  
  if (navElements.length > 0) {
    workingFeatures.push(`Navegação - ${navElements.length} elemento(s) de navegação presente(s)`);
    
    // Testar links de navegação interna
    const navLinks = await page.locator('.sidebar a, .nav a, .menu a, [role="navigation"] a').all();
    
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
      try {
        const link = navLinks[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && href.startsWith('/')) {
          console.log(`   🔗 Testando link: ${text?.trim()} (${href})`);
          
          await link.click();
          await page.waitForTimeout(2000);
          
          if (page.url().includes(href.replace('/', ''))) {
            workingFeatures.push(`Navegação - Link "${text?.trim()}" funciona`);
          } else {
            brokenFeatures.push(`Navegação - Link "${text?.trim()}" não navega corretamente`);
          }
        }
      } catch (error) {
        brokenFeatures.push(`Navegação - Erro ao testar link: ${error.message}`);
      }
    }
  } else {
    brokenFeatures.push('Navegação - Nenhum elemento de navegação encontrado');
  }
}

async function testInteractiveComponents(page, brokenFeatures, workingFeatures) {
  // Voltar para uma página com conteúdo
  await page.goto('https://sapere-system.vercel.app/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Testar componentes específicos
  const components = {
    dropdowns: '.dropdown, select, [role="combobox"]',
    searchBoxes: 'input[type="search"], input[placeholder*="pesquis" i], input[placeholder*="buscar" i]',
    datePickers: 'input[type="date"], .datepicker, [role="datepicker"]',
    checkboxes: 'input[type="checkbox"]',
    radioButtons: 'input[type="radio"]',
    textareas: 'textarea'
  };
  
  for (const [componentName, selector] of Object.entries(components)) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        workingFeatures.push(`Componentes - ${count} ${componentName}`);
        
        // Testar interação básica com o primeiro elemento
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          try {
            if (componentName === 'searchBoxes' || componentName === 'textareas') {
              await element.fill('teste');
              await page.waitForTimeout(500);
              const value = await element.inputValue();
              if (value === 'teste') {
                workingFeatures.push(`Componentes - ${componentName} aceita input`);
              }
            } else if (componentName === 'checkboxes') {
              await element.check();
              if (await element.isChecked()) {
                workingFeatures.push(`Componentes - ${componentName} funciona`);
              }
            } else if (componentName === 'dropdowns') {
              await element.click();
              await page.waitForTimeout(500);
              workingFeatures.push(`Componentes - ${componentName} clicável`);
            }
          } catch (error) {
            brokenFeatures.push(`Componentes - ${componentName} não responde: ${error.message}`);
          }
        }
      }
    } catch (error) {
      brokenFeatures.push(`Componentes - Erro ao testar ${componentName}: ${error.message}`);
    }
  }
}