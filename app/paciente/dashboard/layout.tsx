import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <DashboardShell role="PATIENT" userId={session?.user?.id}>
      {children}
    </DashboardShell>
  );
}
