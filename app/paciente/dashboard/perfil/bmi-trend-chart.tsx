"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";

interface BmiDataPoint {
  date: string;
  bmi: number;
  weight: number;
}

interface BmiTrendChartProps {
  data: BmiDataPoint[];
}

export function BmiTrendChart({ data }: BmiTrendChartProps) {
  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bmiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#55eb55" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#55eb55" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload as BmiDataPoint;
                return (
                  <div className="rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 text-sm shadow-lg">
                    <p className="font-medium text-white">{p.date}</p>
                    <p className="text-[#55eb55]">BMI: {p.bmi}</p>
                    <p className="text-white/70">Peso: {p.weight}kg</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="bmi"
            stroke="#22d3ee"
            strokeWidth={3}
            fill="url(#bmiGradient)"
            dot={{ r: 4, fill: "#22d3ee", stroke: "#0d1f0d", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#55eb55" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="absolute right-2 top-2 text-[#55eb55]">
        <Sparkles className="h-5 w-5" />
      </div>
    </div>
  );
}
