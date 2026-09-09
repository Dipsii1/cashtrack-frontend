"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, Plus, Pencil, Trash2, CreditCard, Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { WalletForm } from "@/features/wallets/wallet-form";
import { useWallets, useDeleteWallet } from "@/hooks/useWallets";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/utils/format";
import { formatRelative } from "@/utils/date";
import type { Wallet } from "@/types";
import { cn } from "@/lib/utils";

const walletStyles = [
  {
    bg: "bg-neutral-950",
    icon: CreditCard,
  },
  {
    bg: "bg-neutral-800",
    icon: Landmark,
  },
  {
    bg: "bg-neutral-700",
    icon: CreditCard,
  },
  {
    bg: "bg-neutral-900",
    icon: Landmark,
  },
  {
    bg: "bg-neutral-800",
    icon: CreditCard,
  },
  {
    bg: "bg-neutral-700",
    icon: Landmark,
  },
];

export default function WalletsPage() {
  const { data: wallets = [], isLoading } = useWallets();
  const deleteWallet = useDeleteWallet();
  const [editing, setEditing] = React.useState<Wallet | null>(null);
  const [creating, setCreating] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dompet"
        description="Kelola dompet dan saldo Anda"
        icon={WalletIcon}
        actions={
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Dompet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Dompet</DialogTitle>
                <DialogDescription>Buat dompet baru untuk mengelola keuangan</DialogDescription>
              </DialogHeader>
              <WalletForm onSuccess={() => setCreating(false)} />
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
      ) : wallets.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada dompet"
            description="Buat dompet pertama Anda untuk mulai mencatat keuangan"
            actionLabel="Tambah Dompet"
            onAction={() => setCreating(true)}
          />
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet, index) => {
              const style = walletStyles[index % walletStyles.length];
              const Icon = style.icon;
              return (
                <motion.div
                  key={wallet.publicId}
                  layout
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-3xl"
                >
                <div className={cn("p-6 text-white", style.bg)}>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                  <div className="pointer-events-none absolute -bottom-16 -left-6 h-48 w-48 rounded-full bg-black/10" />

                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-xs text-white/70">{wallet.currency}</p>
                      </div>
                    </div>
                    {wallet.isDefault && (
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                        Utama
                      </span>
                    )}
                  </div>

                  <div className="mt-6 relative">
                    <p className="text-xs text-white/70">Saldo</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatCurrency(Number(wallet.balance), wallet.currency)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between relative">
                    <p className="text-[11px] text-white/60">Diperbarui {formatRelative(wallet.updatedAt)}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditing(wallet)}
                        className="rounded-xl bg-white/20 p-2 backdrop-blur transition hover:bg-white/30"
                        aria-label={`Edit ${wallet.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <ConfirmDialog
                        trigger={
                          <button
                            className="rounded-xl bg-white/20 p-2 backdrop-blur transition hover:bg-white/30"
                            aria-label={`Hapus ${wallet.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        }
                        title="Hapus Dompet?"
                        description={`Semua transaksi terkait "${wallet.name}" akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`}
                        onConfirm={() => deleteWallet.mutate(wallet.publicId)}
                      />
                    </div>
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
            <DialogTitle>Edit Dompet</DialogTitle>
            <DialogDescription>Perbarui informasi dompet Anda</DialogDescription>
          </DialogHeader>
          {editing && <WalletForm wallet={editing} onSuccess={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}