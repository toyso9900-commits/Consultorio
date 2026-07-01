"use client";

import { signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { markUserOffline } from "@/lib/actions/presence";

interface UserAvatarMenuProps {
  name?: string | null;
  image?: string | null;
  role?: string | null;
}

export function UserAvatarMenu({ name, image, role }: UserAvatarMenuProps) {
  const { dictionary } = useI18n();

  async function handleSignOut() {
    await markUserOffline();
    await signOut({ callbackUrl: "/" });
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : role?.slice(0, 1).toUpperCase() || "U";

  const editProfileHref =
    role === "PATIENT"
      ? "/paciente/dashboard/perfil"
      : role === "PROFESSIONAL"
      ? "/profesional/dashboard/perfil"
      : null;

  const roleLabel =
    role === "PATIENT"
      ? dictionary.userMenu.rolePatient
      : role === "PROFESSIONAL"
      ? dictionary.userMenu.roleProfessional
      : role === "ADMIN"
      ? dictionary.userMenu.roleAdmin
      : dictionary.userMenu.user;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-transparent transition hover:ring-primary/30 focus:outline-none focus:ring-primary/50"
          aria-label={dictionary.userMenu.user}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name || dictionary.userMenu.user} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[14rem] rounded-xl border border-border bg-card p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-foreground">
              {name || dictionary.userMenu.user}
            </p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          {editProfileHref ? (
            <DropdownMenu.Item asChild>
              <Link
                href={editProfileHref}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted"
              >
                <UserCircle className="h-4 w-4" />
                {dictionary.userMenu.profile}
              </Link>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item asChild>
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none select-none"
              >
                <UserCircle className="h-4 w-4" />
                {dictionary.userMenu.profile}
              </button>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item asChild>
            <Link
              href="/configuracion"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted"
            >
              <Settings className="h-4 w-4" />
              {dictionary.userMenu.settings}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {dictionary.userMenu.logout}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
