import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function ProfessionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL")) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <DashboardShell
      role={session.user.role as "ADMIN" | "PROFESSIONAL"}
      title={isAdmin ? "Panel de Administración" : "Panel del Profesional"}
      subtitle={
        isAdmin
          ? "Gestión de profesionales, validaciones y suscripciones"
          : "Gestioná tu perfil, citas y pacientes"
      }
      name={session.user.name}
      image={session.user.image}
    >
      {children}
    </DashboardShell>
  );
}
