import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserCircle } from "lucide-react";
import { PatientProfileForm } from "./profile-form";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function PatientProfilePage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { image: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <UserCircle className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {dictionary.patientProfile.title}
            </h1>
            <p className="text-muted-foreground">
              {dictionary.patientProfile.subtitle}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <PatientProfileForm
          userId={session!.user.id!}
          image={user?.image}
          defaultValues={{
            name: session!.user.name || "",
            height: profile?.height?.toString() || "",
            weight: profile?.weight?.toString() || "",
            gender: profile?.gender || "male",
          }}
        />
      </div>
    </div>
  );
}
