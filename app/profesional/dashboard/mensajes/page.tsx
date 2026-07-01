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
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-3">
      <PresenceHeartbeat />
      <div className="hidden flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-rose-600" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
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
            initialOnlineStatus={Object.fromEntries(onlineStatus)}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-400">
                {dictionary.professionalMessages.loading}
              </p>
            </div>
          }
        >
          <ProfessionalChatPage
            initialMessagesPromise={initialMessagesPromise}
            patientId={patientId ?? ""}
            patientName={params.nombre || dictionary.professionalMessages.defaultName}
          />
        </Suspense>
      </div>
    </div>
  );
}
