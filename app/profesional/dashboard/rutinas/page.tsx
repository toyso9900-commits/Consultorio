import { redirect } from "next/navigation";
import { Dumbbell, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProfessionalClients } from "@/lib/appointments";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { RoutineEditor } from "./routine-editor";

export default async function ProfessionalRoutinesPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
    redirect("/login");
  }

  const professionalId = session.user.id;
  const locale = await getLocale(professionalId);
  const dictionary = await getDictionary(locale);
  const t = dictionary.professionalRoutines;

  const [clients, routines] = await Promise.all([
    getProfessionalClients(professionalId),
    prisma.routine.findMany({
      where: { professionalId },
      select: { patientId: true, title: true, content: true },
    }),
  ]);

  const routineByPatient = new Map(
    routines.map((routine) => [routine.patientId, routine])
  );

  return (
    <div className="space-y-6" data-role="professional">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Dumbbell className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">{t.empty}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {clients.map((client) => {
            const routine = routineByPatient.get(client.patientId);
            const canPublish = client.subscriptionStatus === "active";

            return (
              <li
                key={client.patientId}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {(client.name || "P").slice(0, 1).toUpperCase()}
                  </div>
                  <p className="font-medium text-card-foreground">
                    {client.name || dictionary.professionalClients.noName}
                  </p>
                </div>

                {canPublish ? (
                  <RoutineEditor
                    patientId={client.patientId}
                    initialTitle={routine?.title ?? ""}
                    initialContent={routine?.content ?? ""}
                  />
                ) : (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 shrink-0" />
                    {t.lockedRow}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
