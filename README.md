# SingaPrinting Functional E2E Suite

Production-safe end-to-end automation for `https://www.singaprinting.com` using:

- Playwright + TypeScript
- Allure reporting
- Functional UI coverage for release-critical user journeys

## Quick Start

```bash
npm install
npm run pw:install
```

Create `.env` from `.env.example`, then run:

```bash
npm run test:smoke
```

`npm run test:smoke` is the production release gate. It runs only `P0` functional smoke coverage and requires `E2E_USER_EMAIL` plus `E2E_USER_PASSWORD` so authenticated release checks cannot be skipped.

## Environment Variables

- `BASE_URL` (default: `https://www.singaprinting.com`)
- `PRODUCTION_SAFE_MODE` (default: `true`)
- `E2E_USER_EMAIL` (for authenticated tests)
- `E2E_USER_PASSWORD` (for authenticated tests)

## Useful Commands

- `npm run test:e2e`
- `npm run test:smoke`
- `npm run test:auth`
- `npm run allure:generate`
- `npm run allure:open`

See [PRODUCTION_TEST_PLAN.md](./PRODUCTION_TEST_PLAN.md) for the release coverage model and blocking rules.

## CI

GitHub Actions workflow:

- Runs Chromium `P0` functional smoke coverage on push and pull request
- Uploads `allure-results`, `playwright-report`, and `test-results` artifacts
