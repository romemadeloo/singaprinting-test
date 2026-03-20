import type { Page } from '@playwright/test';

import { AuthModalPage } from '../pages/auth-modal.page';
import { HomePage } from '../pages/home.page';
import { MyOrdersPage } from '../pages/my-orders.page';

export async function loginAsMember(page: Page, email: string, password: string): Promise<void> {
  const homePage = new HomePage(page);
  const authModalPage = new AuthModalPage(page);

  await homePage.goto();
  await homePage.openLoginModalFromHeader();
  await authModalPage.assertMemberLoginFormVisible();
  await authModalPage.login(email, password);
}

export async function assertAuthenticatedByOrdersPage(page: Page): Promise<void> {
  const myOrdersPage = new MyOrdersPage(page);
  await myOrdersPage.goto();
  await myOrdersPage.assertLoadedWithoutAppError();
}

