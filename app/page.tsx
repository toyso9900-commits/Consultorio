import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Users,
  ArrowRight,
  Search,
  Calendar,
  MessageCircle,
  Shield,
  FileText,
} from "lucide-react";
import { MOCK_PROFESSIONALS } from "@/lib/professionals";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function Home() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const topExperts = MOCK_PROFESSIONALS.filter((p) => p.isPremium).slice(0, 10);

  const features = [
    {
      icon: Search,
      ...dictionary.landing.features.findExperts,
    },
    {
      icon: Calendar,
      ...dictionary.landing.features.bookAppointments,
    },
    {
      icon: FileText,
      ...dictionary.landing.features.unifiedRecord,
    },
    {
      icon: MessageCircle,
      ...dictionary.landing.features.communicate,
    },
    {
      icon: Shield,
      ...dictionary.landing.features.verified,
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Heart className="h-4 w-4" />
                {dictionary.landing.badge}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {dictionary.landing.headline}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                {dictionary.landing.description}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  {dictionary.landing.register}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-8 text-base font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  {dictionary.landing.login}
                </Link>
              </div>
            </div>

            <div className="relative mx-auto max-w-md lg:max-w-full">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
                  alt={dictionary.meta.description}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-card/90 p-4 shadow-lg backdrop-blur">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {dictionary.landing.specialists}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dictionary.landing.specialistsLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {dictionary.landing.featuresTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {dictionary.landing.featuresDescription}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {dictionary.landing.expertsTitle}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {dictionary.landing.expertsDescription}
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {dictionary.landing.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topExperts.map((prof) => (
              <div
                key={prof.id}
                className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-48 w-full bg-muted">
                  <Image
                    src={prof.image}
                    alt={prof.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {dictionary.landing.featured}
                  </div>
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {prof.specialty}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-foreground">
                    {prof.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {prof.title}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    ${prof.price} MXN
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
