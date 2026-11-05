"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  locale: string;
  title?: string;
  description?: string;
}

export function AuthLayout({ children, locale, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 font-bold text-2xl mb-6">
            <span className="text-primary">FinBag</span>
          </Link>
          {title && (
            <>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="mt-2 text-muted-foreground">{description}</p>
              )}
            </>
          )}
        </div>
        <div className="bg-card rounded-lg border p-6 shadow-sm">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinBag. All rights reserved.
        </p>
      </div>
    </div>
  );
}