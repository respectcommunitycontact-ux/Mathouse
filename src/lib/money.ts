/**
 * Prices: most items are in Congolese francs (FC), a few are in US dollars.
 * The two currencies are never converted: totals are shown side by side,
 * e.g. "60 000 FC + 10 $".
 */
export type Currency = 'CDF' | 'USD';

export interface MoneyTotals {
  cdf: number;
  usd: number;
}

const group = (n: number, decimals = 0) =>
  n
    .toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: decimals })
    // Use a plain non-breaking space as thousands separator everywhere
    .replace(/[  ]/g, ' ');

export const formatMoney = (amount: number, currency: Currency = 'CDF') =>
  currency === 'USD' ? `${group(amount, 2)} $` : `${group(Math.round(amount))} FC`;

export const sumMoney = (lines: { price: number; quantity: number; currency?: Currency }[]): MoneyTotals =>
  lines.reduce<MoneyTotals>(
    (acc, l) => {
      if ((l.currency ?? 'CDF') === 'USD') acc.usd += l.price * l.quantity;
      else acc.cdf += l.price * l.quantity;
      return acc;
    },
    { cdf: 0, usd: 0 }
  );

export const formatTotals = (t: MoneyTotals) => {
  const parts: string[] = [];
  if (t.cdf > 0 || t.usd === 0) parts.push(formatMoney(t.cdf, 'CDF'));
  if (t.usd > 0) parts.push(formatMoney(t.usd, 'USD'));
  return parts.join(' + ');
};
