"use client";

import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useI18n } from "@/lib/i18n/client";

interface WeightChartDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightChartDataPoint[];
}

export function WeightChart({ data }: WeightChartProps) {
  const { dictionary, locale } = useI18n();

  const chartData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--role-patient-primary)"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="var(--role-patient-primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
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
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
            domain={["dataMin - 1", "dataMax + 1"]}
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
              `${value} kg`,
              dictionary.patientHome.currentWeight,
            ]}
            labelFormatter={(label) => label}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="none"
            fill="url(#colorWeight)"
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--role-patient-primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--role-patient-primary)" }}
            activeDot={{ r: 5 }}
            name={dictionary.patientHome.currentWeight}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
