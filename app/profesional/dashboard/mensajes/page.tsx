import { auth } from "@/lib/auth";
import { MessageSquare } from "lucide-react";
import { getUserConversations, getConversation } from "@/app/messages/actions";
import { Suspense } from "react";
import ProfessionalChatPage from "./chat-page";
import { ConversationList } from "@/components/chat/conversation-list";
import { PresenceHeartbeat } from "@/components/chat/presence-heartbeat";
import { getUsersOnlineStatus } from "@/lib/actions/presence";
import { markUserOnline } from "@/lib/actions/presence";
import { getLocale, getDictionary } from "@/lib/i18n/server";

interface PageProps {
  searchParams: Promise<{ paciente?: string; nombre?: string }>;
}

export default async function ProfessionalMessagesPage({ searchParams }: PageProps) {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const params = await searchParams;
  const patientId = params.paciente;

  if (session?.user?.id) {
    await markUserOnline();
  }

  const conversationsResult = await getUserConversations(session!.user.id ?? "");
  const conversations =
    conversationsResult.success && "users" in conversationsResult
      ? conversationsResult.users
      : [];

  const onlineStatus = await getUsersOnlineStatus(conversations.map((c) => c.id));

  const initialMessagesPromise = patientId
    ? getConversation(session!.user.id ?? "", patientId)
    : Promise.resolve({ success: true, messages: [] });

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-rows-[auto_1fr] gap-6 lg:grid-cols-3 lg:grid-rows-1">
      <PresenceHeartbeat />
      <div className="flex h-full max-h-[40vh] flex-col rounded-2xl border border-border bg-card shadow-sm lg:col-span-1 lg:max-h-full lg:flex">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-rose-600" />
            <h2 className="font-semibold text-card-foreground">
              {dictionary.professionalMessages.conversations}
            </h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ConversationList
            key={patientId || "none"}
            initialConversations={conversations}
            currentUserId={session!.user.id ?? ""}
            selectedUserId={patientId}
            hrefPrefix="/profesional/dashboard/mensajes"
            partnerParam="paciente"
            initialOnlineStatus={Object.fromEntries(onlineStatus)}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-card">
              <p className="text-muted-foreground">
                {dictionary.professionalMessages.loading}
              </p>
            </div>
          }
        >
          <ProfessionalChatPage
            initialMessagesPromise={initialMessagesPromise}
            patientId={patientId ?? ""}
            patientName={params.nombre || dictionary.professionalMessages.defaultName}
            patientImage={
              conversations.find((c) => c.id === patientId)?.image ?? null
            }
          />
        </Suspense>
      </div>
    </div>
  );
}
