import type { Currency } from "@/types/database";

const FRANKFURTER_API = process.env["FRANKFURTER_API_BASE"] || "https://api.frankfurter.dev/v1";

export interface ExchangeRateData {
  base: Currency;
  date: string;
  rates: Record<Currency, number>;
}

export interface HistoricalRateData {
  base: Currency;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<Currency, number>>;
}

// In-memory cache for exchange rates
const rateCache = new Map<string, { data: ExchangeRateData | HistoricalRateData; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchLatestRates(
  base: Currency = "IDR"
): Promise<ExchangeRateData> {
  const cacheKey = `latest-${base}`;
  const cached = rateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as ExchangeRateData;
  }

  try {
    const response = await fetch(`${FRANKFURTER_API}/latest?from=${base}`);
    if (!response.ok) throw new Error("Failed to fetch rates");

    const data = await response.json();
    rateCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return fallback rates (1:1)
    const dateStr = new Date().toISOString().split("T")[0] ?? "";
    return {
      base,
      date: dateStr,
      rates: { [base]: 1 } as Record<Currency, number>,
    };
  }
}

export async function fetchHistoricalRates(
  base: Currency,
  startDate: string,
  endDate: string
): Promise<HistoricalRateData> {
  const cacheKey = `historical-${base}-${startDate}-${endDate}`;
  const cached = rateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 24) {
    return cached.data as HistoricalRateData;
  }

  try {
    const response = await fetch(
      `${FRANKFURTER_API}/${startDate}..${endDate}?from=${base}`
    );
    if (!response.ok) throw new Error("Failed to fetch historical rates");

    const data = await response.json();
    rateCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Error fetching historical rates:", error);
    return {
      base,
      start_date: startDate,
      end_date: endDate,
      rates: {},
    };
  }
}

export async function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  date?: string
): Promise<number> {
  if (from === to) return amount;

  let rate: number;

  if (date) {
    // Use historical rate for specific date
    const historical = await fetchHistoricalRates(from, date, date);
    rate = historical.rates[date]?.[to] || 1;
  } else {
    // Use latest rate
    const latest = await fetchLatestRates(from);
    rate = latest.rates[to] || 1;
  }

  return amount * rate;
}

export async function convertToBaseCurrency(
  amount: number,
  from: Currency,
  baseCurrency: Currency,
  date?: string
): Promise<number> {
  return convertCurrency(amount, from, baseCurrency, date);
}

export function getSupportedCurrencies(): Currency[] {
  return [
    "IDR",
    "USD",
    "EUR",
    "SGD",
    "MYR",
    "THB",
    "PHP",
    "VND",
    "JPY",
    "CNY",
    "AUD",
    "GBP",
    "CHF",
    "CAD",
  ];
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    IDR: "Rp",
    USD: "$",
    EUR: "€",
    SGD: "S$",
    MYR: "RM",
    THB: "฿",
    PHP: "₱",
    VND: "₫",
    JPY: "¥",
    CNY: "¥",
    AUD: "A$",
    GBP: "£",
    CHF: "CHF",
    CAD: "C$",
  };
  return symbols[currency] || currency;
}

export function getCurrencyName(currency: Currency): string {
  const names: Record<Currency, string> = {
    IDR: "Indonesian Rupiah",
    USD: "US Dollar",
    EUR: "Euro",
    SGD: "Singapore Dollar",
    MYR: "Malaysian Ringgit",
    THB: "Thai Baht",
    PHP: "Philippine Peso",
    VND: "Vietnamese Dong",
    JPY: "Japanese Yen",
    CNY: "Chinese Yuan",
    AUD: "Australian Dollar",
    GBP: "British Pound",
    CHF: "Swiss Franc",
    CAD: "Canadian Dollar",
  };
  return names[currency] || currency;
}

export function formatCurrencyAmount(
  amount: number,
  currency: Currency,
  locale: string = "id-ID",
  showSymbol: boolean = true
): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "IDR" || currency === "VND" || currency === "JPY" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (showSymbol) return formatted;
  return formatted.replace(symbol, "").trim();
}

export function parseCurrencyInput(value: string, currency: Currency): number {
  // Remove currency symbol and formatting
  const cleaned = value
    .replace(new RegExp(`[${getCurrencySymbol(currency)}\\s,]`, "g"), "")
    .replace(/\./g, "");
  return parseFloat(cleaned) || 0;
}

// Format with dual currency display
export async function formatDualCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  locale: string = "id-ID",
  date?: string
): Promise<string> {
  const converted = await convertCurrency(amount, fromCurrency, toCurrency, date);
  const fromFormatted = formatCurrencyAmount(amount, fromCurrency, locale);
  const toFormatted = formatCurrencyAmount(converted, toCurrency, locale);
  return `${fromFormatted} (≈ ${toFormatted})`;
}