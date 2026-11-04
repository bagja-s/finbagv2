import { z } from "zod";
import type { Currency, WalletType, CategoryType, TransactionType, BudgetPeriod, RecurrenceFrequency, DateFormat, Language, Theme } from "@/types/database";

// Base schemas
export const currencySchema = z.enum([
  "IDR", "USD", "EUR", "SGD", "MYR", "THB", "PHP", "VND", "JPY", "CNY", "AUD", "GBP", "CHF", "CAD"
]) as z.ZodType<Currency>;

export const walletTypeSchema = z.enum([
  "cash", "bank", "ewallet", "credit_card", "investment", "other"
]) as z.ZodType<WalletType>;

export const categoryTypeSchema = z.enum(["income", "expense"]) as z.ZodType<CategoryType>;

export const transactionTypeSchema = z.enum(["income", "expense", "transfer"]) as z.ZodType<TransactionType>;

export const budgetPeriodSchema = z.enum(["monthly", "weekly", "yearly"]) as z.ZodType<BudgetPeriod>;

export const recurrenceFrequencySchema = z.enum([
  "daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"
]) as z.ZodType<RecurrenceFrequency>;

export const dateFormatSchema = z.enum([
  "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD.MM.YYYY"
]) as z.ZodType<DateFormat>;

export const languageSchema = z.enum(["id", "en"]) as z.ZodType<Language>;

export const themeSchema = z.enum(["light", "dark", "system"]) as z.ZodType<Theme>;

// Form schemas
export const transactionFormSchema = z.object({
  wallet_id: z.string().uuid("Invalid wallet"),
  category_id: z.string().uuid("Invalid category").nullable(),
  amount: z.number().positive("Amount must be positive").max(999999999, "Amount too large"),
  type: transactionTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  note: z.string().max(500, "Note too long").optional(),
});

export const walletFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  type: walletTypeSchema,
  balance: z.number().min(0, "Balance cannot be negative").max(999999999, "Balance too large"),
  currency: currencySchema,
  is_default: z.boolean(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  type: categoryTypeSchema,
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  parent_id: z.string().uuid("Invalid parent category").nullable(),
});

export const budgetFormSchema = z.object({
  category_id: z.string().uuid("Invalid category"),
  amount: z.number().positive("Amount must be positive").max(999999999, "Amount too large"),
  period: budgetPeriodSchema,
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  alert_threshold: z.number().min(1).max(100).default(80),
});

export const recurringTransactionFormSchema = z.object({
  wallet_id: z.string().uuid("Invalid wallet"),
  category_id: z.string().uuid("Invalid category").nullable(),
  amount: z.number().positive("Amount must be positive").max(999999999, "Amount too large"),
  type: transactionTypeSchema,
  frequency: recurrenceFrequencySchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable(),
  note: z.string().max(500, "Note too long").optional(),
}).refine(
  (data) => !data.end_date || data.start_date <= data.end_date,
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
);

export const profileFormSchema = z.object({
  full_name: z.string().max(100, "Name too long").optional(),
  avatar_url: z.string().url("Invalid URL").nullable().optional(),
  currency: currencySchema,
  timezone: z.string().min(1, "Timezone is required"),
  date_format: dateFormatSchema,
  language: languageSchema,
  theme: themeSchema,
});

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  full_name: z.string().min(1, "Name is required").max(100, "Name too long"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

export const resetPasswordFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const updatePasswordFormSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

// Search and filter schemas
export const transactionFilterSchema = z.object({
  type: z.enum(["all", "income", "expense", "transfer"]).default("all"),
  wallet_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  page_size: z.number().min(1).max(100).default(20),
  sort_by: z.enum(["date", "amount", "created_at"]).default("date"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export const dashboardFilterSchema = z.object({
  period: z.enum(["week", "month", "year"]).default("month"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  wallet_ids: z.array(z.string().uuid()).optional(),
  category_ids: z.array(z.string().uuid()).optional(),
});

// Type exports
export type TransactionFormData = z.infer<typeof transactionFormSchema>;
export type WalletFormData = z.infer<typeof walletFormSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type BudgetFormData = z.infer<typeof budgetFormSchema>;
export type RecurringTransactionFormData = z.infer<typeof recurringTransactionFormSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordFormSchema>;
export type TransactionFilterData = z.infer<typeof transactionFilterSchema>;
export type DashboardFilterData = z.infer<typeof dashboardFilterSchema>;