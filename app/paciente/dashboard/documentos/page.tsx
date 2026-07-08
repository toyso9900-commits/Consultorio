import { auth } from "@/lib/auth";
import { FileText } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function PatientDocumentsPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
          <FileText className="h-5 w-5 text-teal-600" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {dictionary.patientDocuments.title}
            </h1>
            <p className="text-muted-foreground">
              {dictionary.patientDocuments.description}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {dictionary.patientDocuments.empty}
          </p>
        </div>
      </div>
  );
}
