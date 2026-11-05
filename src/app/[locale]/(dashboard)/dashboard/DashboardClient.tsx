"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/lib/hooks/useData";
import { useWallets } from "@/lib/hooks/useData";
import { useTransactions } from "@/lib/hooks/useData";
import { formatCurrencyAmount } from "@/lib/utils/currency";
import { formatRelativeTime, cn } from "@/lib/utils/helpers";
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export function DashboardClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard");
  const { summary, loading: summaryLoading } = useDashboardSummary("month");
  const { wallets, loading: walletsLoading } = useWallets();
  const { transactions, loading: transactionsLoading } = useTransactions({ page_size: 5 });

  if (summaryLoading || walletsLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-20 animate-pulse" /></Card>
          ))}
        </div>
        <Card><CardContent className="h-64 animate-pulse" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("thisMonth")}</p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/transactions`}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addTransaction")}
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalBalance")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyAmount(summary?.balance || 0, "IDR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalIncome")}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              {formatCurrencyAmount(summary?.total_income || 0, "IDR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalExpense")}</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              {formatCurrencyAmount(summary?.total_expense || 0, "IDR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("balanceByWallet")}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallets?.length || 0} {t("wallets")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentTransactions")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/transactions`}>{t("viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {transactions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                <p>{t("noTransactions")}</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href={`/${locale}/transactions`}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addTransaction")}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions?.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-full", tx.type === "income" ? "bg-income/10" : "bg-expense/10")}>
                        {tx.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 text-income" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-expense" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.category?.name || t("noCategory")}</p>
                        <p className="text-sm text-muted-foreground">{tx.wallet?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-medium", tx.type === "income" ? "text-income" : "text-expense")}>
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrencyAmount(tx.amount, "IDR")}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("upcomingRecurring")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p>{t("noRecurring")}</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href={`/${locale}/recurring`}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addTransaction")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {summary?.budget_alerts && summary.budget_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-expense">{t("budgetAlerts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.budget_alerts.map((alert) => (
                <div key={alert.budget_id} className="flex items-center justify-between p-3 rounded-lg bg-expense/10">
                  <div>
                    <p className="font-medium">{alert.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrencyAmount(alert.spent_amount, "IDR")} / {formatCurrencyAmount(alert.budget_amount, "IDR")}
                      ({alert.percentage}%)
                    </p>
                  </div>
                  <span className={cn("px-2 py-1 rounded text-xs font-medium", alert.is_over ? "bg-expense text-expense-foreground" : "bg-warning text-warning-foreground")}>
                    {alert.is_over ? "Over Budget" : "Near Limit"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}