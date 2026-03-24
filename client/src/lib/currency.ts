export const CURRENCIES = {
  BWP: { symbol: 'P', label: 'BWP', name: 'Botswana Pula' },
  USD: { symbol: '$', label: 'USD', name: 'US Dollar' },
  ZIG: { symbol: 'Z$', label: 'ZIG', name: 'Zimbabwean Dollar (ZIG)' },
  ZAR: { symbol: 'R', label: 'ZAR', name: 'South African Rand' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatAmount(amount: number, currency: string = 'BWP'): string {
  const c = CURRENCIES[currency as CurrencyCode] || CURRENCIES.BWP;
  return `${c.symbol}${Number(amount).toFixed(2)}`;
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCIES[currency as CurrencyCode]?.symbol ?? 'P';
}
