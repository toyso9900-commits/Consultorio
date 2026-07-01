import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const socketId = formData.get("socket_id") as string | null;
    const channelName = formData.get("channel_name") as string | null;

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      );
    }

    const allowedUserChannel = `private-user-${session.user.id}`;
    const allowedAdminChannel = "private-admin-updates";

    if (channelName !== allowedUserChannel && channelName !== allowedAdminChannel) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (channelName === allowedAdminChannel && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!pusherServer) {
      return NextResponse.json(
        { error: "Pusher is not configured" },
        { status: 503 }
      );
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
