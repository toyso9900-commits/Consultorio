import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { getLocale, getDictionary } from "@/lib/i18n/server";

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-muted" />
      <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="mx-auto mb-6 h-4 w-full animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default async function LoginPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-20">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm dictionary={dictionary} />
      </Suspense>
    </main>
  );
}
