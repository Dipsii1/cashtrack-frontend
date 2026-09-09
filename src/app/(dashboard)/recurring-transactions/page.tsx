"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Plus, Pencil, Trash2, Power, RotateCcw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CategoryIcon } from "@/components/common/category-icon";
import { RecurringForm } from "@/features/recurring-transactions/recurring-form";
import { useRecurringTransactions, useDeleteRecurring, useUpdateRecurring } from "@/hooks/useRecurring";
import { formatCurrency } from "@/utils/format";
import { formatDate, getFrequencyLabel } from "@/utils/date";
import type { RecurringTransaction } from "@/types";
import { cn } from "@/lib/utils";

export default function RecurringPage() {
  const [isActiveFilter, setIsActiveFilter] = React.useState<boolean | undefined>(undefined);
  const { data: recurrings = [], isLoading } = useRecurringTransactions(isActiveFilter);
  const deleteRecurring = useDeleteRecurring();
  const updateRecurring = useUpdateRecurring();
  const [editing, setEditing] = React.useState<RecurringTransaction | null>(null);
  const [creating, setCreating] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi Berkala"
        description="Kelola transaksi otomatis berulang"
        icon={CalendarClock}
        actions={
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Berkala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Transaksi Berkala</DialogTitle>
                <DialogDescription>Buat transaksi otomatis harian, mingguan, bulanan, atau tahunan</DialogDescription>
              </DialogHeader>
              <RecurringForm onSuccess={() => setCreating(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex gap-2">
        <Button
          variant={isActiveFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => setIsActiveFilter(undefined)}
        >
          Semua
        </Button>
        <Button
          variant={isActiveFilter === true ? "default" : "outline"}
          size="sm"
          onClick={() => setIsActiveFilter(true)}
        >
          Aktif
        </Button>
        <Button
          variant={isActiveFilter === false ? "default" : "outline"}
          size="sm"
          onClick={() => setIsActiveFilter(false)}
        >
          Nonaktif
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : recurrings.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada transaksi berkala"
            description="Atur transaksi otomatis seperti gaji, tagihan, dan langganan"
            actionLabel="Tambah Berkala"
            onAction={() => setCreating(true)}
          />
        </Card>
) : (
         <AnimatePresence mode="popLayout">
           <div className="space-y-3">
             {recurrings.map((rt, index) => {
            const isIncome = rt.type === "INCOME";
            return (
<motion.div
                 key={rt.publicId}
                 layout
                 initial={false}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                 transition={{ duration: 0.2 }}
                className={cn(
                  "rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md",
                  !rt.isActive && "opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground",
                    )}
                  >
                    {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{rt.title}</p>
                      <Badge variant={rt.isActive ? "success" : "secondary"} className="hidden sm:inline-flex">
                        {rt.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        {getFrequencyLabel(rt.frequency)}
                        {rt.interval > 1 && ` (setiap ${rt.interval}x)`}
                      </span>
                      <span>{rt.wallet.name}</span>
                      {rt.category && (
                        <span className="flex items-center gap-1">
                          <CategoryIcon icon={rt.category.icon} color={rt.category.color} size="sm" className="h-5 w-5 rounded-lg" />
                          {rt.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <p className={cn("font-semibold", isIncome ? "text-foreground" : "text-muted-foreground")}>
                      {isIncome ? "+" : "-"}
                      {formatCurrency(rt.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Berikutnya: {formatDate(rt.nextRunDate)}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={rt.isActive}
                      onCheckedChange={(checked) =>
                        updateRecurring.mutate({ publicId: rt.publicId, input: { isActive: checked } })
                      }
                      aria-label={`${rt.isActive ? "Nonaktifkan" : "Aktifkan"} ${rt.title}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditing(rt)}
                      aria-label={`Edit ${rt.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" aria-label={`Hapus ${rt.title}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Hapus Transaksi Berkala?"
                      description={`"${rt.title}" akan dihapus permanen.`}
                      onConfirm={() => deleteRecurring.mutate(rt.publicId)}
                    />
                  </div>
                </div>
              </motion.div>
            );
})}
         </div>
         </AnimatePresence>
       )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaksi Berkala</DialogTitle>
            <DialogDescription>Perbarui detail transaksi berkala</DialogDescription>
          </DialogHeader>
          {editing && <RecurringForm recurring={editing} onSuccess={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}