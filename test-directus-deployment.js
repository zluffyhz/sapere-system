const { chromium } = require('playwright');

async function testDirectusDeployment() {
  console.log('🔍 VERIFICANDO DEPLOY DO DESIGN DIRECTUS\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Fazer login
    await page.goto('https://sapere-system.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.fill('input[type="email"]', 'admin@sapere.com.br');
    await page.fill('input[type="password"]', 'Sapere@2025');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    console.log('✅ Login realizado');
    
    // Verificar design profissional no dashboard
    const dashboardDesign = await page.evaluate(() => {
      const body = document.body;
      const header = document.querySelector('h1');
      const cards = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm');
      const buttons = document.querySelectorAll('.btn-primary, .bg-sapere-orange');
      
      return {
        bodyClass: body.className,
        headerText: header?.textContent,
        cardsFound: cards.length,
        buttonsFound: buttons.length,
        hasGradientIcons: document.querySelectorAll('.bg-gradient-to-br').length > 0,
        hasMaxWidth: document.querySelectorAll('.max-w-7xl').length > 0,
        hasDirectusHeader: document.querySelectorAll('.shadow-sm.border-b').length > 0
      };
    });
    
    console.log('🎨 Design Dashboard:', dashboardDesign);
    
    // Navegar para pacientes
    await page.goto('https://sapere-system.vercel.app/#/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Verificar design profissional na página de pacientes
    const patientsDesign = await page.evaluate(() => {
      const title = document.querySelector('h1');
      const cards = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm');
      const buttons = document.querySelectorAll('button');
      const tables = document.querySelectorAll('.table-professional, table');
      
      return {
        pageTitle: title?.textContent,
        cardsFound: cards.length,
        buttonsFound: buttons.length,
        tablesFound: tables.length,
        hasGradientIcons: document.querySelectorAll('.bg-gradient-to-br').length > 0,
        hasMaxWidth: document.querySelectorAll('.max-w-7xl').length > 0,
        hasDirectusHeader: document.querySelectorAll('.shadow-sm.border-b').length > 0,
        hasProfessionalLayout: document.querySelectorAll('.min-h-screen.bg-gray-50').length > 0
      };
    });
    
    console.log('🏥 Design Pacientes:', patientsDesign);
    
    // Screenshot final
    await page.screenshot({ path: 'final-deployment-test.png', fullPage: true });
    console.log('📸 Screenshot final capturado');
    
    // Verificar se o botão "Novo Paciente" existe e funciona
    const newPatientBtn = page.locator('button').filter({ hasText: /Novo.*Paciente/i });
    const btnExists = await newPatientBtn.count() > 0;
    console.log(`🔘 Botão "Novo Paciente": ${btnExists ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
    
    if (btnExists) {
      await newPatientBtn.first().click();
      await page.waitForTimeout(2000);
      
      const modalVisible = await page.locator('.fixed.inset-0, [role="dialog"]').count() > 0;
      console.log(`📝 Modal: ${modalVisible ? '✅ ABRIU' : '❌ NÃO ABRIU'}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✅ TESTE DIRECTUS CONCLUÍDO');
  }
}

testDirectusDeployment();