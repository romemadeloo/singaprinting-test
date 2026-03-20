import { expect, type Page } from '@playwright/test';

export class AuthModalPage {
  constructor(private readonly page: Page) {}

  async assertMemberLoginFormVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /Sign In to your account/i })).toBeVisible();
    await expect(this.page.getByRole('textbox').first()).toBeVisible();
    await expect(this.page.locator('input[type="password"]').first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /^Sign In$/i })).toBeVisible();
  }

  async login(
    email: string,
    password: string,
    options?: { expectSuccess?: boolean },
  ): Promise<void> {
    const emailInput = this.page.getByRole('textbox').first();
    const passwordInput = this.page.locator('input[type="password"]').first();
    const signInHeading = this.page.getByRole('heading', { name: /Sign In to your account/i });
    const expectSuccess = options?.expectSuccess ?? true;

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await this.page.getByRole('button', { name: /^Sign In$/i }).click();
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

    if (!expectSuccess) {
      await expect(this.page.getByText(/do not match/i)).toBeVisible();
      return;
    }

    await expect(signInHeading).toBeHidden({ timeout: 15_000 });
  }

  async assertNotAuthenticated(): Promise<void> {
    await this.page.waitForTimeout(2_000);
    await expect(this.page).not.toHaveURL(/\/mypage\//i);
    await expect(this.page.locator('a[href="/mypage/orders"]')).toHaveCount(0);
  }
}
