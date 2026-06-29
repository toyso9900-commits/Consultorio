"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export function LoginRedirectClient() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const { dictionary } = useI18n();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      router.replace(
        role === "ADMIN" || role === "PROFESSIONAL"
          ? "/profesional/dashboard"
          : "/paciente/dashboard"
      );
    }
  }, [status, session, router]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">
        {dictionary.auth.loggingIn}
      </p>
      {status === "unauthenticated" && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {dictionary.auth.noSession}
          </p>
          <a
            href="/login"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            {dictionary.auth.backToLogin}
          </a>
        </div>
      )}
    </div>
  );
}
