import { assertAuthenticatedByOrdersPage, loginAsMember } from '../src/flows/login.flow';
import { getRequiredAuthCredentials } from '../src/utils/env';
import { test } from '../src/fixtures/test-fixtures';

test.describe('Authentication Smoke', () => {
  test('P0 @smoke @p0 @auth @ui @prod-safe login modal renders member flow controls', async ({
    guestSession,
  }) => {
    await guestSession.homePage.goto();
    await guestSession.homePage.openLoginModalFromHeader();
    await guestSession.authModalPage.assertMemberLoginFormVisible();
  });

  test('P0 @smoke @p0 @auth @ui @prod-safe invalid login does not establish authenticated session', async ({
    guestSession,
  }) => {
    await guestSession.homePage.goto();
    await guestSession.homePage.openLoginModalFromHeader();
    await guestSession.authModalPage.assertMemberLoginFormVisible();

    await guestSession.authModalPage.login(
      `invalid-${Date.now()}@example.com`,
      'wrong-password-do-not-use',
      { expectSuccess: false },
    );
    await guestSession.authModalPage.assertNotAuthenticated();
  });

  test('P0 @smoke @p0 @auth @ui @prod-safe valid login via env secrets establishes authenticated session', async ({
    guestSession,
  }) => {
    const credentials = getRequiredAuthCredentials();

    await loginAsMember(guestSession.page, credentials.email, credentials.password);
    await assertAuthenticatedByOrdersPage(guestSession.page);
  });

  test('P0 @smoke @p0 @auth @ui @prod-safe authenticated user can open My Orders without app error', async ({
    authSession,
  }) => {
    await authSession.myOrdersPage.goto();
    await authSession.myOrdersPage.assertLoadedWithoutAppError();
  });

  test('P1 @p1 @auth @ui @prod-safe sign out returns the UI to guest state', async ({
    authSession,
  }) => {
    await authSession.myOrdersPage.goto();
    await authSession.myOrdersPage.signOut();
    await authSession.homePage.goto();
    await authSession.homePage.assertGuestSignInVisible();
  });
});
