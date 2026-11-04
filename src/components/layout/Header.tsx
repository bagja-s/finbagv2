"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  CreditCard,
  Tags,
  Target,
  Repeat,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "transactions", href: "/transactions", icon: CreditCard },
  { name: "wallets", href: "/wallets", icon: Tags },
  { name: "categories", href: "/categories", icon: Target },
  { name: "budgets", href: "/budgets", icon: Target },
  { name: "recurring", href: "/recurring", icon: Repeat },
  { name: "reports", href: "/reports", icon: BarChart3 },
];

export function Header({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">FinBag</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === `/${locale}${item.href}` ||
                (item.href !== "/dashboard" && pathname.startsWith(`/${locale}${item.href}`));
              return (
                <Link
                  key={item.name}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-md hover:bg-accent" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.["avatar_url"] || user?.user_metadata?.["picture"]} alt={user?.user_metadata?.["full_name"] || user?.email || "User"} />
                  <AvatarFallback>
                    {user?.user_metadata?.["full_name"]?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1">
                <p className="text-sm font-medium">{user?.user_metadata?.["full_name"] || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Separator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/settings`} className="flex items-center gap-2 w-full">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/settings`} className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}