import { auth } from "@/lib/auth";
import { Users } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function AdminProfessionalsPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <Users className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dictionary.adminProfessionals.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.adminProfessionals.description}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          {dictionary.adminProfessionals.empty}
        </p>
      </div>
    </div>
  );
}
