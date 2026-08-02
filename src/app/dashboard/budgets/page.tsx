"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Target, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { BudgetProgress } from "@/components/charts/budget-progress";
import { BudgetForm } from "@/features/budgets/budget-form";
import { useBudgets, useDeleteBudget } from "@/hooks/useBudgets";
import { useBudgetSpent } from "@/hooks/useBudgetSpent";
import { formatCurrency } from "@/utils/format";
import { getBudgetPeriodLabel } from "@/utils/date";
import type { Budget } from "@/types";
import { cn } from "@/lib/utils";

export default function BudgetsPage() {
  const { data: budgets = [], isLoading, refetch } = useBudgets();
  const deleteBudget = useDeleteBudget();
  const { spentFor } = useBudgetSpent(budgets);
  const [editing, setEditing] = React.useState<Budget | null>(null);
  const [creating, setCreating] = React.useState(false);

  const budgetPeriodColors: Record<string, { text: string }> = {
    WEEKLY: { text: "text-muted-foreground" },
    MONTHLY: { text: "text-foreground" },
    YEARLY: { text: "text-muted-foreground" },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anggaran"
        description="Kelola budget untuk mengontrol pengeluaran"
        icon={Target}
        actions={
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Budget</DialogTitle>
                <DialogDescription>Buat anggaran baru untuk kategori atau dompet</DialogDescription>
              </DialogHeader>
              <BudgetForm onSuccess={() => setCreating(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada budget"
            description="Buat budget untuk memantau pengeluaran per kategori atau dompet"
            actionLabel="Tambah Budget"
            onAction={() => setCreating(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget, index) => {
            const periodStyle = budgetPeriodColors[budget.period];
            const spent = spentFor(budget);
            const remaining = Math.max(Number(budget.amount) - spent, 0);
            const percent = budget.amount > 0 ? (spent / Number(budget.amount)) * 100 : 0;
            const isOver = spent > Number(budget.amount);

            return (
              <motion.div
                key={budget.publicId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium">{budget.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {budget.walletId ? "Dompet terpilih" : "Semua dompet"} •{" "}
                      {budget.categoryId ? "Kategori terpilih" : "Semua kategori"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={cn("text-xs", periodStyle.text)}>
                      {getBudgetPeriodLabel(budget.period)}
                    </Badge>
                    <button
                      onClick={() => setEditing(budget)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${budget.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <ConfirmDialog
                      trigger={
                        <button
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Hapus ${budget.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      }
                      title="Hapus Budget?"
                      description={`Budget "${budget.name}" akan dihapus.`}
                      onConfirm={() => deleteBudget.mutate(budget.publicId, { onSuccess: () => refetch() })}
                    />
                  </div>
                </div>

                <BudgetProgress
                  spent={spent}
                  budget={Number(budget.amount)}
                  period={getBudgetPeriodLabel(budget.period)}
                  showPercent={true}
                />

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sisa: </span>
                    <span className={cn("font-medium", isOver ? "text-destructive" : "text-foreground")}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  {isOver && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Melebihi
                    </Badge>
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
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>Perbarui informasi budget</DialogDescription>
          </DialogHeader>
          {editing && <BudgetForm budget={editing} onSuccess={() => { setEditing(null); refetch(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}