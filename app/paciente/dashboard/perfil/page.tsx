import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserCircle } from "lucide-react";
import { PatientProfileForm } from "./profile-form";

export default async function PatientProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <UserCircle className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Editar perfil
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Actualizá tus datos personales.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <PatientProfileForm
          userId={session.user.id!}
          defaultValues={{
            name: session.user.name || "",
            height: profile?.height?.toString() || "",
            weight: profile?.weight?.toString() || "",
            gender: profile?.gender || "male",
          }}
        />
      </div>
    </div>
  );
}
