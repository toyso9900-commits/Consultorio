import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getApprovedProfessionals } from "@/lib/professionals-db";
import { PatientExpertsClient } from "./experts-client";

export default async function PatientExpertsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const professionals = await getApprovedProfessionals();

  return <PatientExpertsClient professionals={professionals} />;
}
