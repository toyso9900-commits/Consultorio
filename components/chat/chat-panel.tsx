"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { useSession } from "next-auth/react";
import { Send, User } from "lucide-react";
import { sendMessage, markMessagesAsRead } from "@/app/messages/actions";

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

export function ChatPanel({
  initialMessages,
  professionalId,
  professionalName,
  patientId,
}: ChatPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null);

  const userId = session?.user?.id ?? patientId;
  const otherId = professionalId;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markMessagesAsRead(userId, otherId);
  }, [userId, otherId]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    });

    const channelName = `chat-${[userId, otherId].sort().join("-")}`;
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    channel.bind("new-message", (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      if (message.senderId !== userId) {
        markMessagesAsRead(userId, otherId);
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [userId, otherId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const result = await sendMessage({
      senderId: userId,
      receiverId: otherId,
      content: input.trim(),
    });

    setIsSending(false);

    if (result.success && result.message) {
      setInput("");
      const newMessage: ChatMessage = {
        ...result.message,
        createdAt: result.message.createdAt.toISOString(),
        sender: {
          id: result.message.sender.id,
          name: result.message.sender.name,
          image: result.message.sender.image,
        },
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <User className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{professionalName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">En línea</p>
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
                    : "rounded-bl-none bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isMe
                      ? "text-indigo-100"
                      : "text-slate-500 dark:text-slate-400"
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
        className="flex items-center gap-3 border-t border-slate-200 p-4 dark:border-slate-800"
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
