const { chromium } = require('playwright');

(async () => {
  console.log('🔍 ANÁLISE DETALHADA DAS FUNCIONALIDADES INTERNAS - SAPERE SYSTEM\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Arrays para capturar problemas
  const consoleErrors = [];
  const networkErrors = [];
  const brokenFeatures = [];
  const workingFeatures = [];
  
  // Capturar logs e erros
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warn') {
      console.log(`⚠️ Console Warning: ${msg.text()}`);
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
    // 1. Acessar a página de perfil autenticada
    console.log('🎯 Acessando página de perfil autenticada...');
    await page.goto('https://sapere-system.vercel.app/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);
    
    // Screenshot inicial
    await page.screenshot({ path: 'screenshots/auth-01-profile.png', fullPage: true });
    
    // Verificar se está realmente autenticado
    const isLoginPage = currentUrl.includes('/login');
    if (isLoginPage) {
      console.log('❌ ERRO: Redirecionado para login - sessão expirou ou não está autenticado');
      await browser.close();
      return;
    }
    
    console.log('✅ Acesso autenticado confirmado!');
    
    // 2. TESTAR PÁGINA DE PERFIL
    await testProfilePage(page, brokenFeatures, workingFeatures);
    
    // 3. NAVEGAR E TESTAR TODAS AS SEÇÕES
    const sections = [
      { name: 'Dashboard', url: '/', selector: '[href="/"], [href="#/"]' },
      { name: 'Pacientes', url: '/patients', selector: '[href="/patients"]' },
      { name: 'Agendamentos', url: '/appointments', selector: '[href="/appointments"]' },
      { name: 'Anamnese', url: '/anamnese', selector: '[href="/anamnese"]' },
      { name: 'Comunicação', url: '/communication', selector: '[href="/communication"]' },
      { name: 'Terapeutas', url: '/therapists', selector: '[href="/therapists"]' },
      { name: 'Administração', url: '/administration', selector: '[href="/administration"]' }
    ];
    
    for (const section of sections) {
      await testSection(page, section, brokenFeatures, workingFeatures);
    }
    
    // 4. TESTAR FUNCIONALIDADES ESPECÍFICAS
    await testSpecificFeatures(page, brokenFeatures, workingFeatures);
    
    // 5. GERAR RELATÓRIO FINAL
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`✅ Funcionalidades funcionando: ${workingFeatures.length}`);
    console.log(`❌ Funcionalidades com problemas: ${brokenFeatures.length}`);
    console.log(`🚨 Erros de console: ${consoleErrors.length}`);
    console.log(`🌐 Erros de rede: ${networkErrors.length}`);
    
    if (workingFeatures.length > 0) {
      console.log('\n✅ FUNCIONANDO:');
      workingFeatures.forEach(feature => console.log(`   • ${feature}`));
    }
    
    if (brokenFeatures.length > 0) {
      console.log('\n❌ PROBLEMAS ENCONTRADOS:');
      brokenFeatures.forEach(feature => console.log(`   • ${feature}`));
    }
    
    if (consoleErrors.length > 0) {
      console.log('\n🚨 ERROS DE CONSOLE:');
      consoleErrors.slice(0, 10).forEach(error => console.log(`   • ${error.substring(0, 100)}...`));
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 ERROS DE REDE:');
      networkErrors.forEach(error => console.log(`   • ${error}`));
    }
    
  } catch (error) {
    console.log(`💥 Erro crítico durante os testes: ${error.message}`);
  }
  
  console.log('\n⏳ Aguardando 10 segundos para visualização...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('\n✅ ANÁLISE COMPLETA FINALIZADA!\n');
})();

async function testProfilePage(page, brokenFeatures, workingFeatures) {
  console.log('\n👤 TESTANDO PÁGINA DE PERFIL...');
  
  try {
    // Verificar elementos básicos do perfil
    const profileForm = await page.locator('form, .profile-form').count();
    const inputFields = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    
    console.log(`📝 Formulários encontrados: ${profileForm}`);
    console.log(`📋 Campos de input: ${inputFields}`);
    console.log(`🔘 Botões: ${buttons}`);
    
    if (profileForm > 0) {
      workingFeatures.push('Página de Perfil - Formulário presente');
    } else {
      brokenFeatures.push('Página de Perfil - Nenhum formulário encontrado');
    }
    
    // Testar campos específicos do perfil
    const nameField = await page.locator('input[name="name"], input[name="nome"], input[placeholder*="nome" i]').count();
    const emailField = await page.locator('input[name="email"], input[type="email"]').count();
    const saveButton = await page.locator('button:has-text("Salvar"), button:has-text("Atualizar"), button[type="submit"]').count();
    
    if (nameField > 0) {
      workingFeatures.push('Perfil - Campo Nome presente');
    } else {
      brokenFeatures.push('Perfil - Campo Nome ausente');
    }
    
    if (emailField > 0) {
      workingFeatures.push('Perfil - Campo Email presente');
    } else {
      brokenFeatures.push('Perfil - Campo Email ausente');
    }
    
    if (saveButton > 0) {
      workingFeatures.push('Perfil - Botão Salvar presente');
      
      // Tentar clicar no botão salvar para testar funcionalidade
      try {
        const saveBtn = await page.locator('button:has-text("Salvar"), button:has-text("Atualizar"), button[type="submit"]').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          
          // Verificar se houve alguma resposta (sucesso ou erro)
          const alertMessage = await page.locator('.alert, .toast, .notification, [role="alert"]').count();
          if (alertMessage > 0) {
            workingFeatures.push('Perfil - Botão Salvar funcional (resposta recebida)');
          } else {
            brokenFeatures.push('Perfil - Botão Salvar sem resposta');
          }
        }
      } catch (error) {
        brokenFeatures.push(`Perfil - Erro ao clicar em Salvar: ${error.message}`);
      }
    } else {
      brokenFeatures.push('Perfil - Botão Salvar ausente');
    }
    
  } catch (error) {
    brokenFeatures.push(`Perfil - Erro ao testar página: ${error.message}`);
  }
}

