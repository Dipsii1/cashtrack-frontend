"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: "emerald" | "blue" | "amber" | "rose" | "violet";
  loading?: boolean;
  className?: string;
}

const accentMap = {
  emerald: "bg-foreground/10 text-foreground",
  blue: "bg-foreground/5 text-foreground",
  amber: "bg-foreground/10 text-foreground",
  rose: "bg-foreground/5 text-foreground",
  violet: "bg-foreground/10 text-foreground",
};

export function StatCard({ title, value, icon: Icon, trend, accent = "emerald", loading, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          )}
          {trend && !loading && (
            <p className={cn("text-xs font-medium", trend.positive ? "text-foreground" : "text-muted-foreground")}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}