"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useResolvedTheme } from "@/components/theme-provider";

interface CalorieDonutProps {
  calories: number;
  goal: number;
}

export function CalorieDonut({ calories, goal }: CalorieDonutProps) {
  const resolvedTheme = useResolvedTheme();
  const consumed = Math.max(calories, 0);
  const remaining = Math.max(goal - consumed, 0);
  const data = [
    { name: "Consumidas", value: consumed },
    { name: "Restantes", value: remaining },
  ];
  const colors = [
    "var(--role-patient-primary)",
    resolvedTheme === "dark" ? "var(--muted)" : "#e7e5e4",
  ];

  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;

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
          {consumed}
        </span>
        <span className="text-sm text-stone-500 dark:text-stone-400">
          / {goal} kcal
        </span>
      </div>
      <p className="mt-2 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {percentage.toFixed(0)}% de la meta
      </p>
    </div>
  );
}
