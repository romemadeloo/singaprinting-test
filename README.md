# SingaPrinting E2E Hybrid Suite

Production-safe end-to-end automation for `https://www.singaprinting.com` using:

- Playwright + TypeScript
- Allure reporting
- Hybrid UI + local visual baseline checks (pixel diff)

## Quick Start

```bash
npm install
npm run pw:install
```

Create `.env` from `.env.example`, then run:

```bash
npm run test:smoke
```

## Environment Variables

- `BASE_URL` (default: `https://www.singaprinting.com`)
- `PRODUCTION_SAFE_MODE` (default: `true`)
- `E2E_USER_EMAIL` (for authenticated tests)
- `E2E_USER_PASSWORD` (for authenticated tests)
- `UPDATE_VISUAL_BASELINE` (set `true` to refresh visual baselines)

## Useful Commands

- `npm run test:e2e`
- `npm run test:smoke`
- `npm run test:auth`
- `npm run test:visual`
- `npm run test:update-visual`
- `npm run allure:generate`
- `npm run allure:open`

## CI

GitHub Actions workflow:

- Runs Chromium smoke suite on push and pull request
- Uploads `allure-results`, `playwright-report`, and `test-results` artifacts

