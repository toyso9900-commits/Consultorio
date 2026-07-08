"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useI18n } from "@/lib/i18n/client";

interface SubscriptionDonutProps {
  free: number;
  premium: number;
  totalLabel?: string;
}

export function SubscriptionDonut({ free, premium, totalLabel }: SubscriptionDonutProps) {
  const { dictionary } = useI18n();
  const data = [
    { name: dictionary.adminDashboard?.freePlan ?? "Free", value: free },
    { name: dictionary.adminDashboard?.premiumPlan ?? "Premium", value: premium },
  ];
  const colors = ["#a8a29e", "var(--role-patient-primary)"];

  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--card-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-stone-800 dark:text-stone-100">
          {free + premium}
        </span>
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {totalLabel ?? "subscriptions"}
        </span>
      </div>
    </div>
  );
}
