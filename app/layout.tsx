import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { Toaster } from "sonner";
import { authOptions } from "@/lib/auth";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consultorio - Salud y Bienestar",
  description:
    "Unifica tu expediente clínico y físico. Conecta con nutriólogos y entrenadores certificados.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
              >
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Consultorio
              </Link>
              <div className="flex items-center gap-4 text-sm font-medium">
                {session?.user ? (
                  <Link
                    href={
                      session.user.role === "PATIENT"
                        ? "/paciente/dashboard"
                        : "/profesional/dashboard"
                    }
                    className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    Mi panel
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/login"
                      className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-full bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </header>
          {children}
          <Toaster position="top-right" richColors />
          <footer className="mt-auto border-t border-slate-200 bg-white py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-6">
              <p>© {new Date().getFullYear()} Consultorio. Versión beta.</p>
              <p className="mt-1">
                Tu salud, nutrición y entrenamiento en un solo lugar.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
