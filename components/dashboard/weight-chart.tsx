"use client";

import { useId } from "react";
import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useI18n } from "@/lib/i18n/client";
import { useResolvedTheme } from "@/components/theme-provider";

interface WeightChartDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightChartDataPoint[];
  height?: number | null;
}

export function WeightChart({ data, height }: WeightChartProps) {
  const { dictionary, locale } = useI18n();
  const resolvedTheme = useResolvedTheme();
  const gradientId = useId();

  const chartData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    }),
  }));

  // BMI 22 midpoint reference: ideal weight (kg) = 22 * (height in meters)^2
  const idealWeight =
    height != null && height > 0
      ? Math.round(22 * (height / 100) ** 2 * 10) / 10
      : null;

  const yDomain: [string | ((dataMin: number) => number), string | ((dataMax: number) => number)] =
    idealWeight != null
      ? [
          (dataMin: number) => Math.min(dataMin - 1, idealWeight),
          (dataMax: number) => Math.max(dataMax + 1, idealWeight),
        ]
      : ["dataMin - 1", "dataMax + 1"];

  return (
    <div key={resolvedTheme} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
            domain={yDomain}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 6px -1px color-mix(in hsl, var(--border) 20%, transparent)",
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
            fill={`url(#${gradientId})`}
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
          {idealWeight != null && (
            <ReferenceLine
              y={idealWeight}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{
                value: `${dictionary.patientHome.idealWeight} (${idealWeight} kg)`,
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
