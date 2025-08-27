const { chromium } = require('playwright');

(async () => {
  console.log('🔍 TESTE FINAL - FUNCIONALIDADES APÓS CORREÇÕES TYPESCRIPT\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const workingFeatures = [];
  const brokenFeatures = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  try {
    // Aguardar deploy
    console.log('⏳ Aguardando deploy Vercel (10 segundos)...');
    await page.waitForTimeout(10000);
    
    // 1. Login
    console.log('🔐 Fazendo login...');
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    
    await page.locator('input[type="email"]').fill('admin@sapere.com.br');
    await page.locator('input[type="password"]').fill('Sapere@2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    
    if (page.url().includes('/login')) {
      brokenFeatures.push('❌ Login continua falhando');
      console.log('❌ Login falhou, parando análise');
      await browser.close();
      return;
    }
    
    workingFeatures.push('✅ Login funcionando');
    console.log('✅ Login bem-sucedido!\n');
    
    // 2. Testar cada página principal
    const pagesToTest = [
      { name: 'Dashboard', url: '/', expectedElements: ['botões', 'cards', 'conteúdo'] },
      { name: 'Pacientes', url: '/patients', expectedElements: ['tabela', 'botão adicionar', 'busca'] },
      { name: 'Agendamentos', url: '/appointments', expectedElements: ['calendário', 'lista', 'filtros'] },
      { name: 'Anamnese', url: '/anamnese', expectedElements: ['formulários', 'templates'] },
      { name: 'Comunicação', url: '/communication', expectedElements: ['mensagens', 'envio'] },
      { name: 'Terapeutas', url: '/therapists', expectedElements: ['lista', 'perfis'] },
      { name: 'Administração', url: '/administration', expectedElements: ['configurações', 'usuários'] }
    ];
    
    for (const pageTest of pagesToTest) {
      console.log(`📋 Testando ${pageTest.name}...`);
      
      try {
        await page.goto(`https://sapere-system.vercel.app${pageTest.url}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        await page.waitForTimeout(3000);
        
        // Verificar se não redirecionou para login
        if (page.url().includes('/login')) {
          brokenFeatures.push(`${pageTest.name} - Redireciona para login (sem acesso)`);
          continue;
        }
        
        // Verificar elementos básicos
        const forms = await page.locator('form').count();
        const buttons = await page.locator('button:not([disabled])').count();
        const inputs = await page.locator('input').count();
        const tables = await page.locator('table, .table, [role="table"]').count();
        const links = await page.locator('a[href]').count();
        
        console.log(`   📊 ${pageTest.name}: ${forms}F, ${buttons}B, ${inputs}I, ${tables}T, ${links}L`);
        
        // Determinar se a página tem conteúdo significativo
        const hasSignificantContent = (
          buttons > 2 ||  // Mais que botões básicos de navegação
          forms > 0 ||    // Tem formulários
          tables > 0 ||   // Tem tabelas de dados
          inputs > 2      // Tem campos de input para interação
        );
        
        if (hasSignificantContent) {
          workingFeatures.push(`${pageTest.name} - Página com conteúdo funcional`);
          
          // Testar interações básicas se houver botões
          if (buttons > 0) {
            const actionButtons = await page.locator('button:has-text("Adicionar"), button:has-text("Novo"), button:has-text("Criar")');
            if (await actionButtons.count() > 0) {
              try {
                await actionButtons.first().click();
                await page.waitForTimeout(1000);
                
                // Verificar se algo aconteceu (modal, redirecionamento, etc)
                const modalOpened = await page.locator('.modal:visible, [role="dialog"]:visible').count() > 0;
                const urlChanged = page.url() !== `https://sapere-system.vercel.app${pageTest.url}`;
                
                if (modalOpened || urlChanged) {
                  workingFeatures.push(`${pageTest.name} - Botões de ação funcionam`);
                } else {
                  brokenFeatures.push(`${pageTest.name} - Botões de ação não respondem`);
                }
              } catch (error) {
                brokenFeatures.push(`${pageTest.name} - Erro ao testar botão: ${error.message}`);
              }
            }
          }
        } else {
          brokenFeatures.push(`${pageTest.name} - Página vazia ou sem funcionalidades`);
        }
        
        // Screenshot da página
        const safeName = pageTest.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await page.screenshot({ path: `screenshots/final-test-${safeName}.png`, fullPage: true });
        
      } catch (error) {
        brokenFeatures.push(`${pageTest.name} - Erro ao carregar: ${error.message}`);
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    // 3. Teste de navegação global
    console.log('\n🧭 Testando navegação global...');
    await page.goto('https://sapere-system.vercel.app/', { waitUntil: 'networkidle' });
    
    const navLinks = await page.locator('a[href^="/"], nav a, .sidebar a, .menu a').count();
    if (navLinks > 0) {
      workingFeatures.push(`Navegação - ${navLinks} links de navegação encontrados`);
    } else {
      brokenFeatures.push('Navegação - Nenhum sistema de navegação encontrado');
    }
    
  } catch (error) {
    brokenFeatures.push(`Erro crítico: ${error.message}`);
    console.log(`💥 Erro crítico: ${error.message}`);
  }
  
  // RELATÓRIO FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO FINAL - PÓS CORREÇÕES TYPESCRIPT');
  console.log('='.repeat(60));
  
  const totalFeatures = workingFeatures.length + brokenFeatures.length;
  const successRate = totalFeatures > 0 ? ((workingFeatures.length / totalFeatures) * 100).toFixed(1) : 0;
  
  console.log(`✅ Funcionalidades OK: ${workingFeatures.length}`);
  console.log(`❌ Funcionalidades com problemas: ${brokenFeatures.length}`);
  console.log(`🚨 Erros de console: ${consoleErrors.length}`);
  console.log(`📈 Taxa de Sucesso: ${successRate}%`);
  
  if (workingFeatures.length > 0) {
    console.log('\n✅ FUNCIONALIDADES FUNCIONANDO:');
    workingFeatures.forEach((feature, i) => console.log(`   ${i+1}. ${feature}`));
  }
  
  if (brokenFeatures.length > 0) {
    console.log('\n❌ FUNCIONALIDADES COM PROBLEMAS:');
    brokenFeatures.forEach((feature, i) => console.log(`   ${i+1}. ${feature}`));
  }
  
  if (consoleErrors.length > 0) {
    console.log('\n🚨 ERROS DE CONSOLE:');
    consoleErrors.slice(0, 5).forEach((error, i) => {
      console.log(`   ${i+1}. ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
    });
  }
  
  // Status final
  if (successRate >= 80) {
    console.log('\n🟢 STATUS: SISTEMA MAJORITARIAMENTE FUNCIONAL');
  } else if (successRate >= 60) {
    console.log('\n🟡 STATUS: SISTEMA PARCIALMENTE FUNCIONAL - NECESSITA AJUSTES');
  } else {
    console.log('\n🔴 STATUS: SISTEMA COM PROBLEMAS CRÍTICOS');
  }
  
  console.log(`\n📋 PRÓXIMOS PASSOS: ${brokenFeatures.length > 0 ? 'Corrigir funcionalidades quebradas' : 'Sistema pronto para uso!'}`);
  
  await page.waitForTimeout(5000);
  await browser.close();
  
  console.log('\n✅ TESTE FINAL CONCLUÍDO!\n');
})();