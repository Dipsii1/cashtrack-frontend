"use client";
import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { colorToGray } from "@/components/common/category-icon";

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
  icon?: string;
}

interface PieChartProps {
  data: PieDataPoint[];
  loading?: boolean;
  className?: string;
  height?: number;
}

export function CategoryPieChart({ data, loading, className, height = 240 }: PieChartProps) {
  if (loading) {
    return <Skeleton className={cn("h-[240px] w-full rounded-2xl", className)} />;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className={cn("h-[240px] w-full rounded-2xl flex items-center justify-center bg-muted/30", className)}>
        <p className="text-sm text-muted-foreground">Belum ada data pengeluaran</p>
      </div>
    );
  }

  const customTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const percent = ((entry.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-xl bg-background p-3 border shadow-lg">
          <p className="font-medium text-xs">{entry.name}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(entry.value)} ({percent}%)</p>
        </div>
      );
    }
    return null;
  };

  const GRAYS = ["#0a0a0a", "#27272a", "#3f3f46", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8", "#737373", "#404040", "#171717"];

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorToGray(entry.color, GRAYS[index % GRAYS.length])} />
            ))}
          </Pie>
          <Tooltip content={customTooltip as any} />
          <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}