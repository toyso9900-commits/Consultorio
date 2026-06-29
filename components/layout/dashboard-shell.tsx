import { ReactNode } from "react";
import { Sidebar, UserRole } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";

interface DashboardShellProps {
  children: ReactNode;
  role: UserRole;
  title: string;
  subtitle?: string;
  name?: string | null;
  image?: string | null;
  badge?: number;
}

export function DashboardShell({
  children,
  role,
  title,
  subtitle,
  name,
  image,
  badge,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <Sidebar role={role} badge={badge} />
      <div className="flex min-h-screen flex-col">
        <DashboardHeader title={title} subtitle={subtitle} name={name} image={image} role={role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
