import { auth } from "@/lib/auth";
import { getApprovedProfessionals } from "@/lib/professionals-db";
import { PatientExpertsClient } from "./experts-client";

export default async function PatientExpertsPage() {
  const session = await auth();

  const professionals = await getApprovedProfessionals();

  return <PatientExpertsClient professionals={professionals} />;
}
