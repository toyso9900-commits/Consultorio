"use client";

import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useI18n } from "@/lib/i18n/client";
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
  patientImage?: string | null;
}

export default function ProfessionalChatPage({
  initialMessagesPromise,
  patientId,
  patientName,
  patientImage,
}: ProfessionalChatPageProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { dictionary } = useI18n();
  const urlPatientId = searchParams.get("paciente");
  const urlPatientName = searchParams.get("nombre") || dictionary.professionalMessages.defaultName;

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
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <MessageSquare className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          {dictionary.professionalMessages.empty}
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
      counterpartImage={patientImage ?? null}
    />
  );
}
