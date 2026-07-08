import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadMessageCount } from "@/app/messages/actions";

export default async function ProfessionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const role = session?.user?.role;
  const unreadCount =
    role === "PROFESSIONAL" && session?.user?.id
      ? await getUnreadMessageCount(session.user.id)
      : 0;

  return (
    <DashboardShell
      role={(role as "ADMIN" | "PROFESSIONAL") ?? "PROFESSIONAL"}
      userId={session?.user?.id}
      badge={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
