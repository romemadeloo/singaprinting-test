import { expect, type Page } from '@playwright/test';

import { parseCurrencyToNumber } from '../utils/amount';
import { dismissKnownOverlays, waitForPageReady } from '../utils/waits';

export type CartSummary = {
  subtotal: number;
  shipping: number;
  total: number;
};

export class CartPage {
  constructor(private readonly page: Page) {}

  async continueAsGuestFromAuthGate(): Promise<void> {
    const continueAsGuest = this.page.getByRole('link', { name: /Continue as guest/i });
    await expect(continueAsGuest).toBeVisible();
    await continueAsGuest.click();
    await this.page.waitForURL(/\/cart/i);
    await waitForPageReady(this.page);
    await dismissKnownOverlays(this.page);
  }

  async assertOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cart/i);
    await expect(this.page.getByRole('heading', { name: /Cart \(/i })).toBeVisible();
  }

  async getSummaryTotals(): Promise<CartSummary> {
    const panel = this.page
      .locator('aside, [role="complementary"]')
      .filter({ hasText: /Shipping Fee/i })
      .first();
    await expect(panel).toBeVisible();
    const panelText = await panel.innerText();
    const amountTexts = panelText.match(/S\$\s*[0-9,.]+/g) ?? [];
    if (amountTexts.length < 3) {
      throw new Error(
        `Expected at least 3 summary amounts in cart, but found ${amountTexts.length}.`,
      );
    }

    return {
      subtotal: parseCurrencyToNumber(amountTexts[0]!),
      shipping: parseCurrencyToNumber(amountTexts[1]!),
      total: parseCurrencyToNumber(amountTexts[2]!),
    };
  }

  async goToCheckout(): Promise<void> {
    await this.page.getByRole('button', { name: /^CHECKOUT$/i }).click();
    await this.page.waitForURL(/\/checkout/i);
  }
}
