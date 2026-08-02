"use client";
import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  className?: string;
  height?: number;
}

export function IncomeExpenseChart({ data, loading, className, height = 240 }: IncomeExpenseChartProps) {
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
          <p className="font-medium text-xs">
            {label ? format(new Date(label), "dd MMM", { locale: id }) : ""}
          </p>
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
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: id })}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value) => formatCurrency(value).replace(/[^0-9]/g, "").slice(0, -2) + "K"}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={customTooltip as never} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            name="Pemasukan"
            stroke="#0a0a0a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Pengeluaran"
            stroke="#52525b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}