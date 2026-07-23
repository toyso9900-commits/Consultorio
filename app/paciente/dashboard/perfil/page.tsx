import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { UserCog } from "lucide-react";
import { PatientProfileForm } from "./profile-form";
import { PatientStatsWidgets } from "./patient-stats-widgets";
import { BmiTrendChart } from "./bmi-trend-chart";

export default async function PatientProfilePage() {
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      weightEntries: {
        orderBy: { recordedAt: "asc" },
        take: 30,
        select: { weight: true, recordedAt: true },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { image: true, timezone: true, name: true },
  });

  const completions = await prisma.routineItemCompletion.findMany({
    where: { patientId: session!.user.id },
    select: { date: true, count: true },
    orderBy: { date: "desc" },
    take: 90,
  });

  const { progressPercent, completedDays, streakDays, weightGoal } =
    computeStats(profile, completions);

  const height = profile?.height ?? 170;
  const weight = profile?.weight ?? 70;
  const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0;

  const bmiData =
    profile?.weightEntries && profile.weightEntries.length > 0
      ? profile.weightEntries.map((entry) => ({
          date: new Date(entry.recordedAt).toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
          }),
          bmi: Number(
            (entry.weight / ((height / 100) ** 2)).toFixed(1)
          ),
          weight: entry.weight,
        }))
      : fallbackBmiData(height, weight);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#0f1f1f] via-[#162525] to-[#0f1f1f] p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#55eb55]/15 text-[#55eb55]">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {dictionary.patientProfile.healthCenterTitle}
            </h1>
            <p className="text-sm text-white/60">
              {dictionary.patientProfile.healthCenterSubtitle}
            </p>
          </div>
        </div>

        <PatientStatsWidgets
          dictionary={dictionary}
          image={user?.image}
          name={user?.name || profile?.weight?.toString() || ""}
          weight={weight}
          height={height}
          bmi={bmi}
          progressPercent={progressPercent}
          completedDays={completedDays}
          streakDays={streakDays}
          weightGoal={weightGoal}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-[#3a3a3a]/50 bg-[#0d1f0d] p-6 shadow-lg lg:col-span-3">
            <PatientProfileForm
              userId={session!.user.id!}
              image={user?.image}
              defaultValues={{
                name: session!.user.name || "",
                height: profile?.height?.toString() || "",
                weight: profile?.weight?.toString() || "",
                gender: profile?.gender || "male",
                timezone: user?.timezone ?? "",
              }}
            />
          </div>

          <div className="rounded-2xl border border-[#3a3a3a]/50 bg-[#0d1f0d] p-6 shadow-lg lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <span className="inline-block h-2 w-2 rounded-full bg-[#55eb55]" />
              {dictionary.patientProfile.bmiTrendTitle}
            </h3>
            <BmiTrendChart data={bmiData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function computeStats(
  profile: { weight?: number | null; height?: number | null } | null,
  completions: { date: Date; count: number }[]
) {
  const height = profile?.height ?? 170;
  const weight = profile?.weight ?? 70;

  const targetBmi = 24.9;
  const weightGoal = Number((targetBmi * (height / 100) ** 2).toFixed(1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  const byDate = new Map<string, number>();
  completions.forEach((c) => {
    const key = c.date.toISOString().split("T")[0];
    byDate.set(key, (byDate.get(key) || 0) + c.count);
  });

  const completedDays = last7Days.filter((day) => {
    const count = byDate.get(day) || 0;
    return count >= 3;
  }).length;

  const progressPercent = Math.round((completedDays / 7) * 100);

  let streakDays = 0;
  const cursor = new Date(today);
  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if ((byDate.get(key) || 0) > 0) {
      streakDays++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { progressPercent, completedDays, streakDays, weightGoal };
}

function fallbackBmiData(height: number, weight: number) {
  const bmi = Number((weight / ((height / 100) ** 2)).toFixed(1));
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return days.map((day, i) => ({
    date: day,
    bmi: Number((bmi + Math.sin(i) * 0.5).toFixed(1)),
    weight: Number((weight + Math.sin(i) * 0.5).toFixed(1)),
  }));
}
