"use client";

import { signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface UserAvatarMenuProps {
  name?: string | null;
  image?: string | null;
  role?: string | null;
}

export function UserAvatarMenu({ name, image, role }: UserAvatarMenuProps) {
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

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 ring-2 ring-transparent transition hover:ring-indigo-300 focus:outline-none focus:ring-indigo-400 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:ring-indigo-800"
          aria-label="Menú de usuario"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name || "Usuario"} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[14rem] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {name || "Usuario"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {role === "PATIENT"
                ? "Paciente"
                : role === "PROFESSIONAL"
                ? "Profesional"
                : role === "ADMIN"
                ? "Administrador"
                : "Usuario"}
            </p>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-800" />

          {editProfileHref ? (
            <DropdownMenu.Item asChild>
              <Link
                href={editProfileHref}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
                Editar perfil
              </Link>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item asChild>
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 outline-none select-none"
              >
                <Settings className="h-4 w-4" />
                Editar perfil (próximamente)
              </button>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 outline-none transition-colors hover:bg-rose-50 focus:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950 dark:focus:bg-rose-950"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
