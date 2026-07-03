import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { getMealEntries } from "./actions";
import { NutritionPageClient } from "./nutrition-page-client";

export default async function NutritionPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const locale = await getLocale(userId);
  const dictionary = await getDictionary(locale);
  const historyResult = await getMealEntries(userId);

  const entries = historyResult.success ? historyResult.entries : [];

  return (
    <NutritionPageClient dictionary={dictionary} initialEntries={entries} />
  );
}
