-- FinBag Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT NOT NULL DEFAULT 'IDR' CHECK (currency IN ('IDR', 'USD', 'EUR', 'SGD', 'MYR', 'THB', 'PHP', 'VND', 'JPY', 'CNY', 'AUD', 'GBP', 'CHF', 'CAD')),
    timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY')),
    language TEXT NOT NULL DEFAULT 'id' CHECK (language IN ('id', 'en')),
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wallets table
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet', 'credit_card', 'investment', 'other')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR' CHECK (currency IN ('IDR', 'USD', 'EUR', 'SGD', 'MYR', 'THB', 'PHP', 'VND', 'JPY', 'CNY', 'AUD', 'GBP', 'CHF', 'CAD')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    icon TEXT,
    color TEXT CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT,
    color TEXT CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    date DATE NOT NULL,
    note TEXT,
    recurring_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budgets table
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year BETWEEN 2020 AND 2100),
    alert_threshold INTEGER NOT NULL DEFAULT 80 CHECK (alert_threshold BETWEEN 1 AND 100),
    spent NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category_id, period, month, year)
);

-- Recurring Transactions table
CREATE TABLE public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_date DATE NOT NULL,
    note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exchange Rates table (for caching)
CREATE TABLE public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency TEXT NOT NULL CHECK (base_currency IN ('IDR', 'USD', 'EUR', 'SGD', 'MYR', 'THB', 'PHP', 'VND', 'JPY', 'CNY', 'AUD', 'GBP', 'CHF', 'CAD')),
    target_currency TEXT NOT NULL CHECK (target_currency IN ('IDR', 'USD', 'EUR', 'SGD', 'MYR', 'THB', 'PHP', 'VND', 'JPY', 'CNY', 'AUD', 'GBP', 'CHF', 'CAD')),
    rate NUMERIC(20, 10) NOT NULL CHECK (rate > 0),
    rate_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, rate_date)
);

-- Indexes for performance
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallets_user_default ON public.wallets(user_id, is_default) WHERE is_default = TRUE;

CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_user_type ON public.categories(user_id, type);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_wallet ON public.transactions(user_id, wallet_id);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX idx_transactions_recurring ON public.transactions(recurring_id) WHERE recurring_id IS NOT NULL;

CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_user_period ON public.budgets(user_id, period, month, year);

CREATE INDEX idx_recurring_user_id ON public.recurring_transactions(user_id);
CREATE INDEX idx_recurring_next_date ON public.recurring_transactions(next_date) WHERE is_active = TRUE;

