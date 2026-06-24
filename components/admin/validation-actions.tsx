"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import {
  validateProfessional,
  rejectProfessional,
} from "@/app/profesional/dashboard/actions";

interface ValidationActionsProps {
  profileId: string;
}

export function ValidationActions({ profileId }: ValidationActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleValidate(formData: FormData) {
    startTransition(async () => {
      const result = await validateProfessional(formData);
      if (result.success) {
        toast.success("Profesional aprobado");
      } else {
        toast.error(result.error || "No se pudo aprobar al profesional");
      }
    });
  }

  function handleReject(formData: FormData) {
    startTransition(async () => {
      const result = await rejectProfessional(formData);
      if (result.success) {
        toast.success("Profesional rechazado");
      } else {
        toast.error(result.error || "No se pudo rechazar al profesional");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <form action={handleValidate}>
        <input type="hidden" name="profileId" value={profileId} />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          <CheckCircle className="h-4 w-4" />
          Aceptar
        </button>
      </form>
      <form action={handleReject}>
        <input type="hidden" name="profileId" value={profileId} />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
        >
          <XCircle className="h-4 w-4" />
          Rechazar
        </button>
      </form>
    </div>
  );
}
