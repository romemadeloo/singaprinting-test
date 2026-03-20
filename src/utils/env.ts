export const BASE_URL = process.env.BASE_URL ?? 'https://www.singaprinting.com';

export const PRODUCTION_SAFE_MODE =
  (process.env.PRODUCTION_SAFE_MODE ?? 'true').toLowerCase() !== 'false';

export type AuthCredentials = {
  email: string;
  password: string;
};

export function getAuthCredentials(): AuthCredentials | null {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export function hasAuthCredentials(): boolean {
  return getAuthCredentials() !== null;
}

export function ensureProductionSafeMode(action: string): void {
  if (!PRODUCTION_SAFE_MODE) {
    throw new Error(
      `Blocked "${action}" because PRODUCTION_SAFE_MODE=false. ` +
        'Set PRODUCTION_SAFE_MODE=true for production-safe execution.',
    );
  }
}