CREATE INDEX idx_exchange_rates_lookup ON public.exchange_rates(base_currency, target_currency, rate_date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Wallets policies
CREATE POLICY "Users can view own wallets" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets" ON public.wallets
    FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Recurring Transactions policies
CREATE POLICY "Users can view own recurring" ON public.recurring_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring" ON public.recurring_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring" ON public.recurring_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring" ON public.recurring_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Exchange Rates policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view exchange rates" ON public.exchange_rates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON public.recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup (create default profile, wallets, categories)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_wallet_id UUID;
    default_category_income UUID;
    default_category_expense UUID;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, full_name, currency, timezone, date_format, language, theme)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'IDR',
        'Asia/Jakarta',
        'DD/MM/YYYY',
        'id',
        'system'
    );

    -- Create default wallet
    INSERT INTO public.wallets (user_id, name, type, balance, currency, is_default, icon, color)
    VALUES (NEW.id, 'Cash', 'cash', 0, 'IDR', TRUE, 'wallet', '#22c55e')
    RETURNING id INTO default_wallet_id;

    -- Create default income categories
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default, sort_order) VALUES
    (NEW.id, 'Salary', 'income', 'briefcase', '#22c55e', TRUE, 1),
    (NEW.id, 'Freelance', 'income', 'laptop', '#16a34a', TRUE, 2),
    (NEW.id, 'Investment', 'income', 'trending-up', '#15803d', TRUE, 3),
    (NEW.id, 'Gift', 'income', 'gift', '#166534', TRUE, 4),
    (NEW.id, 'Other Income', 'income', 'plus-circle', '#86efac', TRUE, 5);

    -- Create default expense categories
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default, sort_order) VALUES
    (NEW.id, 'Food & Dining', 'expense', 'utensils', '#ef4444', TRUE, 1),
    (NEW.id, 'Transportation', 'expense', 'car', '#dc2626', TRUE, 2),
    (NEW.id, 'Shopping', 'expense', 'shopping-bag', '#b91c1c', TRUE, 3),
    (NEW.id, 'Entertainment', 'expense', 'film', '#991b1b', TRUE, 4),
    (NEW.id, 'Bills & Utilities', 'expense', 'file-text', '#7f1d1d', TRUE, 5),
    (NEW.id, 'Healthcare', 'expense', 'heart-pulse', '#ef4444', TRUE, 6),
    (NEW.id, 'Education', 'expense', 'graduation-cap', '#dc2626', TRUE, 7),
    (NEW.id, 'Other Expense', 'expense', 'minus-circle', '#fca5a5', TRUE, 8);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update wallet balance after transaction
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'income' THEN
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old transaction
        IF OLD.type = 'income' THEN
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
        END IF;
        -- Apply new transaction
        IF NEW.type = 'income' THEN
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.type = 'income' THEN
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_wallet_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION public.update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.type = 'expense' THEN
        UPDATE public.budgets
        SET spent = spent + NEW.amount
        WHERE user_id = NEW.user_id
        AND category_id = NEW.category_id
        AND period = 'monthly'
        AND month = EXTRACT(MONTH FROM NEW.date)::INTEGER
        AND year = EXTRACT(YEAR FROM NEW.date)::INTEGER;
    ELSIF TG_OP = 'UPDATE' AND NEW.type = 'expense' THEN
        -- Reverse old
        IF OLD.category_id IS NOT NULL THEN
            UPDATE public.budgets
            SET spent = spent - OLD.amount
            WHERE user_id = OLD.user_id
            AND category_id = OLD.category_id
            AND period = 'monthly'
            AND month = EXTRACT(MONTH FROM OLD.date)::INTEGER
            AND year = EXTRACT(YEAR FROM OLD.date)::INTEGER;
        END IF;
        -- Apply new
        IF NEW.category_id IS NOT NULL THEN
            UPDATE public.budgets
            SET spent = spent + NEW.amount
            WHERE user_id = NEW.user_id
            AND category_id = NEW.category_id
            AND period = 'monthly'
            AND month = EXTRACT(MONTH FROM NEW.date)::INTEGER
            AND year = EXTRACT(YEAR FROM NEW.date)::INTEGER;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.type = 'expense' AND OLD.category_id IS NOT NULL THEN
        UPDATE public.budgets
        SET spent = spent - OLD.amount
        WHERE user_id = OLD.user_id
        AND category_id = OLD.category_id
        AND period = 'monthly'
        AND month = EXTRACT(MONTH FROM OLD.date)::INTEGER
        AND year = EXTRACT(YEAR FROM OLD.date)::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_budget_spent
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_budget_spent();

