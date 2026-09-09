export function formatCurrency(
  amount: number,
  currency: string = "IDR",
  locale: string = "id-ID"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number, locale: string = "id-ID"): string {
  return new Intl.NumberFormat(locale).format(amount);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
}

export function formatFileSize(bytes: number | string): string {
  const num = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!num || num === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(num) / Math.log(k)), sizes.length - 1);
  return `${(num / Math.pow(k, i)).toFixed(i <= 1 ? 0 : 1)} ${sizes[i]}`;
}