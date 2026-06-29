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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <UserAvatarMenu name={name} image={image} role={role} />
    </header>
  );
}
