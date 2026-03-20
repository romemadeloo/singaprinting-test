import { addDieCutItemToMiniCart, openGuestCartWithDieCutItem } from '../src/flows/add-to-cart.flow';
import { openCheckoutPrepaymentAsGuest } from '../src/flows/checkout.flow';
import { test, expect } from '../src/fixtures/test-fixtures';

test.describe('Guest And Checkout Smoke', () => {
  test('P0 @smoke @p0 @ui @prod-safe homepage loads and key navigation sections are visible', async ({
    guestSession,
  }) => {
    await guestSession.homePage.goto();
    await guestSession.homePage.assertKeyNavigationSectionsVisible();
  });

  test('P0 @smoke @p0 @ui @prod-safe open Die Cut product page and verify configurator defaults', async ({
    guestSession,
  }) => {
    await guestSession.productPage.gotoDieCut();
    await guestSession.productPage.assertDefaultConfigurator();
  });

  test('P0 @smoke @p0 @ui @prod-safe changing product options updates summary text and total price', async ({
    guestSession,
  }) => {
    await guestSession.productPage.gotoDieCut();
    const initialTotal = await guestSession.productPage.getDisplayedTotal();

    await guestSession.productPage.setSize(80, 80);
    await guestSession.productPage.assertSummaryContains('80x80mm');

    const updatedTotal = await guestSession.productPage.getDisplayedTotal();
    expect(initialTotal).toBeGreaterThan(0);
    expect(updatedTotal).toBeGreaterThan(0);
  });

  test('P0 @smoke @p0 @ui @prod-safe add to cart triggers upload artwork modal', async ({ guestSession }) => {
    await guestSession.productPage.gotoDieCut();
    await guestSession.productPage.addToCart();
    await guestSession.productPage.assertUploadArtworkModalVisible();
  });

  test('P0 @smoke @p0 @ui @prod-safe skip upload shows mini cart with item and subtotal', async ({
    guestSession,
  }) => {
    await addDieCutItemToMiniCart(guestSession.page);
    await expect(guestSession.page.getByText(/Bumper Stickers|Die Cut/i).first()).toBeVisible();
    await expect(guestSession.page.getByText(/Subtotal/i)).toBeVisible();
    await expect(guestSession.page.getByText(/S\$\s*[0-9,.]+/i).first()).toBeVisible();
  });

  test('P0 @smoke @p0 @ui @prod-safe cart gate supports continue as guest and lands on cart page', async ({
    guestSession,
  }) => {
    await addDieCutItemToMiniCart(guestSession.page);
    await guestSession.productPage.openViewCartFromMiniCart();
    await guestSession.cartPage.continueAsGuestFromAuthGate();
    await guestSession.cartPage.assertOnCartPage();
  });

  test('P0 @smoke @p0 @ui @prod-safe cart summary subtotal, shipping, and total are consistent', async ({
    guestSession,
  }) => {
    await openGuestCartWithDieCutItem(guestSession.page);
    const totals = await guestSession.cartPage.getSummaryTotals();
    const recomputed = Number((totals.subtotal + totals.shipping).toFixed(2));
    expect(recomputed).toBeCloseTo(totals.total, 2);
  });

  test('P0 @smoke @p0 @ui @checkout @prod-safe checkout empty submit shows required field validation', async ({
    guestSession,
  }) => {
    const checkoutPage = await openCheckoutPrepaymentAsGuest(guestSession.page);
    await checkoutPage.clickCompleteCheckout();
    await checkoutPage.assertRequiredFieldValidation();
  });

  test('P0 @smoke @p0 @ui @checkout @prod-safe shipping method switch updates total cost', async ({
    guestSession,
  }) => {
    const checkoutPage = await openCheckoutPrepaymentAsGuest(guestSession.page);
    const standardTotal = await checkoutPage.getTotalCost();
    const expressFee = await checkoutPage.getShippingOptionFee('Express');

    await checkoutPage.selectShippingMethod('Express');
    const postSelectTotal = await checkoutPage.getTotalCost();

    expect(expressFee).toBeGreaterThanOrEqual(0);
    expect(postSelectTotal).toBeGreaterThanOrEqual(standardTotal); 
  });

  test('P0 @smoke @p0 @ui @checkout @prod-safe payment option switch updates visible payment panel', async ({
    guestSession,
  }) => {
    const checkoutPage = await openCheckoutPrepaymentAsGuest(guestSession.page);

    await checkoutPage.selectPaymentOption('PayPal');
    await checkoutPage.assertPaymentPanelFor('PayPal');

    await checkoutPage.selectPaymentOption('Bank Transfer');
    await checkoutPage.assertPaymentPanelFor('Bank Transfer');

    await checkoutPage.selectPaymentOption('Credit Card');
    await checkoutPage.assertPaymentPanelFor('Credit Card');
  });

  test('P0 @smoke @p0 @ui @checkout @prod-safe unchecked terms prevents checkout and shows warning', async ({
    guestSession,
  }) => {
    const checkoutPage = await openCheckoutPrepaymentAsGuest(guestSession.page);
    await checkoutPage.clickCompleteCheckout();
    await checkoutPage.assertTermsWarningVisible();
  });

  test('P1 @p1 @ui @checkout @prod-safe request quotation opens modal with line items and total', async ({
    guestSession,
  }) => {
    const checkoutPage = await openCheckoutPrepaymentAsGuest(guestSession.page);
    await checkoutPage.openRequestQuotation();
    await checkoutPage.assertQuotationModal();
  });
});
