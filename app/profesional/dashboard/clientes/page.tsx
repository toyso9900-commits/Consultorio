import { auth } from "@/lib/auth";
import { Users, MessageSquare, CalendarDays, Crown } from "lucide-react";
import Link from "next/link";
import { getProfessionalClients } from "@/lib/appointments";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function ProfessionalClientsPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const userId = session?.user?.id;

  const clients = userId ? await getProfessionalClients(userId) : [];

  return (
    <div className="space-y-6" data-role="professional">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <Users className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dictionary.professionalClients.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.professionalClients.description}
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.professionalClients.empty}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {clients.map((client) => {
              const messageHref = `/profesional/dashboard/mensajes?paciente=${encodeURIComponent(
                client.patientId
              )}&nombre=${encodeURIComponent(client.name || "Paciente")}`;

              return (
                <li
                  key={client.patientId}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {(client.name || "P").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {client.name || dictionary.professionalClients.noName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
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
                            client.hasActivePaidSubscription
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Crown className="h-3 w-3" />
                          {client.hasActivePaidSubscription
                            ? dictionary.professionalClients.activeSubscription
                            : dictionary.professionalClients.noActiveSubscription}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={messageHref}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {dictionary.professionalClients.message}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
