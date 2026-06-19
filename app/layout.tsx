import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Consultorio
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link
                href="/guia-expertos"
                className="hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Guía de Expertos
              </Link>
              <Link
                href="/login"
                className="hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-foreground px-4 py-2 text-background hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Registrarse
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-auto border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
          © {new Date().getFullYear()} Consultorio. Beta.
        </footer>
      </body>
    </html>
  );
}
