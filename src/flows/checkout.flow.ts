import type { Page } from '@playwright/test';

import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ensureProductionSafeMode } from '../utils/env';
import { openGuestCartWithDieCutItem } from './add-to-cart.flow';

export async function openCheckoutPrepaymentAsGuest(page: Page): Promise<CheckoutPage> {
  ensureProductionSafeMode('openCheckoutPrepaymentAsGuest');

  const cartPage: CartPage = await openGuestCartWithDieCutItem(page);
  await cartPage.goToCheckout();

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.assertOnCheckoutPage();
  return checkoutPage;
}

