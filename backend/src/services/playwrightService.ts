import { chromium, Browser, Page } from 'playwright';
import pool from '../config/database';

interface RenewalResult {
  success: boolean;
  message: string;
  error?: string;
}

async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

export async function renewClientInPanel(clientName: string, panelUsername: string, panelPassword: string): Promise<RenewalResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`[Playwright] Iniciando renovação para: ${clientName}`);

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    const panelUrl = process.env.PANEL_URL || 'https://cms.startpainel.cc';

    // 1. Acessar página de login
    console.log(`[Playwright] Acessando ${panelUrl}/login`);
    await page.goto(`${panelUrl}/login`, { waitUntil: 'networkidle' });

    // 2. Fazer login com credenciais do admin
    console.log('[Playwright] Fazendo login...');
    await page.fill('input[name="email"]', panelUsername);
    await page.fill('input[name="password"]', panelPassword);
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('[Playwright] Login bem-sucedido');

    // 3. Navegar para CLIENTES
    console.log('[Playwright] Acessando aba CLIENTES...');
    await waitForElement(page, 'a:has-text("CLIENTES")', 10000);
    await page.click('a:has-text("CLIENTES")');
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // 4. Pesquisar cliente por nome
    console.log(`[Playwright] Pesquisando cliente: ${clientName}`);
    const searchInput = 'input[placeholder*="Pesquisar"], input[type="search"]';

    if (await waitForElement(page, searchInput)) {
      await page.fill(searchInput, clientName);
      await page.waitForTimeout(1000); // Aguardar filtro
    }

    // 5. Clicar em "Extender" do cliente
    console.log('[Playwright] Procurando botão Extender...');

    // Aguardar pela linha contendo o nome do cliente
    const clientRow = `text=${clientName}`;
    if (await waitForElement(page, clientRow)) {
      const parentRow = await page.locator(`text=${clientName}`).locator('..');
      const extenderButton = parentRow.locator('button, a', { hasText: /Extender|Renovar|Extend/ }).first();

      if (extenderButton) {
        await extenderButton.click();
        await page.waitForTimeout(500);
        console.log('[Playwright] Botão Extender clicado');
      }
    }

    // 6. Confirmar renovação no modal
    console.log('[Playwright] Confirmando renovação...');

    // Aguardar modal aparecer
    const confirmButton = page.locator('button:has-text("Estender"), button:has-text("Confirmar"), button:has-text("Extend")').first();

    if (confirmButton) {
      await confirmButton.click();
      await page.waitForTimeout(2000); // Aguardar sucesso
      console.log('[Playwright] Renovação confirmada');
    }

    // Registrar sucesso no banco
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

    // Registrar erro no banco
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
