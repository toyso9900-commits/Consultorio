import { auth } from "@/lib/auth";
import { MessageSquare } from "lucide-react";
import { getConversation, getUserConversations } from "@/app/messages/actions";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ConversationList } from "@/components/chat/conversation-list";
import { PresenceHeartbeat } from "@/components/chat/presence-heartbeat";
import { getUsersOnlineStatus, markUserOnline } from "@/lib/actions/presence";
import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n/server";

interface PageProps {
  searchParams: Promise<{ profesional?: string; nombre?: string }>;
}

export default async function PatientMessagesPage({ searchParams }: PageProps) {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const params = await searchParams;
  const professionalId = params.profesional;
  const professionalName = params.nombre || dictionary.patientMessages.defaultName;

  if (session?.user?.id) {
    await markUserOnline();
  }

  let initialMessages: { id: string; senderId: string; receiverId: string; content: string; createdAt: string; sender: { id: string; name: string | null; image: string | null } }[] = [];

  if (professionalId) {
    const result = await getConversation(session!.user.id ?? "", professionalId);
    if (result.success) {
      initialMessages = result.messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }));
    }
  }

  const conversationsResult = await getUserConversations(session!.user.id ?? "");
  const conversations =
    conversationsResult.success && "users" in conversationsResult
      ? conversationsResult.users
      : [];

  const onlineStatus = await getUsersOnlineStatus(conversations.map((c) => c.id));

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-rows-[auto_1fr] gap-6 lg:grid-cols-3 lg:grid-rows-1">
      <PresenceHeartbeat />
      <div className="flex h-full max-h-[40vh] flex-col rounded-2xl border border-border bg-card shadow-sm lg:col-span-1 lg:max-h-full lg:flex">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-rose-600" />
            <h2 className="font-semibold text-card-foreground">
              {dictionary.patientMessages.conversations}
            </h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ConversationList
            key={professionalId || "none"}
            initialConversations={conversations}
            currentUserId={session!.user.id ?? ""}
            selectedUserId={professionalId}
            hrefPrefix="/paciente/dashboard/mensajes"
            partnerParam="profesional"
            initialOnlineStatus={Object.fromEntries(onlineStatus)}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        {professionalId ? (
          <ChatPanel
            key={professionalId}
            initialMessages={initialMessages}
            professionalId={professionalId}
            professionalName={professionalName}
            patientId={session!.user.id ?? ""}
            counterpartImage={
              conversations.find((c) => c.id === professionalId)?.image ?? null
            }
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {dictionary.patientMessages.empty.split("{link}").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <Link
                      href="/paciente/dashboard/expertos"
                      className="text-primary hover:underline"
                    >
                      {dictionary.patientMessages.emptyLink}
                    </Link>
                  )}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
