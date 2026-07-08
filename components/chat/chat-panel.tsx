"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { useSession } from "next-auth/react";
import { Send, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendMessage, markMessagesAsRead } from "@/app/messages/actions";
import {
  getPusherClientConfig,
  isPusherClientConfigured,
} from "@/lib/pusher-client";
import { userChannel } from "@/lib/pusher-shared";

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

interface ChatPanelProps {
  initialMessages: ChatMessage[];
  professionalId: string;
  professionalName: string;
  patientId: string;
}

export function ChatPanel(props: ChatPanelProps) {
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === "loading") {
    return (
      <div className="flex h-full min-h-[16rem] items-center justify-center rounded-2xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const userId = session?.user?.id ?? props.patientId;
  if (!userId) {
    return (
      <div className="flex h-full min-h-[16rem] items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          No se pudo identificar al usuario. Iniciá sesión nuevamente.
        </p>
      </div>
    );
  }

  return <ChatPanelInner {...props} userId={userId} />;
}

interface ChatPanelInnerProps extends ChatPanelProps {
  userId: string;
}

function ChatPanelInner({
  initialMessages,
  professionalId,
  professionalName,
  userId,
}: ChatPanelInnerProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null);

  const otherId = professionalId;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markMessagesAsRead(userId, otherId);
  }, [userId, otherId]);

  useEffect(() => {
    if (!isPusherClientConfigured()) {
      return;
    }

    const { key, cluster } = getPusherClientConfig();
    const pusherClient = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      authTransport: "ajax",
    });

    const channelName = userChannel(userId);
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    channel.bind("new-message", (message: ChatMessage) => {
      const isCurrentConversation =
        message.senderId === otherId || message.receiverId === otherId;

      if (!isCurrentConversation) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      if (message.senderId !== userId) {
        markMessagesAsRead(userId, otherId);
      }
    });

    channel.bind(
      "conversation-read",
      ({ senderId }: { senderId: string }) => {
        if (senderId !== otherId) return;
        // Messages in the current conversation were marked as read by the viewer.
        // The chat panel does not currently render per-message read receipts,
        // so no local state update is required here.
      }
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [userId, otherId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      senderId: userId,
      receiverId: otherId,
      content: text,
      createdAt: new Date().toISOString(),
      sender: {
        id: userId,
        name: session?.user?.name ?? null,
        image: session?.user?.image ?? null,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setIsSending(true);

    try {
      const result = await sendMessage({
        senderId: userId,
        receiverId: otherId,
        content: text,
      });

      if (result.success && result.message) {
        const confirmedMessage: ChatMessage = {
          ...result.message,
          createdAt: result.message.createdAt.toISOString(),
          sender: {
            id: result.message.sender.id,
            name: result.message.sender.name,
            image: result.message.sender.image,
          },
        };
        setMessages((prev) => {
          return prev.map((m) => (m.id === tempId ? confirmedMessage : m));
        });
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        toast.error(result.error || "No se pudo enviar el mensaje");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Error de red al enviar el mensaje");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-[16rem] flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <User className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="font-semibold text-card-foreground">{professionalName}</p>
          <p className="text-xs text-muted-foreground">En línea</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((message) => {
          const isMe = message.senderId === userId;
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe
                    ? "rounded-br-none bg-indigo-600 text-white"
                    : "rounded-bl-none bg-muted text-card-foreground"
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isMe
                      ? "text-indigo-100"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 border-t border-border p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
