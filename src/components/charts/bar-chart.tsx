"use client";
import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface BarDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  loading?: boolean;
  className?: string;
  height?: number;
}

export function MonthlyBarChart({ data, loading, className, height = 240 }: BarChartProps) {
  if (loading) {
    return <Skeleton className={cn("h-[240px] w-full rounded-2xl", className)} />;
  }

  const hasData = data.some((d) => d.income > 0 || d.expense > 0);
  if (!hasData) {
    return (
      <div className={cn("h-[240px] w-full rounded-2xl flex items-center justify-center bg-muted/30", className)}>
        <p className="text-sm text-muted-foreground">Belum ada data</p>
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-background p-3 border shadow-lg">
          <p className="font-medium text-xs">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value) => formatCurrency(value).replace(/[^0-9]/g, "").slice(0, -2) + "K"}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={customTooltip as any} />
          <Legend />
          <Bar dataKey="income" name="Pemasukan" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Pengeluaran" fill="#d4d4d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}