import { type Locator, type Page } from '@playwright/test';

export const SELECTOR_POLICY = Object.freeze({
  order: ['role+accessible-name', 'label', 'text fallback'],
  guidance:
    'Prefer role-based selectors first, then label/text fallback only when needed for resilient UI automation.',
});

export function roleFirst(
  page: Page,
  role: Parameters<Page['getByRole']>[0],
  name: string | RegExp,
  fallbackText?: string | RegExp,
): Locator {
  const roleLocator = page.getByRole(role, { name });
  if (!fallbackText) {
    return roleLocator.first();
  }
  return roleLocator.or(page.getByText(fallbackText)).first();
}
