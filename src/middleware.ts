import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { locales, defaultLocale, isValidLocale } from "@/lib/i18n";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Redirect root to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // If no locale in path, redirect to default locale
  if (!pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  // Extract locale from path
  const locale = pathname.split("/")[1] ?? defaultLocale;
  if (!isValidLocale(locale)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Check if path is public (auth pages)
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.includes(path));

  // If user is not logged in and trying to access protected route
  if (!session && !isPublicPath) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (session && isPublicPath && !pathname.includes("/auth/callback")) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};