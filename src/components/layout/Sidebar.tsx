"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/helpers";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Tags,
  Target,
  Repeat,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { name: "transactions", href: "/transactions", icon: CreditCard, label: "Transactions" },
  { name: "wallets", href: "/wallets", icon: Wallet, label: "Wallets" },
  { name: "categories", href: "/categories", icon: Tags, label: "Categories" },
  { name: "budgets", href: "/budgets", icon: Target, label: "Budgets" },
  { name: "recurring", href: "/recurring", icon: Repeat, label: "Recurring" },
  { name: "reports", href: "/reports", icon: BarChart3, label: "Reports" },
  { name: "settings", href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="flex h-full flex-col px-2 py-4">
        <ul className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === `/${locale}${item.href}` ||
              (item.href !== "/dashboard" && pathname.startsWith(`/${locale}${item.href}`));

            return (
              <li key={item.name}>
                <Link
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    collapsed
                      ? "justify-center"
                      : "justify-start",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <Button
          variant="ghost"
          size="icon"
          className="mx-auto"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </nav>
    </aside>
  );
}