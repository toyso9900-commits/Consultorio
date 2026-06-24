"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, ShieldCheck, ShieldX } from "lucide-react";
import { deleteUser, toggleUserValidation } from "./actions";

interface UserActionsProps {
  userId: string;
  profileId?: string;
  isValidated?: boolean;
  role: string;
}

export function UserActions({ userId, profileId, isValidated, role }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success("Usuario eliminado");
      } else {
        toast.error(result.error || "No se pudo eliminar el usuario");
      }
    });
  }

  function handleToggleValidation() {
    if (!profileId) return;

    startTransition(async () => {
      const result = await toggleUserValidation(profileId, !isValidated);
      if (result.success) {
        toast.success(isValidated ? "Usuario desvalidado" : "Usuario validado");
      } else {
        toast.error(result.error || "No se pudo actualizar el estado");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {role === "PROFESSIONAL" && profileId && (
        <button
          type="button"
          onClick={handleToggleValidation}
          disabled={isPending}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            isValidated
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
          }`}
        >
          {isValidated ? (
            <>
              <ShieldX className="h-3.5 w-3.5" />
              Desvalidar
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              Validar
            </>
          )}
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Eliminar
      </button>
    </div>
  );
}
