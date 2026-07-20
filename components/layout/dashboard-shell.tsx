"use client";

import { ReactNode, useState } from "react";
import { Sidebar, UserRole, MobileSidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { AppointmentsRealtimeListener } from "@/components/appointments/appointments-realtime-listener";

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

  return (
    <div className="min-h-screen bg-[#212121] lg:pl-64">
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
