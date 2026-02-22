type DemoLocale = "en-US" | "es-PR";

export function formatCurrency(amount: number, locale: DemoLocale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, locale: DemoLocale = "en-US"): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(dateStr: string, locale: DemoLocale = "en-US"): string {
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelative(dateStr: string, locale: DemoLocale = "en-US"): string {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  }
  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  }
  if (Math.abs(days) < 7) {
    return rtf.format(days, "day");
  }
  return formatDate(dateStr, locale);
}

export function calcTrustvibeFee(amount: number): number {
  if (amount < 1000) return Math.min(Math.round(amount * 0.10), 120);
  if (amount <= 5000) return Math.min(Math.round(amount * 0.07), 300);
  return Math.min(Math.round(amount * 0.04), 1500);
}

export function feeRate(amount: number): string {
  if (amount < 1000) return "10%";
  if (amount <= 5000) return "7%";
  return "4%";
}
