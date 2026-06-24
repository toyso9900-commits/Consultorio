"use client";

import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { use } from "react";

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ProfessionalChatPageProps {
  initialMessagesPromise: Promise<{ success: boolean; messages?: unknown[]; error?: string }>;
  patientId: string;
  patientName: string;
}

export default function ProfessionalChatPage({
  initialMessagesPromise,
  patientId,
  patientName,
}: ProfessionalChatPageProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const urlPatientId = searchParams.get("paciente");
  const urlPatientName = searchParams.get("nombre") || "Paciente";

  const targetPatientId = patientId || urlPatientId || "";
  const targetPatientName = patientName || urlPatientName;

  const result = use(initialMessagesPromise);
  const initialMessages: ChatMessage[] = result.success
    ? ((result.messages ?? []) as ChatMessage[]).map((m) => ({
        ...m,
        createdAt:
          typeof m.createdAt === "string"
            ? m.createdAt
            : new Date(m.createdAt as unknown as string).toISOString(),
      }))
    : [];

  if (!targetPatientId) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-600 dark:text-slate-400">
          Seleccioná una conversación para ver los mensajes.
        </p>
      </div>
    );
  }

  return (
    <ChatPanel
      initialMessages={initialMessages}
      professionalId={targetPatientId}
      professionalName={targetPatientName}
      patientId={session?.user?.id ?? ""}
    />
  );
}
