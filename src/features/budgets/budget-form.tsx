"use client";
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/common/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-primitive";
import { useCreateBudget, useUpdateBudget } from "@/hooks/useBudgets";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import type { Budget, BudgetPeriod } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  walletPublicId: z.string().optional(),
  categoryPublicId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().nullable().optional(),
});

type BudgetFormValues = z.infer<typeof schema>;

interface BudgetFormProps {
  budget?: Budget;
  onSuccess?: () => void;
}

export function BudgetForm({ budget, onSuccess }: BudgetFormProps) {
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const editing = Boolean(budget);
  const isPending = createBudget.isPending || updateBudget.isPending;

  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories("EXPENSE");

const {
     register,
     handleSubmit,
     watch,
     setValue,
     control,
     formState: { errors },
   } = useForm<BudgetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: budget?.name ?? "",
      amount: budget?.amount ?? undefined,
      period: budget?.period ?? "MONTHLY",
      walletPublicId: budget?.walletId ?? "",
      categoryPublicId: budget?.categoryId ?? "",
      startDate: budget ? new Date(budget.startDate) : new Date(),
      endDate: budget?.endDate ? new Date(budget.endDate) : null,
    },
  });

  function onSubmit(values: BudgetFormValues) {
    const input = {
      name: values.name,
      amount: values.amount,
      period: values.period as BudgetPeriod,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
      ...(values.walletPublicId ? { walletPublicId: values.walletPublicId } : {}),
      ...(values.categoryPublicId ? { categoryPublicId: values.categoryPublicId } : {}),
    };
    if (editing && budget) {
      updateBudget.mutate({ publicId: budget.publicId, input }, { onSuccess: () => onSuccess?.() });
    } else {
      createBudget.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="budget-name">Nama Budget</Label>
        <Input id="budget-name" placeholder="cth: Belanja bulanan" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="budget-amount">Nominal</Label>
          <Input id="budget-amount" type="number" step="0.01" min="0" placeholder="0" {...register("amount")} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
<div className="space-y-1.5">
           <Label>Periode</Label>
           <Controller
             control={control}
             name="period"
             render={({ field }) => (
               <Select value={field.value} onValueChange={field.onChange}>
                 <SelectTrigger>
                   <SelectValue placeholder="Pilih periode" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="WEEKLY">Mingguan</SelectItem>
                   <SelectItem value="MONTHLY">Bulanan</SelectItem>
                   <SelectItem value="YEARLY">Tahunan</SelectItem>
                 </SelectContent>
               </Select>
             )}
           />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
<div className="space-y-1.5">
           <Label>Dompet</Label>
           <Controller
             control={control}
             name="walletPublicId"
             render={({ field }) => (
               <Select value={field.value} onValueChange={field.onChange}>
                 <SelectTrigger>
                   <SelectValue placeholder="Semua dompet" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="">Semua dompet</SelectItem>
                   {wallets.map((w) => (
                     <SelectItem key={w.publicId} value={w.publicId}>{w.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             )}
           />
         </div>
         <div className="space-y-1.5">
           <Label>Kategori</Label>
           <Controller
             control={control}
             name="categoryPublicId"
             render={({ field }) => (
               <Select value={field.value} onValueChange={field.onChange}>
                 <SelectTrigger>
                   <SelectValue placeholder="Semua kategori" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="">Semua kategori</SelectItem>
                   {categories.map((c) => (
                     <SelectItem key={c.publicId} value={c.publicId}>{c.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             )}
           />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Mulai</Label>
          <DatePicker
            value={watch("startDate") ?? null}
            onChange={(d) => d && setValue("startDate", d)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Selesai (opsional)</Label>
          <DatePicker
            value={watch("endDate") ?? null}
            onChange={(d) => setValue("endDate", d)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Budget"}
      </Button>
    </form>
  );
}