import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const validLocale = locales.includes(locale as typeof locales[number]) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});