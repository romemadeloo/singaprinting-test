import {
  expect,
  type BrowserContext,
  type Page,
  test as base,
} from '@playwright/test';

import { loginAsMember } from '../flows/login.flow';
import { AuthModalPage } from '../pages/auth-modal.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { HomePage } from '../pages/home.page';
import { MyOrdersPage } from '../pages/my-orders.page';
import { ProductPage } from '../pages/product.page';
import { getAuthCredentials } from '../utils/env';

export type Session = {
  page: Page;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authModalPage: AuthModalPage;
  myOrdersPage: MyOrdersPage;
};

export type AuthSession = Session & {
  context: BrowserContext;
};

type TestFixtures = {
  guestSession: Session;
  authSession: AuthSession;
};

function createSession(page: Page): Session {
  return {
    page,
    homePage: new HomePage(page),
    productPage: new ProductPage(page),
    cartPage: new CartPage(page),
    checkoutPage: new CheckoutPage(page),
    authModalPage: new AuthModalPage(page),
    myOrdersPage: new MyOrdersPage(page),
  };
}

const antiBotInitScript = () => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
  });
};

export const test = base.extend<TestFixtures>({
  guestSession: async ({ page }, use) => {
    await page.addInitScript(antiBotInitScript);
    await use(createSession(page));
  },
  authSession: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({ baseURL });
    await context.addInitScript(antiBotInitScript);
    const page = await context.newPage();
    const session = createSession(page);
    const credentials = getAuthCredentials();

    if (credentials) {
      await loginAsMember(page, credentials.email, credentials.password);
    }

    await use({
      context,
      ...session,
    });

    await context.close();
  },
});

export { expect };
