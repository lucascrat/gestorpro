import pool from '../config/database';

interface RenewalResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function renewClientInPanel(
  clientName: string,
  panelUsername: string,
  panelPassword: string
): Promise<RenewalResult> {
  let browser: any = null;

  try {
    console.log(`[Playwright] Iniciando renovação para: ${clientName}`);

    let chromium: any;
    try {
      // @ts-ignore - playwright é opcional, instalado em separado
      const playwright = require('playwright');
      chromium = playwright.chromium;
    } catch (err) {
      console.warn('[Playwright] Pacote não instalado. Renovação automática desativada.');
      return {
        success: false,
        message: 'Playwright não está instalado neste container',
        error: 'PLAYWRIGHT_NOT_INSTALLED',
      };
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const panelUrl = process.env.PANEL_URL || 'https://cms.startpainel.cc';

    console.log(`[Playwright] Acessando ${panelUrl}/login`);
    await page.goto(`${panelUrl}/login`, { waitUntil: 'networkidle' });

    console.log('[Playwright] Fazendo login...');
    await page.fill('input[name="email"]', panelUsername);
    await page.fill('input[name="password"]', panelPassword);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('[Playwright] Login bem-sucedido');

    console.log('[Playwright] Acessando aba CLIENTES...');
    await page.click('a:has-text("CLIENTES")');
    await page.waitForTimeout(2000);

    console.log(`[Playwright] Pesquisando cliente: ${clientName}`);
    const searchInput = 'input[placeholder*="Pesquisar"], input[type="search"]';
    await page.fill(searchInput, clientName);
    await page.waitForTimeout(1000);

    const parentRow = page.locator(`text=${clientName}`).locator('..');
    const extenderButton = parentRow.locator('button, a', { hasText: /Extender|Renovar|Extend/ }).first();
    await extenderButton.click();
    await page.waitForTimeout(500);
    console.log('[Playwright] Botão Extender clicado');

    const confirmButton = page.locator('button:has-text("Estender"), button:has-text("Confirmar")').first();
    await confirmButton.click();
    await page.waitForTimeout(2000);
    console.log('[Playwright] Renovação confirmada');

    await pool.query(
      'INSERT INTO renewal_logs (client_id, status) SELECT id, $1 FROM clients WHERE name = $2',
      ['success', clientName]
    );

    return {
      success: true,
      message: `Cliente ${clientName} renovado com sucesso!`,
    };
  } catch (error: any) {
    console.error(`[Playwright] Erro na renovação: ${error.message}`);

    try {
      await pool.query(
        'INSERT INTO renewal_logs (client_id, status, error_message, retry_count) SELECT id, $1, $2, 0 FROM clients WHERE name = $3',
        ['failed', error.message, clientName]
      );
    } catch (dbError) {
      console.error('Erro ao registrar log:', dbError);
    }

    return {
      success: false,
      message: `Falha ao renovar ${clientName}`,
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
      console.log('[Playwright] Browser fechado');
    }
  }
}
