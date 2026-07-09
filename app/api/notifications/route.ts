import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotifications(
    session.user.id,
    session.user.role as "ADMIN" | "PROFESSIONAL" | "PATIENT"
  );

  return NextResponse.json({ notifications });
}
