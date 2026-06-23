"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "./actions";

export function RegisterForm() {
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
      setError(result.error || "Ocurrió un error al registrarte.");
      return;
    }

    if (payload.role === "PROFESSIONAL") {
      toast.custom(
        () => (
          <div className="pointer-events-auto flex w-full max-w-sm items-start gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-top-4 dark:border-indigo-900 dark:bg-slate-900 dark:shadow-indigo-950">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <svg
                className="h-5 w-5 text-indigo-600"
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
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Registro exitoso
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Un supervisor está revisando tu documentación. Recibirás un
                correo con la aceptación o negación de tu cuenta.
              </p>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: "top-right",
        }
      );

      // Give the user time to read the toast before redirecting to login.
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 3500);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <svg
            className="h-6 w-6 text-indigo-600"
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Registrate para acceder a la plataforma.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Tipo de cuenta
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="PATIENT">Paciente</option>
            <option value="PROFESSIONAL">Profesional</option>
          </select>
        </div>

        {isProfessional && (
          <div>
            <label
              htmlFor="licenseNumber"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Cédula profesional o certificación
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              required
              minLength={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ej. 12345678"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
