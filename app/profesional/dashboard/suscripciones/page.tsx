import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Crown } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function AdminSubscriptionsPage() {
  const session = await getSession();

  if (session?.user?.role !== "ADMIN") {
    redirect("/profesional/dashboard");
  }

  const locale = await getLocale(session.user.id);
  const dictionary = await getDictionary(locale);

  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
          <Crown className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {dictionary.adminSubscriptions.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.adminSubscriptions.description}
          </p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.adminSubscriptions.empty}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-semibold text-card-foreground">
                  {dictionary.adminSubscriptions.userHeader}
                </th>
                <th className="px-4 py-3 font-semibold text-card-foreground">
                  {dictionary.adminSubscriptions.planHeader}
                </th>
                <th className="px-4 py-3 font-semibold text-card-foreground">
                  {dictionary.adminSubscriptions.statusHeader}
                </th>
                <th className="px-4 py-3 font-semibold text-card-foreground">
                  {dictionary.adminSubscriptions.startedAtHeader}
                </th>
                <th className="px-4 py-3 font-semibold text-card-foreground">
                  {dictionary.adminSubscriptions.expiresAtHeader}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-card-foreground">
                      {subscription.user.name || dictionary.adminSubscriptions.noName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.user.email || dictionary.adminSubscriptions.noEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {subscription.plan.toLowerCase()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        subscription.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : subscription.status === "CANCELLED"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {subscription.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {subscription.startedAt.toLocaleDateString(locale)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {subscription.expiresAt
                      ? subscription.expiresAt.toLocaleDateString(locale)
                      : "—"}
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
