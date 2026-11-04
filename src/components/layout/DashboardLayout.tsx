"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils/helpers";

interface DashboardLayoutProps {
  children: ReactNode;
  locale: string;
}

export function DashboardLayout({ children, locale }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header locale={locale} />
      <div className="flex">
        <Sidebar locale={locale} />
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] p-4 lg:p-6 transition-all duration-200",
            "lg:ml-64"
          )}
        >
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}