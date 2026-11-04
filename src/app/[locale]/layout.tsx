import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Toaster } from "@/hooks/useToast";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const locales = ["id", "en"] as const;

  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
        <Toaster />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}