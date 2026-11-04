"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Wallet, Category, Transaction, Budget, RecurringTransaction, DashboardSummary } from "@/types/database";

const supabase = createClient();

// Generic fetcher with error handling
async function fetcher<T>(query: Promise<{ data: T | null; error: Error | null }>): Promise<T | null> {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Profile hooks
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  return { profile, loading, error, refetch: fetchProfile, updateProfile };
}

// Wallet hooks
export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setWallets(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const createWallet = async (wallet: Omit<Wallet, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("wallets")
      .insert({ ...wallet, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setWallets(prev => [data, ...prev]);
    return data;
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    const { data, error } = await supabase
      .from("wallets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setWallets(prev => prev.map(w => w.id === id ? data : w));
    return data;
  };

  const deleteWallet = async (id: string) => {
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) throw error;
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  return { wallets, loading, error, refetch: fetchWallets, createWallet, updateWallet, deleteWallet };
}

// Category hooks
export function useCategories(type?: "income" | "expense") {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (category: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("categories")
      .insert({ ...category, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setCategories(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setCategories(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return { categories, loading, error, refetch: fetchCategories, createCategory, updateCategory, deleteCategory };
}

// Transaction hooks
export function useTransactions(filters?: {
  type?: "all" | "income" | "expense" | "transfer";
  wallet_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("transactions")
        .select("*, wallet:wallets(*), category:categories(*)", { count: "exact" })
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters?.wallet_id) {
        query = query.eq("wallet_id", filters.wallet_id);
      }
      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters?.start_date) {
        query = query.gte("date", filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte("date", filters.end_date);
      }

      const page = filters?.page || 1;
      const pageSize = filters?.page_size || 20;
      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      setTransactions(data || []);
      setCount(count || 0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at" | "wallet" | "category" | "recurring">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...transaction, user_id: user.id })
      .select("*, wallet:wallets(*), category:categories(*)")
      .single();

    if (error) throw error;
    setTransactions(prev => [data, ...prev]);
    setCount(prev => prev + 1);
    return data;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select("*, wallet:wallets(*), category:categories(*)")
      .single();

    if (error) throw error;
    setTransactions(prev => prev.map(t => t.id === id ? data : t));
    return data;
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    setTransactions(prev => prev.filter(t => t.id !== id));
    setCount(prev => prev - 1);
  };

  return { transactions, count, loading, error, refetch: fetchTransactions, createTransaction, updateTransaction, deleteTransaction };
}

// Budget hooks
export function useBudgets(month?: number, year?: number) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("budgets")
        .select("*, category:categories(*)")
        .eq("user_id", user.id);

      if (month) query = query.eq("month", month);
      if (year) query = query.eq("year", year);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      setBudgets(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const createBudget = async (budget: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at" | "spent" | "category">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("budgets")
      .insert({ ...budget, user_id: user.id, spent: 0 })
      .select("*, category:categories(*)")
      .single();

    if (error) throw error;
    setBudgets(prev => [data, ...prev]);
    return data;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const { data, error } = await supabase
      .from("budgets")
      .update(updates)
      .eq("id", id)
      .select("*, category:categories(*)")
      .single();

    if (error) throw error;
    setBudgets(prev => prev.map(b => b.id === id ? data : b));
    return data;
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) throw error;
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  return { budgets, loading, error, refetch: fetchBudgets, createBudget, updateBudget, deleteBudget };
}

// Recurring Transaction hooks
export function useRecurringTransactions() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecurring = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*, wallet:wallets(*), category:categories(*)")
        .eq("user_id", user.id)
        .order("next_date", { ascending: true });

      if (error) throw error;
      setRecurring(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const createRecurring = async (recurringTx: Omit<RecurringTransaction, "id" | "user_id" | "created_at" | "updated_at" | "wallet" | "category">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("recurring_transactions")
      .insert({ ...recurringTx, user_id: user.id })
      .select("*, wallet:wallets(*), category:categories(*)")
      .single();

    if (error) throw error;
    setRecurring(prev => [...prev, data].sort((a, b) => new Date(a.next_date).getTime() - new Date(b.next_date).getTime()));
    return data;
  };

  const updateRecurring = async (id: string, updates: Partial<RecurringTransaction>) => {
    const { data, error } = await supabase
      .from("recurring_transactions")
      .update(updates)
      .eq("id", id)
      .select("*, wallet:wallets(*), category:categories(*)")
      .single();

    if (error) throw error;
    setRecurring(prev => prev.map(r => r.id === id ? data : r));
    return data;
  };

  const deleteRecurring = async (id: string) => {
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
    if (error) throw error;
    setRecurring(prev => prev.filter(r => r.id !== id));
  };

  return { recurring, loading, error, refetch: fetchRecurring, createRecurring, updateRecurring, deleteRecurring };
}

// Dashboard hook
export function useDashboardSummary(period: "week" | "month" | "year" = "month") {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc("get_dashboard_summary", {
        p_user_id: user.id,
        p_period: period,
      });

      if (error) throw error;
      setSummary(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}