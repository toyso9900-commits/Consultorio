import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function AdminProfessionalsPage() {
  const session = await getSession();

  if (session?.user?.role !== "ADMIN") {
    redirect("/profesional/dashboard");
  }

  const locale = await getLocale(session.user.id);
  const dictionary = await getDictionary(locale);

  const professionals = await prisma.user.findMany({
    where: { role: "PROFESSIONAL" },
    include: { professionalProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <Users className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {dictionary.adminProfessionals.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.adminProfessionals.description}
          </p>
        </div>
      </div>

      {professionals.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.adminProfessionals.empty}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminProfessionals.nameHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminProfessionals.emailHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminProfessionals.specialtyHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminProfessionals.licenseHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminProfessionals.statusHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminProfessionals.modalityHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {professionals.map((professional) => {
                  const profile = professional.professionalProfile;
                  const status = profile?.rejectedAt
                    ? "rejected"
                    : profile?.isValidated
                    ? "validated"
                    : "pending";

                  return (
                    <tr key={professional.id}>
                      <td className="px-4 py-3 text-card-foreground">
                        {professional.name || dictionary.adminProfessionals.noName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {professional.email || dictionary.adminProfessionals.noEmail}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {profile?.specialty?.toLowerCase() || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {profile?.licenseNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            status === "validated"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : status === "rejected"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {dictionary.adminProfessionals[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {profile?.modality?.toLowerCase() || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
