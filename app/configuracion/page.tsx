import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/configuracion/language-selector";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const locale = await getLocale(userId);
  const dictionary = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {dictionary.settings.title}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {dictionary.settings.themeDescription}
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {dictionary.settings.appearance}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dictionary.settings.themeDescription}
            </p>
          </div>
          <ThemeToggle />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {dictionary.settings.language}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dictionary.settings.languageDescription}
            </p>
          </div>
          <LanguageSelector userId={userId} />
        </section>
      </div>
    </div>
  );
}
