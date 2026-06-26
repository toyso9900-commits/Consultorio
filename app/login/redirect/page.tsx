import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginRedirectClient } from "./login-redirect-client";

export default async function LoginRedirectPage() {
  const session = await auth();

  if (session?.user?.role) {
    const role = session.user.role;
    if (role === "ADMIN" || role === "PROFESSIONAL") {
      redirect("/profesional/dashboard");
    }
    redirect("/paciente/dashboard");
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <LoginRedirectClient />
    </div>
  );
}
