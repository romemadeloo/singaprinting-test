import { expect, type Page } from '@playwright/test';

import { roleFirst } from '../utils/selectors';
import { clickIfVisible, dismissKnownOverlays, gotoAndStabilize } from '../utils/waits';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await gotoAndStabilize(this.page, '/');
  }

  async assertKeyNavigationSectionsVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Custom Stickers', exact: true })).toBeVisible();
    await expect(roleFirst(this.page, 'link', /STICKERS/i)).toBeVisible();
    await expect(roleFirst(this.page, 'link', /GET SAMPLES/i)).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Shop by Material/i })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Shop by Supply/i })).toBeVisible();
  }

  async openMyAccountMenu(): Promise<void> {
    await dismissKnownOverlays(this.page);
    await roleFirst(this.page, 'link', /My Account/i).click();
  }

  async openLoginModalFromHeader(): Promise<void> {
    await this.openMyAccountMenu();

    const memberSignInButton = this.page.getByRole('button', { name: /Sign in to Account/i });
    const fallbackSignInLink = this.page.getByRole('link', { name: /SIGN IN/i }).first();
    const clicked =
      (await clickIfVisible(memberSignInButton)) || (await clickIfVisible(fallbackSignInLink));

    if (!clicked) {
      throw new Error('Unable to open sign-in modal from the header account menu.');
    }

    await expect(this.page.getByRole('heading', { name: /Sign In to your account/i })).toBeVisible();
  }

  async assertGuestSignInVisible(): Promise<void> {
    await this.openMyAccountMenu();
    const signInButton = this.page.getByRole('button', { name: /Sign in to Account/i });
    const signInLink = this.page.getByRole('link', { name: /SIGN IN/i }).first();
    const visible =
      (await signInButton.isVisible().catch(() => false)) ||
      (await signInLink.isVisible().catch(() => false));
    expect(visible).toBeTruthy();
  }
}
