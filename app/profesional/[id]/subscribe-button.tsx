"use client";

import { useTransition } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { subscribePatientToProfessional } from "@/app/paciente/dashboard/suscripcion/actions";
import { useI18n } from "@/lib/i18n/client";

interface SubscribeButtonProps {
  professionalId: string;
}

export function SubscribeButton({ professionalId }: SubscribeButtonProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (isPending) return;

    startTransition(async () => {
      const result = await subscribePatientToProfessional(professionalId);
      if (result.success) {
        toast.success(dictionary.patientSubscription.subscribeSuccess);
      } else {
        toast.error(
          result.error || dictionary.patientSubscription.subscribeError
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {isPending
        ? dictionary.patientSubscription.subscribing
        : dictionary.patientSubscription.subscribeCta}
    </button>
  );
}
