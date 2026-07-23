import { auth } from "@/lib/auth";
import { Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProfessionalClients } from "@/lib/appointments";
import { getProgressPhotos } from "@/lib/progress-photos";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { PatientListCard } from "@/components/professional/patient-list-card";
import { PatientHealthSummary } from "@/components/professional/patient-health-summary";
import { PatientProgressGallery } from "@/components/professional/patient-progress-gallery";
import { PatientMealJournal } from "@/components/professional/patient-meal-journal";

type ClientMealEntry = {
  id: string;
  imageUrl: string | null;
  description: string;
  mealType: string;
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

  const clients = userId ? await getProfessionalClients(userId) : [];
  const selectedClient = patientId
    ? clients.find((client) => client.patientId === patientId)
    : undefined;

  const [progressPhotos, mealEntries, selectedHealth] = await Promise.all([
    selectedClient ? getProgressPhotos(selectedClient.patientId, 6) : [],
    selectedClient ? getClientMealEntries(selectedClient.patientId, 6) : [],
    selectedClient ? getSelectedPatientHealth(selectedClient.patientId) : null,
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

      {clients.length > 0 && !selectedClient && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <Camera className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {dictionary.professionalClients.selectClient}
            </p>
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PatientHealthSummary
            name={
              selectedClient.name || dictionary.professionalClients.noName
            }
            image={selectedClient.image}
            subscriptionStatus={selectedClient.subscriptionStatus}
            registrationDate={selectedHealth?.user.createdAt ?? new Date()}
            profile={selectedHealth?.profile ?? null}
            locale={locale}
            dictionary={dictionary.professionalClients}
            messageHref={`/profesional/dashboard/mensajes?paciente=${encodeURIComponent(
              selectedClient.patientId
            )}&nombre=${encodeURIComponent(
              selectedClient.name || dictionary.professionalClients.noName
            )}`}
            routineHref="/profesional/dashboard/rutinas"
          />

          <PatientProgressGallery
            photos={progressPhotos}
            locale={locale}
            dictionary={dictionary.professionalClients}
          />

          <PatientMealJournal
            meals={mealEntries}
            locale={locale}
            dictionary={dictionary}
          />
        </div>
      )}
    </div>
  );
}

type SelectedPatientHealth = {
  user: { createdAt: Date };
  profile: {
    weight: number | null;
    height: number | null;
    gender: string | null;
    birthDate: Date | null;
    allergies: string | null;
    restrictions: string | null;
    goals: string | null;
  } | null;
};

async function getSelectedPatientHealth(
  patientId: string
): Promise<SelectedPatientHealth> {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: patientId },
      select: { createdAt: true },
    }),
    prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: {
        weight: true,
        height: true,
        gender: true,
        birthDate: true,
        allergies: true,
        restrictions: true,
        goals: true,
      },
    }),
  ]);

  return {
    user: user ?? { createdAt: new Date() },
    profile,
  };
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
      mealType: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      consumedAt: true,
    },
  });
}
