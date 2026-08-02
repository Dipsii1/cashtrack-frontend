"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof Calendar>;
const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface CalendarImplProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date) => void;
  initialFocus?: boolean;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function Calendar({ selected, onSelect, className, disabled }: CalendarImplProps) {
  const [view, setView] = React.useState(() => {
    const d = selected ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d));

  const isSelected = (date: Date) =>
    selected && date.getFullYear() === selected.getFullYear() && date.getMonth() === selected.getMonth() && date.getDate() === selected.getDate();
  const isToday = (date: Date) => {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  };

  const prevMonth = () => setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }));
  const nextMonth = () => setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }));

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between pb-2">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-semibold">
          {months[view.month]} {view.year}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 pb-1 text-center">
        {daysOfWeek.map((d) => (
          <div key={d} className="py-1 text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const isDisabled = disabled?.(date);
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect?.(date)}
              className={cn(
                "h-8 w-8 rounded-lg text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40",
                isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary",
                isToday(date) && !isSelected(date) && "border border-primary text-primary"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}