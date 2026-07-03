"use client";

import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { useI18n } from "@/lib/i18n/client";

interface HeaderAuthProps {
  name?: string | null;
  image?: string | null;
  role?: "PATIENT" | "PROFESSIONAL" | "ADMIN" | string | null;
}

export function HeaderAuth({ name, image, role }: HeaderAuthProps) {
  const { dictionary } = useI18n();

  const roleLabel =
    role === "PATIENT"
      ? dictionary.userMenu.rolePatient
      : role === "PROFESSIONAL"
      ? dictionary.userMenu.roleProfessional
      : role === "ADMIN"
      ? dictionary.userMenu.roleAdmin
      : dictionary.userMenu.user;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden flex-col items-end md:flex">
        <span className="max-w-[12rem] truncate text-sm font-semibold text-foreground">
          {name || dictionary.userMenu.user}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {roleLabel}
        </span>
      </div>
      <UserAvatarMenu name={name} image={image} role={role} />
    </div>
  );
}
