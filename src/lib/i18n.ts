export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

export const localeNames: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}