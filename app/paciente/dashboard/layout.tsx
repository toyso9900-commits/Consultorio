import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Middleware guarantees this session exists; fall back to a safe empty shell
  // if for any reason auth() returns null during a client transition.
  return (
    <DashboardShell
      role="PATIENT"
      title="Panel del Paciente"
      subtitle="Gestioná tu salud y bienestar"
      name={session?.user?.name}
      image={session?.user?.image}
    >
      {children}
    </DashboardShell>
  );
}
