import { auth } from "@/lib/auth";
import { Camera, Utensils } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getProfessionalClients } from "@/lib/appointments";
import { getProgressPhotos } from "@/lib/progress-photos";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { PatientListCard } from "@/components/professional/patient-list-card";

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
    <div className="space-y-8" data-role="professional">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
          {selectedClient
            ? dictionary.professionalClients.titleWithName.replace(
                "{name}",
                selectedClient.name || dictionary.professionalClients.noName
              )
            : dictionary.professionalClients.title}
        </h1>
        <p className="text-muted-foreground">
          {dictionary.professionalClients.description}
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.professionalClients.empty}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => {
            const isSelected = selectedClient?.patientId === client.patientId;
            const messageHref = `/profesional/dashboard/mensajes?paciente=${encodeURIComponent(
              client.patientId
            )}&nombre=${encodeURIComponent(client.name || "Paciente")}`;
            const recordsHref = `/profesional/dashboard/clientes?patient=${encodeURIComponent(
              client.patientId
            )}`;

            return (
              <PatientListCard
                key={client.patientId}
                client={client}
                locale={locale}
                dictionary={dictionary.professionalClients}
                isSelected={isSelected}
                recordsHref={recordsHref}
                messageHref={messageHref}
              />
            );
          })}
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
