import { auth } from "@/lib/auth";
import {
  Users,
  MessageSquare,
  CalendarDays,
  Crown,
  Camera,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getProfessionalClients } from "@/lib/appointments";
import { getProgressPhotos } from "@/lib/progress-photos";
import { getLocale, getDictionary } from "@/lib/i18n/server";

type ClientMealEntry = {
  id: string;
  imageUrl: string | null;
  description: string;
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  consumedAt: Date;
};

export default async function ProfessionalClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const userId = session?.user?.id;

  const query = await searchParams;
  const patientId =
    typeof query.patient === "string" ? query.patient : undefined;
  const activeTab = typeof query.tab === "string" ? query.tab : "photos";

  const clients = userId ? await getProfessionalClients(userId) : [];
  const selectedClient = patientId
    ? clients.find((client) => client.patientId === patientId)
    : undefined;

  const [progressPhotos, mealEntries] = await Promise.all([
    selectedClient ? getProgressPhotos(selectedClient.patientId, 12) : [],
    selectedClient ? getClientMealEntries(selectedClient.patientId, 20) : [],
  ]);

  return (
    <div className="space-y-6" data-role="professional">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <Users className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {dictionary.professionalClients.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.professionalClients.description}
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.professionalClients.empty}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {clients.map((client) => {
              const messageHref = `/profesional/dashboard/mensajes?paciente=${encodeURIComponent(
                client.patientId
              )}&nombre=${encodeURIComponent(client.name || "Paciente")}`;
              const recordsHref = `/profesional/dashboard/clientes?patient=${encodeURIComponent(
                client.patientId
              )}`;

              return (
                <li
                  key={client.patientId}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {client.image ? (
                        <Image
                          src={client.image}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (client.name || "P").slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {client.name || dictionary.professionalClients.noName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {client.lastAppointment
                            ? client.lastAppointment.toLocaleDateString(locale, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : dictionary.professionalClients.noAppointment}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            client.subscriptionStatus === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : client.subscriptionStatus === "expired"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Crown className="h-3 w-3" />
                          {client.subscriptionStatus === "active"
                            ? dictionary.professionalClients.activeSubscription
                            : client.subscriptionStatus === "expired"
                              ? dictionary.professionalClients.expiredSubscription
                              : dictionary.professionalClients.noActiveSubscription}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={recordsHref}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      <Camera className="h-4 w-4" />
                      {dictionary.professionalClients.viewData}
                    </Link>
                    <Link
                      href={messageHref}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {dictionary.professionalClients.message}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {clients.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {!selectedClient ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {dictionary.professionalClients.selectClient}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-card-foreground">
                  {selectedClient.name || dictionary.professionalClients.noName}
                </h2>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profesional/dashboard/clientes?patient=${encodeURIComponent(
                      selectedClient.patientId
                    )}&tab=photos`}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === "photos"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Camera className="h-4 w-4" />
                    {dictionary.professionalClients.progressPhotos}
                  </Link>
                  <Link
                    href={`/profesional/dashboard/clientes?patient=${encodeURIComponent(
                      selectedClient.patientId
                    )}&tab=meals`}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === "meals"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Utensils className="h-4 w-4" />
                    {dictionary.professionalClients.meals}
                  </Link>
                </div>
              </div>

              {activeTab === "meals" ? (
                mealEntries.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-muted text-center">
                    <Utensils className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {dictionary.professionalClients.noMeals}
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {mealEntries.map((meal) => (
                      <li
                        key={meal.id}
                        className="flex gap-3 rounded-xl bg-muted p-3"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
                          {meal.imageUrl ? (
                            <Image
                              src={meal.imageUrl}
                              alt=""
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Utensils className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {meal.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {meal.consumedAt.toLocaleDateString(locale, {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {meal.calories} {dictionary.nutrition.calories} ·{" "}
                            {dictionary.nutrition.protein}: {meal.proteinG ?? 0}g ·{" "}
                            {dictionary.nutrition.carbs}: {meal.carbsG ?? 0}g ·{" "}
                            {dictionary.nutrition.fat}: {meal.fatG ?? 0}g
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : progressPhotos.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-muted text-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {dictionary.professionalClients.noPhotos}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {progressPhotos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={photo.url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-center text-xs text-muted-foreground">
                        {photo.createdAt.toLocaleDateString(locale, {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

async function getClientMealEntries(
  patientId: string,
  limit = 20
): Promise<ClientMealEntry[]> {
  return prisma.mealEntry.findMany({
    where: { userId: patientId },
    orderBy: { consumedAt: "desc" },
    take: limit,
    select: {
      id: true,
      imageUrl: true,
      description: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      consumedAt: true,
    },
  });
}
