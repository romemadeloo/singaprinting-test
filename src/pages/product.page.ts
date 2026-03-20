import { expect, type Page } from '@playwright/test';

import { parseCurrencyToNumber } from '../utils/amount';
import { gotoAndStabilize } from '../utils/waits';

function exactText(text: string): RegExp {
  return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

export class ProductPage {
  constructor(private readonly page: Page) {}

  private async waitForAddToCartTransition(timeoutMs = 8_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const uploadVisible = await this.page
        .getByRole('link', { name: /Skip & upload artwork later/i })
        .isVisible()
        .catch(() => false);
      const miniCartVisible = await this.page
        .getByText(/Item added to Cart/i)
        .isVisible()
        .catch(() => false);
      if (uploadVisible || miniCartVisible) {
        return true;
      }
      await this.page.waitForTimeout(250);
    }
    return false;
  }

  async gotoDieCut(): Promise<void> {
    await gotoAndStabilize(this.page, '/stickers/die-cut?featured=1');
    await expect(this.page).toHaveURL(/\/stickers\/die-cut/i);
    await expect(this.page.getByRole('button', { name: /Add to Cart/i })).toBeVisible();
  }

  async assertDefaultConfigurator(): Promise<void> {
    await expect(this.page.getByRole('textbox', { name: /width/i })).toHaveValue('30');
    await expect(this.page.getByRole('textbox', { name: /height/i })).toHaveValue('30');
    await expect(this.page.getByRole('heading', { name: /Total Price/i })).toBeVisible();
    const total = await this.getDisplayedTotal();
    expect(total).toBeGreaterThan(0);
  }

  async chooseShape(shape: 'Circle' | 'Square' | 'Rounded' | 'Complex'): Promise<void> {
    await this.page.getByText(exactText(shape)).first().click();
  }

  async chooseMaterial(material: 'PVC Gloss' | 'PVC Matte' | 'Transparent' | 'Hologram'): Promise<void> {
    await this.page.getByText(exactText(material)).first().click();
  }

  async chooseQuantity(quantity: string): Promise<void> {
    await this.page.getByText(exactText(quantity)).first().click();
  }

  async setSize(widthMm: number, heightMm: number): Promise<void> {
    const widthInput = this.page.getByRole('textbox', { name: /width/i });
    const heightInput = this.page.getByRole('textbox', { name: /height/i });
    await widthInput.fill(String(widthMm));
    await heightInput.fill(String(heightMm));
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(800);
  }

  async getDisplayedTotal(): Promise<number> {
    const totalPriceHeading = this.page.getByRole('heading', { name: /Total Price/i }).first();
    const rawAmount = await totalPriceHeading
      .locator('xpath=following::h2[contains(normalize-space(.), "S$")][1]')
      .innerText();
    return parseCurrencyToNumber(rawAmount);
  }

  async assertSummaryContains(text: string): Promise<void> {
    await expect(
      this.page
        .locator('p')
        .filter({ hasText: /Qty\s*:/i })
        .first(),
    ).toContainText(new RegExp(text, 'i'));
  }

  async getConfigurationSummaryText(): Promise<string> {
    return this.page
      .locator('p')
      .filter({ hasText: /Qty\s*:/i })
      .first()
      .innerText();
  }

  async addToCart(): Promise<void> {
    const addToCartButton = this.page.getByRole('button', { name: /Add to Cart/i });
    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click();

    const transitioned = await this.waitForAddToCartTransition();
    if (!transitioned) {
      await addToCartButton.click({ force: true });
      await this.waitForAddToCartTransition(10_000);
    }
  }

  async assertUploadArtworkModalVisible(): Promise<void> {
    await expect(this.page.getByRole('link', { name: /Skip & upload artwork later/i })).toBeVisible();
  }

  async skipArtworkUpload(): Promise<void> {
    await this.page.getByRole('link', { name: /Skip & upload artwork later/i }).click();
  }

  async assertMiniCartVisible(): Promise<void> {
    await expect(this.page.getByText(/Item added to Cart/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /View Cart/i })).toBeVisible();
  }

  async openViewCartFromMiniCart(): Promise<void> {
    await this.page.getByRole('button', { name: /View Cart/i }).click();
  }
}
