"use client";

import { UserAvatarMenu } from "@/components/user-avatar-menu";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  name?: string | null;
  image?: string | null;
  role?: string | null;
}

export function DashboardHeader({
  title,
  subtitle,
  name,
  image,
  role,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      <UserAvatarMenu name={name} image={image} role={role} />
    </header>
  );
}
