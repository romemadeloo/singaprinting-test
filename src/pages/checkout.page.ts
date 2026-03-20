import { expect, type Page } from '@playwright/test';

import { parseCurrencyToNumber } from '../utils/amount';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async assertOnCheckoutPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout/i);
    await expect(this.page.getByRole('heading', { name: /Secure Checkout/i })).toBeVisible();
  }

  async clickCompleteCheckout(): Promise<void> {
    await this.page.getByRole('button', { name: /Complete Checkout/i }).click();
  }

  async assertRequiredFieldValidation(): Promise<void> {
    await expect(this.page.getByText(/Email Address is required/i)).toBeVisible();
    await expect(this.page.getByText(/Full Name is required/i)).toBeVisible();
    await expect(this.page.getByText(/Address Line 1 is required/i)).toBeVisible();
    await expect(this.page.getByText(/Postcode is required/i)).toBeVisible();
    await expect(this.page.getByText(/Phone Number is required/i)).toBeVisible();
  }

  async getTotalCost(): Promise<number> {
    const panel = this.page
      .locator('aside, [role="complementary"]')
      .filter({ hasText: /Total Cost/i })
      .first();
    await expect(panel).toBeVisible();
    const panelText = await panel.innerText();
    const amounts = panelText.match(/S\$\s*[0-9,.]+/g) ?? [];
    if (amounts.length === 0) {
      throw new Error('Unable to read checkout total cost amount.');
    }
    return parseCurrencyToNumber(amounts[amounts.length - 1]);
  }

  async selectShippingMethod(method: 'Standard' | 'Express'): Promise<void> {
    const option = this.page.getByText(method, { exact: true }).first();
    await option.scrollIntoViewIfNeeded();
    await option.click({ force: true });
  }

  async getShippingOptionFee(method: 'Standard' | 'Express'): Promise<number> {
    const option = this.page.getByText(method, { exact: true }).first();
    const optionCard = option.locator('xpath=ancestor::div[1]');
    const text = await optionCard.innerText();

    if (/free/i.test(text)) {
      return 0;
    }

    const match = text.match(/S\$\s*[0-9,.]+/i);
    return match ? parseCurrencyToNumber(match[0]) : 0;
  }

  async selectPaymentOption(option: 'Credit Card' | 'PayPal' | 'Bank Transfer'): Promise<void> {
    await this.page.getByRole('radio', { name: new RegExp(option, 'i') }).click();
  }

  async assertPaymentPanelFor(option: 'Credit Card' | 'PayPal' | 'Bank Transfer'): Promise<void> {
    if (option === 'Credit Card') {
      await expect(this.page.getByRole('img', { name: /credit-card payment option/i })).toBeVisible();
      return;
    }
    if (option === 'PayPal') {
      await expect(this.page.getByRole('img', { name: /paypal payment option/i })).toBeVisible();
      return;
    }
    await expect(this.page.getByRole('img', { name: /bank-transfer payment option/i })).toBeVisible();
  }

  async assertTermsWarningVisible(): Promise<void> {
    await expect(
      this.page.getByText(/Please agree to our terms of services & privacy policy/i),
    ).toBeVisible();
  }

  async openRequestQuotation(): Promise<void> {
    await this.page.getByRole('button', { name: /Request quotation/i }).click();
  }

  async assertQuotationModal(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /QUOTATION/i })).toBeVisible();
    await expect(this.page.getByText(/PRODUCT DESCRIPTION/i)).toBeVisible();
    await expect(this.page.getByText(/TOTAL/i).first()).toBeVisible();
  }
}
