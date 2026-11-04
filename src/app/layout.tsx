import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinBag - Personal Finance Tracker",
    template: "%s | FinBag",
  },
  description: "Track your income, expenses, budgets, and financial goals with FinBag. Multi-currency support, recurring transactions, and detailed reports.",
  keywords: ["finance", "budget", "expense tracker", "personal finance", "money management"],
  authors: [{ name: "FinBag" }],
  creator: "FinBag",
  publisher: "FinBag",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://finbag.app",
    siteName: "FinBag",
    title: "FinBag - Personal Finance Tracker",
    description: "Track your income, expenses, budgets, and financial goals with FinBag.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FinBag Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinBag - Personal Finance Tracker",
    description: "Track your income, expenses, budgets, and financial goals with FinBag.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.frankfurter.dev" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}