import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <DashboardLayout locale={locale}>
      <DashboardClient locale={locale} />
    </DashboardLayout>
  );
}