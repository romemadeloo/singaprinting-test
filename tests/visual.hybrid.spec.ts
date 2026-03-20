import { openGuestCartWithDieCutItem } from '../src/flows/add-to-cart.flow';
import { openCheckoutPrepaymentAsGuest } from '../src/flows/checkout.flow';
import { test } from '../src/fixtures/test-fixtures';
import { assertVisualSnapshot } from '../src/utils/visual';

test.describe('Hybrid Visual Baseline', () => {
  test('P0 @smoke @visual @hybrid @prod-safe visual baselines for home, PDP, cart, and checkout', async ({
    guestSession,
  }, testInfo) => {
    await guestSession.homePage.goto();
    await assertVisualSnapshot({
      testInfo,
      page: guestSession.page,
      name: 'homepage-hero',
      maskSelectors: ['text=Limited Time Offer', 'text=Roll Stickers & Labels'],
      maxDiffRatio: 0.02,
    });

    await guestSession.productPage.gotoDieCut();
    await assertVisualSnapshot({
      testInfo,
      page: guestSession.page,
      name: 'die-cut-configurator-panel',
      target: guestSession.page.locator('[role="complementary"]').first(),
      maskSelectors: ['text=To be dispatched around', 'text=/\\d{4}\\.\\d{2}\\.\\d{2}/'],
      maxDiffRatio: 0.02,
    });

    await openGuestCartWithDieCutItem(guestSession.page);
    await assertVisualSnapshot({
      testInfo,
      page: guestSession.page,
      name: 'cart-summary-panel',
      target: guestSession.page.locator('[role="complementary"]').first(),
      maxDiffRatio: 0.02,
    });

    await openCheckoutPrepaymentAsGuest(guestSession.page);
    await assertVisualSnapshot({
      testInfo,
      page: guestSession.page,
      name: 'checkout-summary-panel',
      target: guestSession.page.locator('[role="complementary"]').first(),
      maxDiffRatio: 0.02,
    });
  });
});