async function testSection(page, section, brokenFeatures, workingFeatures) {
  console.log(`\n🔍 TESTANDO SEÇÃO: ${section.name}...`);
  
  try {
    // Tentar navegar para a seção
    const menuLink = await page.locator(section.selector).first();
    
    if (await menuLink.count() > 0) {
      workingFeatures.push(`Navegação - Menu ${section.name} presente`);
      
      await menuLink.click();
      await page.waitForTimeout(3000);
      
      const newUrl = page.url();
      const expectedUrl = section.url === '/' ? 'https://sapere-system.vercel.app/' : `https://sapere-system.vercel.app${section.url}`;
      
      if (newUrl.includes(section.url) || (section.url === '/' && !newUrl.includes('/login'))) {
        workingFeatures.push(`${section.name} - Navegação funcionando`);
        
        // Screenshot da seção
        const sectionName = section.name.toLowerCase().replace('ç', 'c').replace('õ', 'o');
        await page.screenshot({ path: `screenshots/auth-${sectionName}.png`, fullPage: true });
        
        // Verificar conteúdo da página
        const hasContent = await testSectionContent(page, section.name, brokenFeatures, workingFeatures);
        
      } else {
        brokenFeatures.push(`${section.name} - Navegação não funcionou (URL: ${newUrl})`);
      }
    } else {
      brokenFeatures.push(`Navegação - Menu ${section.name} não encontrado`);
    }
  } catch (error) {
    brokenFeatures.push(`${section.name} - Erro ao navegar: ${error.message}`);
  }
}

async function testSectionContent(page, sectionName, brokenFeatures, workingFeatures) {
  const forms = await page.locator('form').count();
  const tables = await page.locator('table, .table, [role="table"]').count();
  const buttons = await page.locator('button').count();
  const inputs = await page.locator('input').count();
  const modals = await page.locator('.modal, [role="dialog"]').count();
  
  const hasMainContent = forms > 0 || tables > 0 || buttons > 2 || inputs > 0;
  
  if (hasMainContent) {
    workingFeatures.push(`${sectionName} - Conteúdo carregado (${forms}F, ${tables}T, ${buttons}B, ${inputs}I)`);
    
    // Testar botões específicos da seção
    const addButton = await page.locator('button:has-text("Adicionar"), button:has-text("Criar"), button:has-text("Novo"), button:has-text("+")').count();
    const editButton = await page.locator('button:has-text("Editar"), button:has-text("Edit")').count();
    const deleteButton = await page.locator('button:has-text("Excluir"), button:has-text("Deletar")').count();
    
    if (addButton > 0) workingFeatures.push(`${sectionName} - Botão Adicionar presente`);
    if (editButton > 0) workingFeatures.push(`${sectionName} - Botão Editar presente`);
    if (deleteButton > 0) workingFeatures.push(`${sectionName} - Botão Deletar presente`);
    
  } else {
    brokenFeatures.push(`${sectionName} - Página vazia ou sem conteúdo principal`);
  }
  
  return hasMainContent;
}

async function testSpecificFeatures(page, brokenFeatures, workingFeatures) {
  console.log('\n🧪 TESTANDO FUNCIONALIDADES ESPECÍFICAS...');
  
  // Testar logout
  try {
    const logoutButton = await page.locator('button:has-text("Sair"), button:has-text("Logout"), a:has-text("Sair")').count();
    if (logoutButton > 0) {
      workingFeatures.push('Sistema - Botão Logout presente');
    } else {
      brokenFeatures.push('Sistema - Botão Logout não encontrado');
    }
  } catch (error) {
    brokenFeatures.push(`Sistema - Erro ao testar logout: ${error.message}`);
  }
  
  // Testar sidebar/navegação
  try {
    const sidebar = await page.locator('.sidebar, nav, [role="navigation"]').count();
    const header = await page.locator('header, .header').count();
    
    if (sidebar > 0) workingFeatures.push('Interface - Sidebar presente');
    else brokenFeatures.push('Interface - Sidebar ausente');
    
    if (header > 0) workingFeatures.push('Interface - Header presente');
    else brokenFeatures.push('Interface - Header ausente');
    
  } catch (error) {
    brokenFeatures.push(`Interface - Erro ao testar navegação: ${error.message}`);
  }
  
  // Testar notificações
  try {
    const notifications = await page.locator('.notification, .toast, .alert, [role="alert"]').count();
    console.log(`🔔 Notificações ativas: ${notifications}`);
  } catch (error) {
    console.log(`⚠️ Erro ao verificar notificações: ${error.message}`);
  }
}