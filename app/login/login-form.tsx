"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/server";

interface LoginFormProps {
  dictionary: Dictionary;
}

export function LoginForm({ dictionary }: LoginFormProps) {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const authError = searchParams.get("error");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      callbackUrl: "/login/redirect",
    });
  }

  const errorMessage =
    authError === "CredentialsSignin"
      ? dictionary.auth.credentialsError
      : authError
      ? dictionary.auth.genericLoginError
      : "";

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-6 w-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {dictionary.auth.loginTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {dictionary.auth.loginSubtitle}
        </p>
      </div>

      {registered && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          {dictionary.auth.registeredSuccess}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            {dictionary.auth.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            {dictionary.auth.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? dictionary.auth.loggingIn : dictionary.auth.loginTitle}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {dictionary.auth.noAccountPrompt}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {dictionary.auth.noAccountLink}
        </Link>
      </p>
    </div>
  );
}
