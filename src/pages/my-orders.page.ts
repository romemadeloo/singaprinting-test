import { expect, type Page } from '@playwright/test';

import { roleFirst } from '../utils/selectors';
import { gotoAndStabilize } from '../utils/waits';

export class MyOrdersPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await gotoAndStabilize(this.page, '/mypage/orders');
  }

  async assertLoadedWithoutAppError(): Promise<void> {
    await expect(this.page).toHaveURL(/\/mypage\/orders/i);
    await expect(this.page.getByText(/Order No\./i)).toBeVisible();
    await expect(this.page.getByText(/Internal Server Error|404|500/i)).toHaveCount(0);
  }

  async signOut(): Promise<void> {
    await roleFirst(this.page, 'link', /My Account/i).click();
    const signOut = this.page
      .getByRole('link', { name: /Sign Out/i })
      .or(this.page.getByText(/Sign Out/i))
      .first();
    await expect(signOut).toBeVisible();
    await signOut.click();
    await this.page.waitForLoadState('networkidle');
  }
}
