import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addDays, subDays, isSameMonth, isSameDay, isBefore, isAfter, differenceInDays, differenceInMonths, subWeeks } from "date-fns";
import { id, enUS } from "date-fns/locale";

export type Locale = "id" | "en";

export function getLocale(locale: Locale) {
  return locale === "id" ? id : enUS;
}

export function formatDateByLocale(
  date: string | Date,
  formatStr: string,
  locale: Locale = "id"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: getLocale(locale) });
}

export function formatDateLong(date: string | Date, locale: Locale = "id"): string {
  return formatDateByLocale(date, "d MMMM yyyy", locale);
}

export function formatDateShort(date: string | Date, locale: Locale = "id"): string {
  return formatDateByLocale(date, "dd/MM/yyyy", locale);
}

export function formatDateISO(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function formatMonthYear(date: string | Date, locale: Locale = "id"): string {
  return formatDateByLocale(date, "MMMM yyyy", locale);
}

export function formatTime(date: string | Date, locale: Locale = "id"): string {
  return formatDateByLocale(date, "HH:mm", locale);
}

export function formatDateTime(date: string | Date, locale: Locale = "id"): string {
  return formatDateByLocale(date, "dd/MM/yyyy HH:mm", locale);
}

export function getMonthStart(date: string | Date): Date {
  return startOfMonth(typeof date === "string" ? parseISO(date) : date);
}

export function getMonthEnd(date: string | Date): Date {
  return endOfMonth(typeof date === "string" ? parseISO(date) : date);
}

export function getWeekStart(date: string | Date): Date {
  return startOfWeek(typeof date === "string" ? parseISO(date) : date, { weekStartsOn: 1 });
}

export function getWeekEnd(date: string | Date): Date {
  return endOfWeek(typeof date === "string" ? parseISO(date) : date, { weekStartsOn: 1 });
}

export function addMonthsToDate(date: string | Date, months: number): Date {
  return addMonths(typeof date === "string" ? parseISO(date) : date, months);
}

export function subMonthsFromDate(date: string | Date, months: number): Date {
  return subMonths(typeof date === "string" ? parseISO(date) : date, months);
}

export function addDaysToDate(date: string | Date, days: number): Date {
  return addDays(typeof date === "string" ? parseISO(date) : date, days);
}

export function subDaysFromDate(date: string | Date, days: number): Date {
  return subDays(typeof date === "string" ? parseISO(date) : date, days);
}

export function isDateInMonth(date: string | Date, monthDate: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  const m = typeof monthDate === "string" ? parseISO(monthDate) : monthDate;
  return isSameMonth(d, m);
}

export function isDateInWeek(date: string | Date, weekDate: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  const w = typeof weekDate === "string" ? parseISO(weekDate) : weekDate;
  return isSameDay(getWeekStart(d), getWeekStart(w));
}

export function getDaysInMonth(date: string | Date): number {
  const end = getMonthEnd(date);
  return end.getDate();
}

export function getMonthsBetween(start: string | Date, end: string | Date): number {
  return differenceInMonths(
    typeof end === "string" ? parseISO(end) : end,
    typeof start === "string" ? parseISO(start) : start
  );
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  return differenceInDays(
    typeof end === "string" ? parseISO(end) : end,
    typeof start === "string" ? parseISO(start) : start
  );
}

export function isDateBefore(date: string | Date, compareTo: string | Date): boolean {
  return isBefore(
    typeof date === "string" ? parseISO(date) : date,
    typeof compareTo === "string" ? parseISO(compareTo) : compareTo
  );
}

export function isDateAfter(date: string | Date, compareTo: string | Date): boolean {
  return isAfter(
    typeof date === "string" ? parseISO(date) : date,
    typeof compareTo === "string" ? parseISO(compareTo) : compareTo
  );
}

export function getDateRange(period: "week" | "month" | "year", baseDate: Date = new Date()): { start: Date; end: Date } {
  const date = new Date(baseDate);
  switch (period) {
    case "week":
      return { start: getWeekStart(date), end: getWeekEnd(date) };
    case "month":
      return { start: getMonthStart(date), end: getMonthEnd(date) };
    case "year":
      return {
        start: new Date(date.getFullYear(), 0, 1),
        end: new Date(date.getFullYear(), 11, 31),
      };
  }
}

export function generateMonthLabels(count: number, locale: Locale = "id"): string[] {
  const labels: string[] = [];
  const current = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = subMonths(current, i);
    labels.push(formatMonthYear(date, locale));
  }
  return labels;
}

export function generateWeekLabels(count: number, locale: Locale = "id"): string[] {
  const labels: string[] = [];
  const current = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = subWeeks(current, i);
    labels.push(`${formatDateShort(getWeekStart(date), locale)} - ${formatDateShort(getWeekEnd(date), locale)}`);
  }
  return labels;
}