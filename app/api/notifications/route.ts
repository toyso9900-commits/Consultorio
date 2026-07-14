import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
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

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationsReadAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
