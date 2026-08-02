"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { PiggyBank, Plus, Pencil, Trash2, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/charts/circular-progress";
import { SavingsGoalForm } from "@/features/savings-goals/savings-goal-form";
import { useSavingsGoals, useDeleteSavingsGoal } from "@/hooks/useSavingsGoals";
import { formatCurrency } from "@/utils/format";
import { formatDate, formatRelative } from "@/utils/date";
import type { SavingsGoal } from "@/types";
import { cn } from "@/lib/utils";

const goalAccents = [
  "bg-neutral-950",
  "bg-neutral-800",
  "bg-neutral-600",
  "bg-neutral-950",
  "bg-neutral-800",
  "bg-neutral-600",
];

export default function SavingsGoalsPage() {
  const { data: goals = [], isLoading, refetch } = useSavingsGoals();
  const deleteGoal = useDeleteSavingsGoal();
  const [editing, setEditing] = React.useState<SavingsGoal | null>(null);
  const [creating, setCreating] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Target Tabungan"
        description="Kelola target menabung Anda"
        icon={PiggyBank}
        actions={
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Target
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Target Tabungan</DialogTitle>
                <DialogDescription>Tetapkan target menabung dengan nominal dan tanggal</DialogDescription>
              </DialogHeader>
              <SavingsGoalForm onSuccess={() => setCreating(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada target tabungan"
            description="Buat target untuk motivasi menabung Anda"
            actionLabel="Tambah Target"
            onAction={() => setCreating(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal, index) => {
            const accent = goalAccents[index % goalAccents.length];
            const progress = goal.targetAmount > 0 ? (Number(goal.currentAmount) / goal.targetAmount) * 100 : 0;
            const remaining = Math.max(goal.targetAmount - Number(goal.currentAmount), 0);
            const isAchieved = goal.isAchieved || progress >= 100;
            const estimatedDays = goal.targetDate
              ? Math.max(Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 0)
              : null;

            return (
              <motion.div
                key={goal.publicId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className={cn("absolute inset-x-0 top-0 h-1 rounded-t-2xl", accent)} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      {goal.targetDate && (
                        <p className="text-xs text-muted-foreground">
                          Target: {formatDate(goal.targetDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={isAchieved ? "success" : "secondary"} className="gap-1">
                        {isAchieved && <CheckCircle2 className="h-3 w-3" />}
                        {isAchieved ? "Tercapai" : "Berjalan"}
                      </Badge>
                      <button
                        onClick={() => setEditing(goal)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${goal.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <ConfirmDialog
                        trigger={
                          <button
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Hapus ${goal.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        }
                        title="Hapus Target?"
                        description={`Target "${goal.name}" akan dihapus.`}
                        onConfirm={() => deleteGoal.mutate(goal.publicId, { onSuccess: () => refetch() })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <CircularProgress value={Number(goal.currentAmount)} target={goal.targetAmount} size={80} strokeWidth={7} showValue={false} />
                    <div className="text-right space-y-1 flex-1">
                      <p className="text-2xl font-bold">{formatCurrency(Number(goal.currentAmount))}</p>
                      <p className="text-xs text-muted-foreground">dari {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tersisa</span>
                      <span className="font-semibold">
                        {isAchieved ? "Target tercapai!" : formatCurrency(remaining)}
                      </span>
                    </div>
                    {estimatedDays !== null && !isAchieved && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Perkiraan {estimatedDays} hari lagi</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Dibuat {formatRelative(goal.createdAt)}
                    </div>
                  </div>

                  {isAchieved && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-xl bg-foreground text-background"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Target tercapai! 🎉</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Target</DialogTitle>
            <DialogDescription>Perbarui informasi target tabungan</DialogDescription>
          </DialogHeader>
          {editing && <SavingsGoalForm goal={editing} onSuccess={() => { setEditing(null); refetch(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}