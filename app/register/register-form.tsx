"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole =
    searchParams.get("rol") === "profesional" ? "PROFESIONAL" : "PATIENT";

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Registrate como paciente o profesional.
      </p>
      <form className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Rol
          </label>
          <select
            id="role"
            name="role"
            defaultValue={defaultRole}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="PATIENT">Paciente</option>
            <option value="PROFESIONAL">Profesional</option>
          </select>
        </div>
        <button
          type="submit"
          disabled
          className="w-full rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white opacity-60"
        >
          Registrarse (próximamente)
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-emerald-600">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
