export function parseCurrencyToNumber(raw: string): number {
  const normalized = raw.replace(/[^0-9.]/g, '');
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) {
    throw new Error(`Unable to parse currency value from: "${raw}"`);
  }
  return amount;
}

export function firstCurrencyFromText(raw: string): number {
  const match = raw.match(/S\$\s*[0-9,.]+/i);
  if (!match) {
    throw new Error(`No currency amount found in text: "${raw}"`);
  }
  return parseCurrencyToNumber(match[0]);
}

