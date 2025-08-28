const { chromium } = require('playwright');

async function testFinalCleanup() {
  console.log('🔍 TESTANDO LIMPEZA FINAL E CACHE REFRESH\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Limpar cache do navegador
    await page.goto('https://sapere-system.vercel.app?v=' + Date.now(), { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('📱 Carregando com cache refresh...');
    
    await page.waitForTimeout(3000);
    
    // Fazer login
    await page.fill('input[type="email"]', 'admin@sapere.com.br');
    await page.fill('input[type="password"]', 'Sapere@2025');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    console.log('✅ Login realizado');
    
    // Verificar se as novas mudanças estão aplicadas
    const dashboardChanges = await page.evaluate(() => {
      const title = document.querySelector('h1');
      const statusBadge = document.querySelector('.text-green-700');
      const largeIcon = document.querySelector('.w-16.h-16');
      const emoji = title?.textContent?.includes('🌟');
      
      return {
        titleText: title?.textContent?.trim(),
        hasEmoji: emoji,
        hasStatusBadge: !!statusBadge,
        statusBadgeText: statusBadge?.textContent,
        hasLargeIcon: !!largeIcon,
        iconClasses: largeIcon?.className
      };
    });
    
    console.log('🎨 Verificação Dashboard:', dashboardChanges);
    
    // Testar navegação para pacientes
    await page.goto('https://sapere-system.vercel.app/#/patients?v=' + Date.now(), { 
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(3000);
    
    const patientsChanges = await page.evaluate(() => {
      const title = document.querySelector('h1');
      const statusBadge = document.querySelector('.text-blue-700');
      const largeIcon = document.querySelector('.w-16.h-16');
      const emoji = title?.textContent?.includes('👥');
      
      return {
        titleText: title?.textContent?.trim(),
        hasEmoji: emoji,
        hasStatusBadge: !!statusBadge,
        statusBadgeText: statusBadge?.textContent,
        hasLargeIcon: !!largeIcon,
        gradientClasses: largeIcon?.className?.includes('from-blue-500')
      };
    });
    
    console.log('🏥 Verificação Pacientes:', patientsChanges);
    
    // Testar se o botão ainda funciona
    const newPatientBtn = page.locator('button').filter({ hasText: /Novo.*Paciente/i });
    const btnExists = await newPatientBtn.count() > 0;
    console.log(`🔘 Botão "Novo Paciente": ${btnExists ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
    
    if (btnExists) {
      await newPatientBtn.first().click();
      await page.waitForTimeout(2000);
      
      const modalVisible = await page.locator('.fixed.inset-0, [role="dialog"]').count() > 0;
      console.log(`📝 Modal: ${modalVisible ? '✅ ABRIU' : '❌ NÃO ABRIU'}`);
    }
    
    // Screenshot final
    await page.screenshot({ path: 'final-cleanup-test.png', fullPage: true });
    console.log('📸 Screenshot final capturado');
    
    // Verificar se as mudanças foram aplicadas
    const success = dashboardChanges.hasEmoji && 
                   dashboardChanges.hasStatusBadge && 
                   patientsChanges.hasEmoji && 
                   patientsChanges.hasStatusBadge &&
                   btnExists;
                   
    console.log(`\n${success ? '🎉 SUCESSO TOTAL!' : '❌ AINDA COM PROBLEMAS'}`);
    console.log(`Dashboard emoji: ${dashboardChanges.hasEmoji ? '✅' : '❌'}`);
    console.log(`Dashboard status: ${dashboardChanges.hasStatusBadge ? '✅' : '❌'}`);
    console.log(`Pacientes emoji: ${patientsChanges.hasEmoji ? '✅' : '❌'}`);
    console.log(`Pacientes status: ${patientsChanges.hasStatusBadge ? '✅' : '❌'}`);
    console.log(`Botão funcional: ${btnExists ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✅ TESTE FINAL CONCLUÍDO');
  }
}

testFinalCleanup();