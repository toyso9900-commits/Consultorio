import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserCircle, Briefcase, Leaf } from "lucide-react";
import { ProfessionalProfileForm } from "./profile-form";
import { FreePlanForm } from "./free-plan-form";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function ProfessionalProfilePage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const professional = await prisma.professionalProfile.findUnique({
    where: { userId: session!.user.id },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <UserCircle className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {dictionary.professionalProfile.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.professionalProfile.subtitle}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {dictionary.professionalProfile.professionalInfo}
            </h2>
          </div>

          <ProfessionalProfileForm
            userId={session!.user.id!}
            image={session!.user.image}
            defaultValues={{
              name: session!.user.name || "",
              title: professional?.title || "",
              bio: professional?.bio || "",
              location: professional?.location || "",
              modality: professional?.modality || "ONLINE",
              specialty: professional?.specialty || "NUTRITION",
              licenseNumber: professional?.licenseNumber || "",
              planPrice: professional?.planPrice?.toString() || "",
              planDuration: professional?.planDuration || "",
            }}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <Leaf className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {dictionary.professionalProfile.freePlanSection}
            </h2>
          </div>
          <FreePlanForm
            defaultValues={{
              freePlanTitle: professional?.freePlanTitle || "",
              freePlanContent: professional?.freePlanContent || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
