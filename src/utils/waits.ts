import { type Locator, type Page } from '@playwright/test';

export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
}

export async function clickIfVisible(
  locator: Locator,
  timeoutMs = 1_500,
  options?: { force?: boolean },
): Promise<boolean> {
  const target = locator.first();
  const visible = await target.isVisible({ timeout: timeoutMs }).catch(() => false);
  if (!visible) {
    return false;
  }

  try {
    await target.scrollIntoViewIfNeeded().catch(() => undefined);
    await target.click({ timeout: timeoutMs, force: options?.force });
    return true;
  } catch {
    return false;
  }
}

export async function dismissKnownOverlays(page: Page): Promise<void> {
  const candidates: Locator[] = [
    page.getByRole('link', { name: /Close Modal/i }),
    page.getByRole('button', { name: /Close/i }),
    page.locator('a:has(img[alt*="close" i])'),
    page.locator('button:has(img[alt*="close" i])'),
  ];

  for (let i = 0; i < 3; i += 1) {
    let clicked = false;
    for (const candidate of candidates) {
      clicked = (await clickIfVisible(candidate, 1_000, { force: true })) || clicked;
    }
    if (!clicked) {
      break;
    }
  }
}

export async function gotoAndStabilize(page: Page, pathOrUrl: string): Promise<void> {
  await page.goto(pathOrUrl, { waitUntil: 'domcontentloaded' });
  await waitForPageReady(page);
  await dismissKnownOverlays(page);
}
