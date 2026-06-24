import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  return (
    <DashboardShell
      role="PATIENT"
      title="Panel del Paciente"
      subtitle="Gestioná tu salud y bienestar"
      name={session.user.name}
      image={session.user.image}
    >
      {children}
    </DashboardShell>
  );
}
