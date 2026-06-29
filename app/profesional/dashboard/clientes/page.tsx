import { auth } from "@/lib/auth";
import { Users } from "lucide-react";
import { getUserConversations } from "@/app/messages/actions";
import { ConversationList } from "@/components/chat/conversation-list";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function ProfessionalClientsPage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);
  const userId = session?.user?.id;

  const conversationsResult = userId
    ? await getUserConversations(userId)
    : { success: true, users: [] };
  const conversations =
    conversationsResult.success && "users" in conversationsResult
      ? conversationsResult.users
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
          <Users className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dictionary.professionalClients.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.professionalClients.description}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            {dictionary.professionalClients.conversations}
          </h2>
        </div>
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto p-2">
          {userId ? (
            <ConversationList
              key={userId}
              initialConversations={conversations}
              currentUserId={userId}
              emptyMessage={dictionary.professionalClients.empty}
            />
          ) : (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
              {dictionary.professionalClients.unidentified}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
