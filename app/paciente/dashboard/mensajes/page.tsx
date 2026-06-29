import { auth } from "@/lib/auth";
import { MessageSquare } from "lucide-react";
import { getConversation, getUserConversations } from "@/app/messages/actions";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ConversationList } from "@/components/chat/conversation-list";
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

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-3">
      <div className="hidden flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-rose-600" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
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
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        {professionalId ? (
          <ChatPanel
            initialMessages={initialMessages}
            professionalId={professionalId}
            professionalName={professionalName}
            patientId={session!.user.id ?? ""}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-600 dark:text-slate-400">
              {dictionary.patientMessages.empty.split("{link}").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <Link
                      href="/paciente/dashboard/expertos"
                      className="text-indigo-600 hover:underline dark:text-indigo-400"
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
