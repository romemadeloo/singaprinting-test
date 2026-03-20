# Functional-Only Release Test Plan

## Summary

- Visual hybrid checking is removed from the supported release strategy.
- Release signoff is based on production-safe `P0` functional coverage only.
- `P1` scenarios remain useful regression coverage but do not block release.
- Production coverage must stay non-transactional: no order completion, no payment submission, no artwork upload, and no account/profile mutation.

## Release-Blocking P0 Coverage

- Homepage loads and core navigation is visible.
- Die Cut product detail page opens and shows the default configurator state.
- Product option changes update the visible summary and total price.
- Add to cart opens the artwork decision step.
- Skip-artwork path shows the mini cart item and subtotal.
- Guest users can open cart and continue as guest.
- Cart subtotal, shipping, and total remain internally consistent.
- Checkout empty submit shows required field validation.
- Shipping method changes update the checkout total.
- Payment option changes update the visible payment panel.
- Terms enforcement blocks checkout progression.
- Login modal renders correctly.
- Invalid login does not create an authenticated session.
- Valid login succeeds with managed credentials.
- Authenticated users can open My Orders without application error.

## P1 Extended Regression Coverage

- Sign out returns the UI to guest state.
- Request quotation opens with expected line items and total.

## Release Rules

- `npm run test:smoke` is the release gate and covers functional `P0` smoke scenarios only.
- `npm run test:auth` remains the targeted auth lane and includes both `P0` and `P1` authenticated checks.
- `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` are required for authenticated release coverage; missing credentials are a release-readiness failure, not an acceptable skip.
- Overlay and modal stability is part of release readiness because it directly affects critical production journeys.
- `PRODUCTION_SAFE_MODE` must remain enabled for production execution.

## Supported Commands

- `npm run test:smoke`
- `npm run test:auth`
- `npm run test:e2e`
- `npm run allure:generate`
- `npm run allure:open`
