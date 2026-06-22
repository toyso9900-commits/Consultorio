import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mx-auto mb-6 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-4">
        <div className="h-11 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-11 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-11 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-20 dark:bg-slate-950">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
