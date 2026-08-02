"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/common/date-picker";
import { cn } from "@/lib/utils";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { useCreateRecurring, useUpdateRecurring } from "@/hooks/useRecurring";
import type { Frequency, RecurringTransaction } from "@/types";

const schema = z.object({
  walletPublicId: z.string().min(1, "Pilih dompet"),
  categoryPublicId: z.string().optional(),
  title: z.string().min(1, "Judul wajib diisi").max(200),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  interval: z.coerce.number().int().min(1, "Minimal 1").max(365),
  nextRunDate: z.date().optional(),
});

type RecurringFormValues = z.infer<typeof schema>;

const frequencies: { value: Frequency; label: string }[] = [
  { value: "DAILY", label: "Harian" },
  { value: "WEEKLY", label: "Mingguan" },
  { value: "MONTHLY", label: "Bulanan" },
  { value: "YEARLY", label: "Tahunan" },
];

interface RecurringFormProps {
  recurring?: RecurringTransaction;
  onSuccess?: () => void;
}

export function RecurringForm({ recurring, onSuccess }: RecurringFormProps) {
  const createRecurring = useCreateRecurring();
  const updateRecurring = useUpdateRecurring();
  const editing = Boolean(recurring);
  const isPending = createRecurring.isPending || updateRecurring.isPending;

  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      walletPublicId: recurring?.wallet.publicId ?? "",
      categoryPublicId: recurring?.category?.publicId ?? "",
      title: recurring?.title ?? "",
      amount: recurring?.amount ?? undefined,
      type: recurring?.type === "TRANSFER" ? "EXPENSE" : (recurring?.type ?? "EXPENSE"),
      frequency: recurring?.frequency ?? "MONTHLY",
      interval: recurring?.interval ?? 1,
      nextRunDate: recurring ? new Date(recurring.nextRunDate) : new Date(),
    },
  });

  const type = watch("type");
  const filteredCategories = categories.filter((c) =>
    type === "INCOME" ? c.type === "INCOME" : c.type === "EXPENSE"
  );

  function onSubmit(values: RecurringFormValues) {
    const input = {
      walletPublicId: values.walletPublicId,
      title: values.title,
      amount: values.amount,
      type: values.type,
      frequency: values.frequency,
      interval: values.interval,
      nextRunDate: values.nextRunDate?.toISOString(),
      ...(values.categoryPublicId ? { categoryPublicId: values.categoryPublicId } : {}),
    };
    if (editing && recurring) {
      updateRecurring.mutate({ publicId: recurring.publicId, input }, { onSuccess: () => onSuccess?.() });
    } else {
      createRecurring.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(["EXPENSE", "INCOME"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue("type", t, { shouldValidate: true })}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl border py-2.5 text-sm font-medium transition-all",
              type === t
                ? t === "EXPENSE"
                  ? "border-transparent bg-foreground text-background"
                  : "border-transparent bg-foreground text-background"
                : "hover:bg-muted"
            )}
          >
            {t === "EXPENSE" ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
            {t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label>Dompet</Label>
        <select
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          {...register("walletPublicId")}
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rt-title">Judul</Label>
        <Input id="rt-title" placeholder="cth: Langganan Netflix" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rt-amount">Nominal</Label>
          <Input id="rt-amount" type="number" step="0.01" min="0" placeholder="0" {...register("amount")} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Frekuensi</Label>
          <select
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            {...register("frequency")}
          >
            {frequencies.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rt-interval">Interval (x)</Label>
          <Input id="rt-interval" type="number" min="1" max="365" placeholder="1" {...register("interval")} />
          {errors.interval && <p className="text-xs text-destructive">{errors.interval.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Mulai Berikutnya</Label>
          <DatePicker
            value={watch("nextRunDate") ?? null}
            onChange={(d) => d && setValue("nextRunDate", d)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Transaksi Berkala"}
      </Button>
    </form>
  );
}