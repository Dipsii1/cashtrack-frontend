"use client";
import * as React from "react";
import { addDays, addWeeks, format, startOfWeek, subDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";
import type { SavingsContribution } from "@/types";

interface ContributionHeatmapProps {
  contributions: SavingsContribution[];
}

const levelColors = [
  "bg-neutral-100 dark:bg-neutral-800",
  "bg-green-200 dark:bg-green-900/40",
  "bg-green-300 dark:bg-green-900/60",
  "bg-green-400 dark:bg-green-900/80",
  "bg-green-500 dark:bg-green-700",
] as const;

function getLevel(amount: number, max: number): number {
  if (amount <= 0) return 0;
  if (max <= 0) return 1;
  const ratio = amount / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function ContributionHeatmap({ contributions }: ContributionHeatmapProps) {
  const today = React.useMemo(() => new Date(), []);

  const { dailyMap, maxAmount } = React.useMemo(() => {
    const map = new Map<string, number>();
    let max = 0;
    for (const c of contributions) {
      const key = format(new Date(c.contributionDate), "yyyy-MM-dd");
      const total = (map.get(key) ?? 0) + c.amount;
      map.set(key, total);
      if (total > max) max = total;
    }
    return { dailyMap: map, maxAmount: max };
  }, [contributions]);

  const weeks = React.useMemo(() => {
    const start = startOfWeek(subDays(today, 364), { weekStartsOn: 0 });
    const result: Date[][] = [];
    for (let w = 0; w < 53; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(addWeeks(start, w), d));
      }
      result.push(week);
    }
    return result;
  }, [today]);

  const CELL_SIZE = 10;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-3">
        <div className="flex items-end gap-px overflow-x-auto">
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-rows-7 gap-[2px] shrink-0"
            >
              {week.map((date) => {
                const key = format(date, "yyyy-MM-dd");
                const amount = dailyMap.get(key) ?? 0;
                const level = getLevel(amount, maxAmount);
                const isFuture = date > today;
                if (amount <= 0) {
                  return (
                    <div
                      key={key}
                      className={cn(
                        "rounded-[2px]",
                        isFuture ? "bg-transparent" : levelColors[level]
                      )}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    />
                  );
                }
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "rounded-[2px] transition-transform hover:brightness-110",
                          levelColors[level]
                        )}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="px-2 py-1 text-xs"
                    >
                      <p className="font-medium">
                        {formatDate(date.toISOString())}
                      </p>
                      <p>{formatCurrency(amount)}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Kurang</span>
          {levelColors.map((cls, i) => (
            <div
              key={i}
              className={cn("h-3 w-3 rounded-sm", cls)}
            />
          ))}
          <span>Lebih</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
