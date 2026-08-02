"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  period: string;
  showPercent?: boolean;
  className?: string;
}

export function BudgetProgress({ spent, budget, period, showPercent = true, className }: BudgetProgressProps) {
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;
  const remaining = Math.max(budget - spent, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Budget {period}</p>
          <p className="text-xs text-muted-foreground">
            Terpakai {formatCurrency(spent)} dari {formatCurrency(budget)}
          </p>
        </div>
        {showPercent && (
          <span className={cn("text-sm font-semibold", isOver ? "text-foreground" : "text-primary")}>
            {percent.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          className={cn("h-full rounded-full transition-colors", isOver ? "bg-destructive" : "bg-foreground")}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Sisa: {formatCurrency(remaining)}</span>
        {isOver && <span className="text-destructive font-medium">Melebihi {formatCurrency(spent - budget)}</span>}
      </div>
    </div>
  );
}