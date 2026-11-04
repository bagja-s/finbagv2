/**
 * Database types generated from Supabase schema
 * Run `pnpm supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts`
 * to regenerate after schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: Currency;
  timezone: string;
  date_format: DateFormat;
  language: Language;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export type Currency =
  | "IDR"
  | "USD"
  | "EUR"
  | "SGD"
  | "MYR"
  | "THB"
  | "PHP"
  | "VND"
  | "JPY"
  | "CNY"
  | "AUD"
  | "GBP"
  | "CHF"
  | "CAD";

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "DD.MM.YYYY";
export type Language = "id" | "en";
export type Theme = "light" | "dark" | "system";

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: Currency;
  is_default: boolean;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export type WalletType = "cash" | "bank" | "ewallet" | "credit_card" | "investment" | "other";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CategoryType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  date: string;
  note: string | null;
  recurring_id: string | null;
  created_at: string;
  updated_at: string;

  // Relations (populated via joins)
  wallet?: Wallet;
  category?: Category;
  recurring?: RecurringTransaction;
}

export type TransactionType = "income" | "expense" | "transfer";

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  month: number;
  year: number;
  alert_threshold: number;
  spent: number;
  created_at: string;
  updated_at: string;

  // Relations
  category?: Category;
}

export type BudgetPeriod = "monthly" | "weekly" | "yearly";

export interface RecurringTransaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date: string | null;
  next_date: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  wallet?: Wallet;
  category?: Category;
}

export type RecurrenceFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface ExchangeRate {
  id: string;
  base_currency: Currency;
  target_currency: Currency;
  rate: number;
  date: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Dashboard types
export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  income_by_category: CategoryAmount[];
  expense_by_category: CategoryAmount[];
  income_by_wallet: WalletAmount[];
  expense_by_wallet: WalletAmount[];
  monthly_trend: MonthlyTrend[];
  recent_transactions: Transaction[];
  upcoming_recurring: RecurringTransaction[];
  budget_alerts: BudgetAlert[];
}

export interface CategoryAmount {
  category_id: string;
  category_name: string;
  category_icon: string | null;
  category_color: string | null;
  amount: number;
  percentage: number;
}

export interface WalletAmount {
  wallet_id: string;
  wallet_name: string;
  wallet_type: WalletType;
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface BudgetAlert {
  budget_id: string;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  percentage: number;
  is_over: boolean;
}

// Form types
export interface TransactionFormData {
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  date: string;
  note: string;
}

export interface WalletFormData {
  name: string;
  type: WalletType;
  balance: number;
  currency: Currency;
  is_default: boolean;
  icon: string;
  color: string;
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parent_id: string | null;
}

export interface BudgetFormData {
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  month: number;
  year: number;
  alert_threshold: number;
}

export interface RecurringTransactionFormData {
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date: string | null;
  note: string;
}

export interface ProfileFormData {
  full_name: string;
  avatar_url: string | null;
  currency: Currency;
  timezone: string;
  date_format: DateFormat;
  language: Language;
  theme: Theme;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

// Settings
export interface UserSettings {
  profile: ProfileFormData;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  budget_alerts: boolean;
  recurring_reminders: boolean;
  weekly_summary: boolean;
  monthly_report: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
}

export interface PrivacySettings {
  analytics: boolean;
  crash_reporting: boolean;
}