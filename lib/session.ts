import { cache } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const getSession = cache(auth);

type SessionWithUser = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
};

export async function requireSession(): Promise<SessionWithUser> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }
  return {
    user: {
      id: userId,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    },
  };
}

export async function requireRole(allowedRoles: string[]): Promise<SessionWithUser> {
  const session = await requireSession();
  if (!allowedRoles.includes(session.user.role ?? "")) {
    redirect("/login");
  }
  return session;
}
