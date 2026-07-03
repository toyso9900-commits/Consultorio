import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <DashboardShell
      role="PATIENT"
      name={session?.user?.name}
      image={session?.user?.image}
    >
      {children}
    </DashboardShell>
  );
}
