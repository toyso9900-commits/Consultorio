"use client";

import { ReactNode, useState } from "react";
import { Sidebar, UserRole, MobileSidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { AppointmentsRealtimeListener } from "@/components/appointments/appointments-realtime-listener";

const shellBgByRole: Record<UserRole, string> = {
  ADMIN: "bg-background dark:bg-[#1C251F]",
  PROFESSIONAL: "bg-background dark:bg-stone-900",
  PATIENT: "bg-background dark:bg-stone-900",
};

interface DashboardShellProps {
  children: ReactNode;
  role: UserRole;
  title?: string;
  subtitle?: string;
  userId?: string;
  badge?: number;
}

export function DashboardShell({
  children,
  role,
  title,
  subtitle,
  userId,
  badge,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const bgClass = shellBgByRole[role];

  return (
    <div className={`min-h-screen lg:pl-64 ${bgClass}`}>
      {userId && <AppointmentsRealtimeListener userId={userId} />}
      <Sidebar role={role} badge={badge} />
      <MobileSidebar
        role={role}
        badge={badge}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-col">
        {title || subtitle ? (
          <DashboardHeader
            title={title}
            subtitle={subtitle}
            onMenuClick={() => setMobileOpen(true)}
          />
        ) : (
          <div className="lg:hidden">
            <DashboardHeader
              title={title}
              subtitle={subtitle}
              onMenuClick={() => setMobileOpen(true)}
            />
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
