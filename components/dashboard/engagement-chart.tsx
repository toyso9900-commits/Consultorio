"use client";

import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
} from "recharts";
import { useI18n } from "@/lib/i18n/client";
import { useTheme } from "@/components/theme-provider";

interface EngagementChartDataPoint {
  date: string;
  count: number;
}

interface EngagementChartProps {
  data: EngagementChartDataPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  const { dictionary, locale } = useI18n();
  const { resolvedTheme } = useTheme();

  const chartData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div key={resolvedTheme} className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              backgroundColor: "var(--card)",
              color: "var(--card-foreground)",
            }}
            formatter={(value) => [
              String(value),
              dictionary.professionalDashboard.engagementAppointments,
            ]}
            labelFormatter={(label) => label}
          />
          <Bar
            dataKey="count"
            fill="var(--role-professional-primary)"
            radius={[4, 4, 0, 0]}
            name={dictionary.professionalDashboard.engagementAppointments}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
