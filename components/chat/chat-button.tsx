"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  professionalId: string;
  professionalName: string;
  label?: string;
  className?: string;
}

export function ChatButton({
  professionalId,
  professionalName,
  label = "Chat",
  className,
}: ChatButtonProps) {
  return (
    <Link
      href={`/paciente/dashboard/mensajes?profesional=${encodeURIComponent(
        professionalId
      )}&nombre=${encodeURIComponent(professionalName)}`}
      className={[
        "inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 sm:flex-none",
        className,
      ].join(" ")}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </Link>
  );
}
