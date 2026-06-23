import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function LoginRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "ADMIN" || role === "PROFESSIONAL") {
    redirect("/profesional/dashboard");
  }

  redirect("/paciente/dashboard");
}
