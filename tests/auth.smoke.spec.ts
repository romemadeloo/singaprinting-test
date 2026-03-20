import { assertAuthenticatedByOrdersPage, loginAsMember } from '../src/flows/login.flow';
import { getAuthCredentials, hasAuthCredentials } from '../src/utils/env';
import { test } from '../src/fixtures/test-fixtures';

test.describe('Authentication Smoke', () => {
  test('P0 @smoke @auth @ui @prod-safe login modal renders member flow controls', async ({
    guestSession,
  }) => {
    await guestSession.homePage.goto();
    await guestSession.homePage.openLoginModalFromHeader();
    await guestSession.authModalPage.assertMemberLoginFormVisible();
  });

  test('P0 @smoke @auth @ui @prod-safe invalid login does not establish authenticated session', async ({
    guestSession,
  }) => {
    await guestSession.homePage.goto();
    await guestSession.homePage.openLoginModalFromHeader();
    await guestSession.authModalPage.assertMemberLoginFormVisible();

    await guestSession.authModalPage.login(
      `invalid-${Date.now()}@example.com`,
      'wrong-password-do-not-use',
    );
    await guestSession.authModalPage.assertNotAuthenticated();
  });

  test('P0 @smoke @auth @ui @prod-safe valid login via env secrets establishes authenticated session', async ({
    guestSession,
  }) => {
    test.skip(!hasAuthCredentials(), 'E2E_USER_EMAIL and E2E_USER_PASSWORD are required for this test.');
    const credentials = getAuthCredentials();
    if (!credentials) {
      return;
    }

    await loginAsMember(guestSession.page, credentials.email, credentials.password);
    await assertAuthenticatedByOrdersPage(guestSession.page);
  });

  test('P0 @smoke @auth @ui @prod-safe authenticated user can open My Orders without app error', async ({
    authSession,
  }) => {
    test.skip(!hasAuthCredentials(), 'E2E_USER_EMAIL and E2E_USER_PASSWORD are required for this test.');
    await authSession.myOrdersPage.goto();
    await authSession.myOrdersPage.assertLoadedWithoutAppError();
  });

  test('P1 @smoke @auth @ui @prod-safe sign out returns the UI to guest state', async ({
    authSession,
  }) => {
    test.skip(!hasAuthCredentials(), 'E2E_USER_EMAIL and E2E_USER_PASSWORD are required for this test.');
    await authSession.myOrdersPage.goto();
    await authSession.myOrdersPage.signOut();
    await authSession.homePage.goto();
    await authSession.homePage.assertGuestSignInVisible();
  });
});
