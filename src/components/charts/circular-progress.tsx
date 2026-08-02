"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

interface CircularProgressProps {
  value: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  target,
  size = 80,
  strokeWidth = 6,
  className,
  showValue = true,
  children,
}: CircularProgressProps) {
  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-muted"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
        />
        <motion.circle
          className="text-primary"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (showValue && (
          <span className="text-xs font-bold">
            {progress.toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}