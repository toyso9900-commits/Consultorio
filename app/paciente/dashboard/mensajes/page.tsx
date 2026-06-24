import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MessageSquare } from "lucide-react";
import { getConversation, getUserConversations } from "@/app/messages/actions";
import { ChatPanel } from "@/components/chat/chat-panel";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ profesional?: string; nombre?: string }>;
}

export default async function PatientMessagesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const params = await searchParams;
  const professionalId = params.profesional;
  const professionalName = params.nombre || "Especialista";

  let initialMessages: { id: string; senderId: string; receiverId: string; content: string; createdAt: string; sender: { id: string; name: string | null; image: string | null } }[] = [];

  if (professionalId) {
    const result = await getConversation(session.user.id, professionalId);
    if (result.success) {
      initialMessages = result.messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }));
    }
  }

  const conversationsResult = await getUserConversations(session.user.id);
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
              Conversaciones
            </h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
              No tenés conversaciones todavía.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/paciente/dashboard/mensajes?profesional=${encodeURIComponent(
                      user.id
                    )}&nombre=${encodeURIComponent(user.name || "Especialista")}`}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      user.id === professionalId
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {(user.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                      {user.name || "Especialista"}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {professionalId ? (
          <ChatPanel
            initialMessages={initialMessages}
            professionalId={professionalId}
            professionalName={professionalName}
            patientId={session.user.id}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-600 dark:text-slate-400">
              Seleccioná un profesional desde la{" "}
              <Link
                href="/paciente/dashboard/expertos"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Guía de Expertos
              </Link>{" "}
              para iniciar una conversación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
