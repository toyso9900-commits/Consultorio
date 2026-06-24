"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface ChartDataPoint {
  date: string;
  registrations: number;
  traffic: number;
}

interface AdminStatsChartProps {
  data?: ChartDataPoint[];
}

const DEFAULT_DATA: ChartDataPoint[] = [
  { date: "Lun", registrations: 4, traffic: 24 },
  { date: "Mar", registrations: 7, traffic: 38 },
  { date: "Mié", registrations: 5, traffic: 31 },
  { date: "Jue", registrations: 12, traffic: 56 },
  { date: "Vie", registrations: 9, traffic: 47 },
  { date: "Sáb", registrations: 6, traffic: 29 },
  { date: "Dom", registrations: 3, traffic: 18 },
];

export function AdminStatsChart({ data = DEFAULT_DATA }: AdminStatsChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="traffic"
            stroke="none"
            fill="url(#colorTraffic)"
          />
          <Line
            type="monotone"
            dataKey="traffic"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#6366f1" }}
            activeDot={{ r: 5 }}
            name="Tráfico"
          />
          <Line
            type="monotone"
            dataKey="registrations"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: "#10b981" }}
            activeDot={{ r: 5 }}
            name="Registros"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
