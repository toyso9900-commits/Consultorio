import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadMessageCount } from "@/app/messages/actions";

export default async function ProfessionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const unreadCount = role === "PROFESSIONAL" && session?.user?.id
    ? await getUnreadMessageCount(session.user.id)
    : 0;

  return (
    <DashboardShell
      role={(role as "ADMIN" | "PROFESSIONAL") ?? "PROFESSIONAL"}
      title={isAdmin ? "Panel de Administración" : "Panel del Profesional"}
      subtitle={
        isAdmin
          ? "Gestión de profesionales, validaciones y suscripciones"
          : "Gestioná tu perfil, citas y pacientes"
      }
      name={session?.user?.name}
      image={session?.user?.image}
      badge={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
