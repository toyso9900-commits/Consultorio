import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { getLocale, getDictionary } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
  };
}

const themeScript = `
  (function () {
    const saved = localStorage.getItem('consultorio-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = saved === 'dark' || (saved === 'system' && systemDark) || (!saved && systemDark) ? 'dark' : 'light';
    document.documentElement.classList.add(resolved);
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const currentYear = new Date().getFullYear();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <Providers locale={locale} dictionary={dictionary}>
          <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary"
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
                    className="text-muted-foreground hover:text-primary"
                  >
                    {dictionary.header.dashboard}
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/login"
                      className="text-muted-foreground hover:text-primary"
                    >
                      {dictionary.header.login}
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-full bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {dictionary.header.register}
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </header>
          {children}
          <Toaster position="top-right" richColors />
          <footer className="mt-auto border-t border-border bg-card py-10 text-center text-sm text-muted-foreground">
            <div className="mx-auto max-w-6xl px-6">
              <p>{dictionary.footer.copyright.replace("{year}", String(currentYear))}</p>
              <p className="mt-1">{dictionary.footer.tagline}</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
