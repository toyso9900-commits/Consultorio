import { Suspense } from "react";
import { RegisterForm } from "./register-form";

function RegisterFormSkeleton() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-2 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-8 space-y-4">
        <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
