// Central currency formatting utilities
// Allows future extension: multi-currency, caching formatters, etc.

const VND_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

export function formatVnd(value: number): string {
  return VND_FORMATTER.format(value);
}

// Generic factory for other currencies later if needed
export function makeFormatter(locale: string, currency: string) {
  const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
  return (value: number) => fmt.format(value);
}

// Example future usage:
// const formatUsd = makeFormatter('en-US', 'USD');