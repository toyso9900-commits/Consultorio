"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, ShieldCheck, ShieldX } from "lucide-react";
import { deleteUser, toggleUserValidation } from "./actions";
import { useI18n } from "@/lib/i18n/client";

interface UserActionsProps {
  userId: string;
  profileId?: string;
  isValidated?: boolean;
  role: string;
}

export function UserActions({ userId, profileId, isValidated, role }: UserActionsProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(dictionary.userActions.deleteConfirm)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success(dictionary.userActions.userDeleted);
      } else {
        toast.error(result.error || dictionary.userActions.deleteError);
      }
    });
  }

  function handleToggleValidation() {
    if (!profileId) return;

    startTransition(async () => {
      const result = await toggleUserValidation(profileId, !isValidated);
      if (result.success) {
        toast.success(
          isValidated ? dictionary.userActions.invalidated : dictionary.userActions.validated
        );
      } else {
        toast.error(result.error || dictionary.userActions.statusError);
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
              {dictionary.userActions.invalidate}
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              {dictionary.userActions.validate}
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
        {dictionary.common.delete}
      </button>
    </div>
  );
}
