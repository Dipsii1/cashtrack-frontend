import { format, formatDistanceToNow, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: string | Date, pattern: string = "dd MMM yyyy"): string {
  return format(typeof date === "string" ? parseISO(date) : date, pattern, { locale: id });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd MMM yyyy HH:mm");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(typeof date === "string" ? parseISO(date) : date, { addSuffix: true, locale: id });
}

export function getMonthRange(date: Date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function getWeekRange(date: Date = new Date()) {
  return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
}

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
}

export function isThisMonth(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function getFrequencyLabel(freq: string): string {
  const labels: Record<string, string> = {
    DAILY: "Harian",
    WEEKLY: "Mingguan",
    MONTHLY: "Bulanan",
    YEARLY: "Tahunan",
  };
  return labels[freq] ?? freq;
}

export function getBudgetPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    WEEKLY: "Mingguan",
    MONTHLY: "Bulanan",
    YEARLY: "Tahunan",
  };
  return labels[period] ?? period;
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    INCOME: "Pemasukan",
    EXPENSE: "Pengeluaran",
    TRANSFER: "Transfer",
  };
  return labels[type] ?? type;
}

export function getCategoryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    INCOME: "Pemasukan",
    EXPENSE: "Pengeluaran",
  };
  return labels[type] ?? type;
}