-- Dashboard Summary Function
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_user_id UUID, p_period TEXT DEFAULT 'month')
RETURNS JSONB AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    result JSONB;
BEGIN
    -- Calculate date range
    CASE p_period
        WHEN 'week' THEN
            start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
            end_date := (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE;
        WHEN 'month' THEN
            start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
            end_date := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
        WHEN 'year' THEN
            start_date := DATE_TRUNC('year', CURRENT_DATE)::DATE;
            end_date := (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE;
        ELSE
            start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
            end_date := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    END CASE;

    -- Build summary JSON
    SELECT jsonb_build_object(
        'total_income', COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        'total_expense', COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
        'balance', COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0),
        'income_by_category', (
            SELECT jsonb_agg(jsonb_build_object(
                'category_id', c.id,
                'category_name', c.name,
                'category_icon', c.icon,
                'category_color', c.color,
                'amount', SUM(t.amount),
                'percentage', ROUND(SUM(t.amount) * 100.0 / NULLIF(SUM(CASE WHEN t2.type = 'income' THEN t2.amount ELSE 0 END) OVER (), 0), 2)
            ))
            FROM public.transactions t
            JOIN public.categories c ON t.category_id = c.id
            JOIN public.transactions t2 ON t.user_id = t2.user_id AND t2.date BETWEEN start_date AND end_date AND t2.type = 'income'
            WHERE t.user_id = p_user_id
            AND t.date BETWEEN start_date AND end_date
            AND t.type = 'income'
            GROUP BY c.id, c.name, c.icon, c.color
        ),
        'expense_by_category', (
            SELECT jsonb_agg(jsonb_build_object(
                'category_id', c.id,
                'category_name', c.name,
                'category_icon', c.icon,
                'category_color', c.color,
                'amount', SUM(t.amount),
                'percentage', ROUND(SUM(t.amount) * 100.0 / NULLIF(SUM(CASE WHEN t2.type = 'expense' THEN t2.amount ELSE 0 END) OVER (), 0), 2)
            ))
            FROM public.transactions t
            JOIN public.categories c ON t.category_id = c.id
            JOIN public.transactions t2 ON t.user_id = t2.user_id AND t2.date BETWEEN start_date AND end_date AND t2.type = 'expense'
            WHERE t.user_id = p_user_id
            AND t.date BETWEEN start_date AND end_date
            AND t.type = 'expense'
            GROUP BY c.id, c.name, c.icon, c.color
        ),
        'income_by_wallet', (
            SELECT jsonb_agg(jsonb_build_object(
                'wallet_id', w.id,
                'wallet_name', w.name,
                'wallet_type', w.type,
                'amount', SUM(t.amount)
            ))
            FROM public.transactions t
            JOIN public.wallets w ON t.wallet_id = w.id
            WHERE t.user_id = p_user_id
            AND t.date BETWEEN start_date AND end_date
            AND t.type = 'income'
            GROUP BY w.id, w.name, w.type
        ),
        'expense_by_wallet', (
            SELECT jsonb_agg(jsonb_build_object(
                'wallet_id', w.id,
                'wallet_name', w.name,
                'wallet_type', w.type,
                'amount', SUM(t.amount)
            ))
            FROM public.transactions t
            JOIN public.wallets w ON t.wallet_id = w.id
            WHERE t.user_id = p_user_id
            AND t.date BETWEEN start_date AND end_date
            AND t.type = 'expense'
            GROUP BY w.id, w.name, w.type
        ),
        'monthly_trend', (
            SELECT jsonb_agg(jsonb_build_object(
                'month', TO_CHAR(d, 'YYYY-MM'),
                'income', COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0),
                'expense', COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0),
                'balance', COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0)
            ))
            FROM generate_series(
                (CURRENT_DATE - INTERVAL '11 months')::DATE,
                CURRENT_DATE,
                INTERVAL '1 month'
            ) d
            LEFT JOIN public.transactions t
                ON t.user_id = p_user_id
                AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', d)
            GROUP BY d
            ORDER BY d
        ),
        'recent_transactions', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', t.id,
                'wallet_id', t.wallet_id,
                'category_id', t.category_id,
                'amount', t.amount,
                'type', t.type,
                'date', t.date,
                'note', t.note,
                'created_at', t.created_at,
                'wallet', jsonb_build_object('id', w.id, 'name', w.name, 'type', w.type),
                'category', jsonb_build_object('id', c.id, 'name', c.name, 'icon', c.icon, 'color', c.color)
            ))
            FROM public.transactions t
            LEFT JOIN public.wallets w ON t.wallet_id = w.id
            LEFT JOIN public.categories c ON t.category_id = c.id
            WHERE t.user_id = p_user_id
            ORDER BY t.date DESC, t.created_at DESC
            LIMIT 10
        ),
        'upcoming_recurring', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', rt.id,
                'wallet_id', rt.wallet_id,
                'category_id', rt.category_id,
                'amount', rt.amount,
                'type', rt.type,
                'frequency', rt.frequency,
                'next_date', rt.next_date,
                'note', rt.note,
                'is_active', rt.is_active,
                'wallet', jsonb_build_object('id', w.id, 'name', w.name, 'type', w.type),
                'category', jsonb_build_object('id', c.id, 'name', c.name, 'icon', c.icon, 'color', c.color)
            ))
            FROM public.recurring_transactions rt
            LEFT JOIN public.wallets w ON rt.wallet_id = w.id
            LEFT JOIN public.categories c ON rt.category_id = c.id
            WHERE rt.user_id = p_user_id
            AND rt.is_active = TRUE
            AND rt.next_date >= CURRENT_DATE
            ORDER BY rt.next_date ASC
            LIMIT 5
        ),
        'budget_alerts', (
            SELECT jsonb_agg(jsonb_build_object(
                'budget_id', b.id,
                'category_name', c.name,
                'budget_amount', b.amount,
                'spent_amount', b.spent,
                'percentage', ROUND(b.spent * 100.0 / NULLIF(b.amount, 0), 2),
                'is_over', b.spent >= b.amount
            ))
            FROM public.budgets b
            JOIN public.categories c ON b.category_id = c.id
            WHERE b.user_id = p_user_id
            AND b.period = 'monthly'
            AND b.month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
            AND b.year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
            AND b.spent > 0
            AND (b.spent >= b.amount OR b.spent >= b.amount * b.alert_threshold / 100)
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_transactions;