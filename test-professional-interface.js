const { chromium } = require('playwright');

async function testProfessionalInterface() {
  console.log('🔍 TESTANDO INTERFACE PROFISSIONAL COM PLAYWRIGHT\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Fazer login
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    console.log('📱 Carregando página inicial...');
    
    // Aguardar elementos carregarem
    await page.waitForTimeout(3000);
    
    // Fazer login
    await page.fill('input[type="email"]', 'admin@sapere.com.br');
    await page.fill('input[type="password"]', 'Sapere@2025');
    await page.click('button[type="submit"]');
    
    // Aguardar redirect
    await page.waitForTimeout(5000);
    
    console.log('✅ Login realizado');
    console.log(`📍 URL atual: ${page.url()}`);
    
    // Verificar se estamos no dashboard
    const dashboardTitle = await page.textContent('h1').catch(() => 'Título não encontrado');
    console.log(`📋 Título encontrado: "${dashboardTitle}"`);
    
    // Verificar se o design profissional está aplicado
    const hasNewDesign = await page.evaluate(() => {
      const header = document.querySelector('h1');
      const styles = header ? window.getComputedStyle(header) : null;
      return {
        fontSize: styles?.fontSize,
        fontWeight: styles?.fontWeight,
        color: styles?.color,
        hasCards: document.querySelectorAll('.card').length > 0,
        hasProfessionalButtons: document.querySelectorAll('.btn-primary').length > 0
      };
    });
    
    console.log('🎨 Verificação de design:', hasNewDesign);
    
    // Capturar screenshot do dashboard
    await page.screenshot({ path: 'dashboard-current.png', fullPage: true });
    console.log('📸 Screenshot do dashboard capturada');
    
    // Navegar para pacientes usando hash router
    console.log('\n🏥 Navegando para página de pacientes...');
    await page.goto('https://sapere-system.vercel.app/#/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log(`📍 URL após navegação: ${page.url()}`);
    
    // Verificar se carregou a página de pacientes
    const pageTitle = await page.textContent('h1').catch(() => 'Título não encontrado');
    console.log(`📋 Título da página: "${pageTitle}"`);
    
    // Procurar pelo botão "Novo Paciente"
    const newPatientButton = page.locator('button:has-text("Novo Paciente"), button:has-text("Novo")');
    const buttonCount = await newPatientButton.count();
    console.log(`🔘 Botões "Novo Paciente" encontrados: ${buttonCount}`);
    
    if (buttonCount > 0) {
      console.log('✅ Botão "Novo Paciente" está presente!');
      
      // Verificar estilos do botão
      const buttonStyles = await page.evaluate(() => {
        const btn = document.querySelector('button:has-text("Novo Paciente"), button:has-text("Novo")');
        const styles = btn ? window.getComputedStyle(btn) : null;
        return {
          backgroundColor: styles?.backgroundColor,
          padding: styles?.padding,
          borderRadius: styles?.borderRadius,
          classes: btn?.className
        };
      });
      
      console.log('🎨 Estilos do botão:', buttonStyles);
      
      // Testar se o botão funciona
      await newPatientButton.first().click();
      await page.waitForTimeout(2000);
      
      // Verificar se modal abriu
      const modal = page.locator('.modal, [role="dialog"], .fixed.inset-0');
      const modalCount = await modal.count();
      console.log(`📝 Modais encontrados: ${modalCount}`);
      
      if (modalCount > 0) {
        console.log('🎉 MODAL ABRIU CORRETAMENTE!');
        await page.screenshot({ path: 'patients-modal-working.png' });
      }
    } else {
      console.log('❌ Botão "Novo Paciente" não encontrado');
    }
    
    // Screenshot da página de pacientes
    await page.screenshot({ path: 'patients-current.png', fullPage: true });
    console.log('📸 Screenshot da página de pacientes capturada');
    
    // Testar outras rotas
    const routes = ['/#/appointments', '/#/communication', '/#/anamnese'];
    for (const route of routes) {
      console.log(`\n📋 Testando rota: ${route}`);
      await page.goto(`https://sapere-system.vercel.app${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const title = await page.textContent('h1').catch(() => 'Não encontrado');
      console.log(`   Título: ${title}`);
      
      const has404 = await page.locator('text=404').count() > 0;
      console.log(`   Status: ${has404 ? '❌ 404' : '✅ OK'}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro durante teste: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✅ TESTE PLAYWRIGHT CONCLUÍDO');
  }
}

// Executar o teste
testProfessionalInterface();