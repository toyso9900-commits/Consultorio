"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "./actions";
import type { Dictionary } from "@/lib/i18n/server";

interface RegisterFormProps {
  dictionary: Dictionary;
}

export function RegisterForm({ dictionary }: RegisterFormProps) {
  const router = useRouter();
  const [role, setRole] = useState("PATIENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isProfessional = role === "PROFESSIONAL";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      licenseNumber?: string;
    } = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };

    if (payload.role === "PROFESSIONAL") {
      payload.licenseNumber = formData.get("licenseNumber") as string;
    }

    const result = await registerUser(payload);

    setLoading(false);

    if (!result.success) {
      setError(result.error || dictionary.auth.genericRegisterError);
      return;
    }

    if (payload.role === "PROFESSIONAL") {
      toast.custom(
        () => (
          <div className="pointer-events-auto flex w-full max-w-sm items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {dictionary.auth.registerSuccessTitle}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {dictionary.auth.registerSuccessMessage}
              </p>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: "top-right",
        }
      );

      setTimeout(() => {
        router.push("/login?registered=true");
      }, 3500);
      return;
    }

    router.push("/login?registered=true");
  }

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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {dictionary.auth.registerTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {dictionary.auth.registerSubtitle}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground"
          >
            {dictionary.auth.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
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
            placeholder={
              isProfessional
                ? "tu@consultorio-profesional.com"
                : "juan@ejemplo.com"
            }
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
            minLength={8}
            className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-foreground"
          >
            {dictionary.auth.accountType}
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="PATIENT">{dictionary.roles.patient}</option>
            <option value="PROFESSIONAL">{dictionary.roles.professional}</option>
          </select>
        </div>

        {isProfessional && (
          <div>
            <label
              htmlFor="licenseNumber"
              className="block text-sm font-medium text-foreground"
            >
              {dictionary.auth.licenseLabel}
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              required
              minLength={3}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={dictionary.auth.licensePlaceholder}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? dictionary.auth.registering : dictionary.auth.registerTitle}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {dictionary.auth.hasAccountPrompt}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {dictionary.auth.hasAccountLink}
        </Link>
      </p>
    </div>
  );
}
