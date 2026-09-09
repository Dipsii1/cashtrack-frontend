"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CircularProgress } from "@/components/charts/circular-progress";
import { ContributionHeatmap } from "@/components/charts/contribution-heatmap";
import { SavingsGoalForm } from "@/features/savings-goals/savings-goal-form";
import { SavingsContributionForm } from "@/features/savings-goals/savings-contribution-form";
import {
  useSavingsGoals,
  useDeleteSavingsGoal,
  useDeleteSavingsContribution,
} from "@/hooks/useSavingsGoals";
import { formatCurrency } from "@/utils/format";
import { formatDate, formatRelative } from "@/utils/date";
import type { SavingsGoal, SavingsContribution } from "@/types";
import { cn } from "@/lib/utils";

const goalAccents = [
  "bg-neutral-950",
  "bg-neutral-800",
  "bg-neutral-600",
  "bg-neutral-950",
  "bg-neutral-800",
  "bg-neutral-600",
];

const springConfig = { type: "spring" as const, stiffness: 300, damping: 24 };

export default function SavingsGoalsPage() {
  const { data: goals = [], isLoading, refetch } = useSavingsGoals();
  const deleteGoal = useDeleteSavingsGoal();
  const deleteContribution = useDeleteSavingsContribution();
  const [editing, setEditing] = React.useState<SavingsGoal | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [contributionGoalId, setContributionGoalId] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Target & Kontribusi Tabungan"
        description="Kelola target dan kontribusi menabung Anda"
        icon={PiggyBank}
        actions={
          <div className="flex items-center gap-2">
            <Dialog
              open={contributionGoalId !== null}
              onOpenChange={(open) => setContributionGoalId(open ? "" : null)}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Tambah Kontribusi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Kontribusi</DialogTitle>
                  <DialogDescription>
                    {contributionGoalId
                      ? "Catat penyetoran ke tujuan yang dipilih"
                      : "Pilih tujuan dan catat penyetoran Anda"}
                  </DialogDescription>
                </DialogHeader>
                <SavingsContributionForm
                  goalPublicId={contributionGoalId ?? undefined}
                  onSuccess={() => setContributionGoalId(null)}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={creating} onOpenChange={setCreating}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Tambah Target
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Target Tabungan</DialogTitle>
                  <DialogDescription>
                    Tetapkan target menabung dengan nominal dan tanggal
                  </DialogDescription>
                </DialogHeader>
                <SavingsGoalForm onSuccess={() => setCreating(false)} />
              </DialogContent>
            </Dialog>
          </div>
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
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => {
              const accent = goalAccents[index % goalAccents.length];
              const progress =
                goal.targetAmount > 0
                  ? (Number(goal.currentAmount) / goal.targetAmount) * 100
                  : 0;
              const remaining = Math.max(
                goal.targetAmount - Number(goal.currentAmount),
                0
              );
              const isAchieved = goal.isAchieved || progress >= 100;
              const estimatedDays = goal.targetDate
                ? Math.max(
                    Math.ceil(
                      (new Date(goal.targetDate).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    ),
                    0
                  )
                : null;
              const contributions = goal.contributions ?? [];
              const isGoalExpanded = expanded === goal.publicId;

              return (
                <motion.div
                  key={goal.publicId}
                  layout
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={springConfig}
                  className="group relative rounded-2xl border bg-card shadow-sm overflow-hidden"
                >
                  <div
                    className={cn("absolute inset-x-0 top-0 h-1 rounded-t-2xl", accent)}
                  />
                  <div className="p-5">
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
                        <Badge
                          variant={isAchieved ? "success" : "secondary"}
                          className="gap-1"
                        >
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
                          onConfirm={() =>
                            deleteGoal.mutate(goal.publicId, {
                              onSuccess: () => refetch(),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <CircularProgress
                        value={Number(goal.currentAmount)}
                        target={goal.targetAmount}
                        size={80}
                        strokeWidth={7}
                        showValue={false}
                      />
                      <div className="text-right space-y-1 flex-1">
                        <p className="text-2xl font-bold">
                          {formatCurrency(Number(goal.currentAmount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          dari {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>

                      <motion.button
                        layout
                        onClick={() =>
                          setExpanded(isGoalExpanded ? null : goal.publicId)
                        }
                        className="rounded-xl p-2 text-muted-foreground opacity-60 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                        aria-label={
                          isGoalExpanded ? "Tutup kontribusi" : "Lihat kontribusi"
                        }
                      >
                        <motion.div
                          animate={{ rotate: isGoalExpanded ? 180 : 0 }}
                          transition={springConfig}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </motion.button>
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
                        transition={springConfig}
                        className="mt-4 p-3 rounded-xl bg-foreground text-background"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">Target tercapai!</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isGoalExpanded && (
                      <motion.div
                        key="contributions-panel"
                        initial={{ maxHeight: 0, opacity: 0 }}
                        animate={{ maxHeight: 600, opacity: 1 }}
                        exit={{ maxHeight: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: "easeOut",
                          opacity: { duration: 0.18 },
                        }}
                        className="border-t overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          <Card className="p-4 border-dashed border-2">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Aktivitas Kontribusi</p>
                              </div>

                              {contributions.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  Belum ada kontribusi untuk tujuan ini.
                                </p>
                              ) : (
                                <ContributionHeatmap contributions={contributions} />
                              )}
                            </div>
                          </Card>

                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              Riwayat Kontribusi ({contributions.length})
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => setContributionGoalId(goal.publicId)}
                            >
                              <Plus className="h-3 w-4" />
                              Tambah Kontribusi
                            </Button>
                          </div>

                          {contributions.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Klik "Tambah Kontribusi" untuk mulai menabung.
                            </p>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
                              className="overflow-x-auto"
                            >
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Dompet</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead>Catatan</TableHead>
                                    <TableHead className="w-[60px]" />
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {contributions.map((c: SavingsContribution) => (
                                    <motion.tr
                                      key={c.publicId}
                                      layout
                                      initial={{ opacity: 0, x: -12 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 12 }}
                                      transition={{
                                        duration: 0.2,
                                        ease: "easeOut",
                                      }}
                                    >
                                      <TableCell>{formatDate(c.contributionDate)}</TableCell>
                                      <TableCell>
                                        {c.wallet
                                          ? `${c.wallet.name} (${c.wallet.currency})`
                                          : "\u2014"}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {c.wallet
                                          ? formatCurrency(c.amount, c.wallet.currency)
                                          : formatCurrency(c.amount)}
                                      </TableCell>
                                      <TableCell>{c.note ?? "\u2014"}</TableCell>
                                      <TableCell>
                                        <ConfirmDialog
                                          trigger={
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-destructive hover:text-destructive"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          }
                                          title="Hapus Kontribusi?"
                                          description={`Hapus kontribusi sebesar ${formatCurrency(
                                            c.amount
                                          )}?`}
                                          onConfirm={() =>
                                            deleteContribution.mutate(c.publicId)
                                          }
                                        />
                                      </TableCell>
                                    </motion.tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Target</DialogTitle>
            <DialogDescription>Perbarui informasi target tabungan</DialogDescription>
          </DialogHeader>
          {editing && (
            <SavingsGoalForm
              goal={editing}
              onSuccess={() => {
                setEditing(null);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
