import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadMessageCount } from "@/app/messages/actions";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function ProfessionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const unreadCount =
    role === "PROFESSIONAL" && session?.user?.id
      ? await getUnreadMessageCount(session.user.id)
      : 0;

  return (
    <DashboardShell
      role={(role as "ADMIN" | "PROFESSIONAL") ?? "PROFESSIONAL"}
      title={isAdmin ? dictionary.dashboard.adminTitle : dictionary.dashboard.professionalTitle}
      subtitle={
        isAdmin
          ? dictionary.dashboard.adminSubtitle
          : dictionary.dashboard.professionalSubtitle
      }
      name={session?.user?.name}
      image={session?.user?.image}
      badge={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
