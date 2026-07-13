"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cancelPatientSubscription } from "./actions";
import { useI18n } from "@/lib/i18n/client";

interface CancelSubscriptionButtonProps {
  professionalId: string;
  disabled?: boolean;
}

export function CancelSubscriptionButton({
  professionalId,
  disabled,
}: CancelSubscriptionButtonProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (disabled || isPending) return;
    if (!window.confirm(dictionary.patientSubscription.cancelConfirm)) return;

    startTransition(async () => {
      const result = await cancelPatientSubscription(professionalId);
      if (result.success) {
        toast.success(dictionary.patientSubscription.cancelSuccess);
      } else {
        toast.error(result.error || dictionary.patientSubscription.cancelError);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className="inline-flex items-center gap-2 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
    >
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      {dictionary.patientSubscription.cancelCta}
    </button>
  );
}
