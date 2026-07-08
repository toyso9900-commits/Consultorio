import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BadgeCheck } from "lucide-react";
import { ValidationActions } from "@/components/admin/validation-actions";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function AdminValidationsPage() {
  const session = await getSession();

  if (session?.user?.role !== "ADMIN") {
    redirect("/profesional/dashboard");
  }

  const locale = await getLocale(session.user.id);
  const dictionary = await getDictionary(locale);

  const pendingProfessionals = await prisma.professionalProfile.findMany({
    where: { isValidated: false, rejectedAt: null },
    include: {
      user: { select: { id: true, email: true, name: true } },
      validations: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <BadgeCheck className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {dictionary.adminValidations.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.adminValidations.description}
          </p>
        </div>
      </div>

      {pendingProfessionals.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.adminValidations.empty}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminValidations.nameHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminValidations.emailHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminValidations.licenseHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminValidations.documentsHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminValidations.actionsHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingProfessionals.map((prof) => (
                  <tr key={prof.id}>
                    <td className="px-4 py-3 text-card-foreground">
                      {prof.user.name || dictionary.adminValidations.noName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {prof.user.email || dictionary.adminValidations.noEmail}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {prof.licenseNumber || dictionary.adminValidations.licenseNotRegistered}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {prof.validations.length} {dictionary.adminValidations.documentsLabel}
                    </td>
                    <td className="px-4 py-3">
                      <ValidationActions profileId={prof.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
