"use client";

import Image from "next/image";
import { Camera, Medal } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/server";

interface PatientStatsWidgetsProps {
  dictionary: Dictionary;
  image?: string | null;
  name: string;
  weight: number;
  height: number;
  bmi: number;
  progressPercent: number;
  completedDays: number;
  streakDays: number;
  weightGoal: number;
}

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&h=400&q=80";

export function PatientStatsWidgets({
  dictionary,
  image,
  name,
  weight,
  height,
  bmi,
  progressPercent,
  completedDays,
  streakDays,
  weightGoal,
}: PatientStatsWidgetsProps) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex items-center gap-6 rounded-2xl border border-[#3a3a3a]/50 bg-[#0d1f0d] p-6 shadow-lg">
        <div className="relative shrink-0">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#1a3a1a"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#a3e635"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-2 overflow-hidden rounded-full">
              <Image
                src={image || FALLBACK_AVATAR}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#3a3a3a] bg-[#2c2c2c] text-white shadow-md transition-colors hover:bg-[#3a3a3a]"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-semibold text-white">
            {name || dictionary.patientProfile.title}
          </p>
          <p className="text-sm text-white/60">
            {dictionary.patientProfile.bmiLabel}: {bmi}
          </p>
          <p className="text-sm text-white/60">
            {dictionary.patientProfile.height}: {height}cm
          </p>
          <p className="text-sm text-white/60">
            {dictionary.patientProfile.weight}: {weight}kg
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#3a3a3a]/50 bg-[#0d1f0d] p-6 shadow-lg">
        <div className="flex h-full items-center gap-6">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#1a3a1a"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#55eb55"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xl font-bold text-white">
              {progressPercent}%
            </span>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-[#55eb55]" />
              <span className="font-semibold text-white">
                {dictionary.patientProfile.generalProgress}: {progressPercent}%
              </span>
            </div>
            <p className="text-sm text-white/70">
              {dictionary.patientProfile.completedDays.replace(
                "{count}",
                String(completedDays)
              )}
            </p>
            <div className="space-y-1 border-t border-[#3a3a3a]/30 pt-3">
              <p className="text-sm text-white/80">
                {dictionary.patientProfile.weightGoal}: {weightGoal}kg
              </p>
              <p className="text-sm text-white/80">
                {dictionary.patientProfile.activityStreak}: {streakDays} {dictionary.patientProfile.days}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
