import { auth } from "@/lib/auth";
import { Shield } from "lucide-react";
import { getAllUsers } from "./actions";
import { UserActions } from "./user-actions";
import { AdminRealtimeListener } from "@/components/admin/admin-realtime-listener";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import type { Dictionary, Locale } from "@/lib/i18n/server";

function formatDate(date: Date | null | undefined, locale: Locale) {
  if (!date) return null;
  return new Date(date).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRole(role: string, dictionary: Dictionary) {
  switch (role) {
    case "ADMIN":
      return dictionary.roles.admin;
    case "PROFESSIONAL":
      return dictionary.roles.professional;
    case "PATIENT":
      return dictionary.roles.patient;
    default:
      return role;
  }
}

export default async function AdminUsersPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const result = await getAllUsers();
  const users = result.success && "users" in result ? result.users : [];

  return (
    <div className="space-y-6">
      <AdminRealtimeListener />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <Shield className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {dictionary.adminUsers.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.adminUsers.description}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.adminUsers.noUsers}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminUsers.nameHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminUsers.emailHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminUsers.roleHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminUsers.statusHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminUsers.registeredHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold text-card-foreground">
                    {dictionary.adminUsers.actionsHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isProfessional = user.role === "PROFESSIONAL";
                  const profile = user.professionalProfile;
                  const isValidated = profile?.isValidated ?? false;

                  return (
                    <tr key={user.id} className="hover:bg-muted">
                      <td className="px-4 py-3 font-medium text-card-foreground">
                        {user.name || dictionary.adminUsers.noName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.email || dictionary.adminUsers.noEmail}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {formatRole(user.role, dictionary)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isProfessional ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              isValidated
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {isValidated
                              ? dictionary.adminUsers.approved
                              : dictionary.adminUsers.pending}
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {dictionary.adminUsers.active}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(user.createdAt, locale) ||
                          dictionary.adminUsers.dateNotRegistered}
                      </td>
                      <td className="px-4 py-3">
                        <UserActions
                          userId={user.id}
                          profileId={profile?.id}
                          isValidated={isValidated}
                          role={user.role}
                        />
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
