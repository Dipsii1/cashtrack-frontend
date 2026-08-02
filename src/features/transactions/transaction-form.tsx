"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/common/date-picker";
import { cn } from "@/lib/utils";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/useTransactions";
import { getErrorMessage } from "@/utils/errors";
import type { Transaction, TransactionType } from "@/types";

const schema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    walletPublicId: z.string().min(1, "Pilih dompet"),
    categoryPublicId: z.string().optional(),
    title: z.string().min(1, "Judul wajib diisi").max(200),
    amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
    transactionDate: z.date().optional(),
    note: z.string().max(1000).optional(),
  })
  .refine((d) => !(d.type === "TRANSFER" && d.categoryPublicId), {
    message: "Transfer tidak memakai kategori",
    path: ["categoryPublicId"],
  });

type TransactionFormValues = z.infer<typeof schema>;

const typeOptions: { value: TransactionType; label: string; icon: typeof ArrowUpCircle; active: string }[] = [
  { value: "EXPENSE", label: "Pengeluaran", icon: ArrowDownCircle, active: "bg-foreground text-background" },
  { value: "INCOME", label: "Pemasukan", icon: ArrowUpCircle, active: "bg-foreground text-background" },
  { value: "TRANSFER", label: "Transfer", icon: ArrowLeftRight, active: "bg-foreground text-background" },
];

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const editing = Boolean(transaction);

  const { data: wallets = [], isLoading: walletsLoading } = useWallets();
  const { data: categories = [] } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction?.type ?? "EXPENSE",
      walletPublicId: transaction?.wallet.publicId ?? "",
      categoryPublicId: transaction?.category?.publicId ?? undefined,
      title: transaction?.title ?? "",
      amount: transaction?.amount ?? undefined,
      transactionDate: transaction ? new Date(transaction.transactionDate) : new Date(),
      note: transaction?.note ?? "",
    },
  });

  const type = watch("type");
  const isPending = createTx.isPending || updateTx.isPending;

  const filteredCategories = categories.filter((c) =>
    type === "INCOME" ? c.type === "INCOME" : c.type === "EXPENSE"
  );

  function onSubmit(values: TransactionFormValues) {
    const input = {
      type: values.type,
      walletPublicId: values.walletPublicId,
      title: values.title,
      amount: values.amount,
      transactionDate: values.transactionDate?.toISOString(),
      note: values.note || undefined,
      ...(values.type !== "TRANSFER" && values.categoryPublicId
        ? { categoryPublicId: values.categoryPublicId }
        : {}),
    };
    if (editing && transaction) {
      updateTx.mutate({ publicId: transaction.publicId, input }, { onSuccess: () => onSuccess?.() });
    } else {
      createTx.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {typeOptions.map((opt) => {
          const Icon = opt.icon;
          const active = type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("type", opt.value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-sm font-medium transition-all",
                active ? cn("border-transparent text-white shadow-sm", opt.active) : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <Label>Dompet</Label>
        <select
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          {...register("walletPublicId")}
          disabled={walletsLoading}
        >
          <option value="">Pilih dompet</option>
          {wallets.map((w) => (
            <option key={w.publicId} value={w.publicId}>
              {w.name}
            </option>
          ))}
        </select>
        {errors.walletPublicId && <p className="text-xs text-destructive">{errors.walletPublicId.message}</p>}
      </div>

      {type !== "TRANSFER" && (
        <div className="space-y-1.5">
          <Label>Kategori</Label>
          <select
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            {...register("categoryPublicId")}
          >
            <option value="">Tanpa kategori</option>
            {filteredCategories.map((c) => (
              <option key={c.publicId} value={c.publicId}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryPublicId && <p className="text-xs text-destructive">{errors.categoryPublicId.message}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="tx-title">Judul</Label>
        <Input id="tx-title" placeholder="cth: Gaji bulanan, Makan siang" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tx-amount">Nominal</Label>
          <Input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            {...register("amount")}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Tanggal</Label>
          <DatePicker
            value={watch("transactionDate") ?? null}
            onChange={(d) => d && setValue("transactionDate", d, { shouldValidate: true })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-note">Catatan</Label>
        <Textarea id="tx-note" placeholder="Catatan tambahan (opsional)" {...register("note")} />
        {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Transaksi"}
      </Button>
    </form>
  );
}