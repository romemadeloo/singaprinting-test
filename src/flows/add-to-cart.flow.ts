import type { Page } from '@playwright/test';

import { CartPage } from '../pages/cart.page';
import { ProductPage } from '../pages/product.page';

export async function addDieCutItemToMiniCart(page: Page): Promise<ProductPage> {
  const productPage = new ProductPage(page);
  await productPage.gotoDieCut();
  await productPage.addToCart();
  await productPage.assertUploadArtworkModalVisible();
  await productPage.skipArtworkUpload();
  await productPage.assertMiniCartVisible();
  return productPage;
}

export async function openGuestCartWithDieCutItem(page: Page): Promise<CartPage> {
  const productPage = await addDieCutItemToMiniCart(page);
  await productPage.openViewCartFromMiniCart();

  const cartPage = new CartPage(page);
  await cartPage.continueAsGuestFromAuthGate();
  await cartPage.assertOnCartPage();
  return cartPage;
}

