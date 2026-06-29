import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  return (
    <DashboardShell
      role="PATIENT"
      title={dictionary.dashboard.patientTitle}
      subtitle={dictionary.dashboard.patientSubtitle}
      name={session?.user?.name}
      image={session?.user?.image}
    >
      {children}
    </DashboardShell>
  );
}
