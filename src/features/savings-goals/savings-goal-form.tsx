"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/common/date-picker";
import { useCreateSavingsGoal, useUpdateSavingsGoal } from "@/hooks/useSavingsGoals";
import type { SavingsGoal } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  targetAmount: z.coerce.number().positive("Target harus lebih dari 0"),
  targetDate: z.date().nullable().optional(),
});

type SavingsGoalFormValues = z.infer<typeof schema>;

interface SavingsGoalFormProps {
  goal?: SavingsGoal;
  onSuccess?: () => void;
}

export function SavingsGoalForm({ goal, onSuccess }: SavingsGoalFormProps) {
  const createGoal = useCreateSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  const editing = Boolean(goal);
  const isPending = createGoal.isPending || updateGoal.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: goal?.name ?? "",
      targetAmount: goal?.targetAmount ?? undefined,
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : null,
    },
  });

  function onSubmit(values: SavingsGoalFormValues) {
    const input = {
      name: values.name,
      targetAmount: values.targetAmount,
      ...(values.targetDate ? { targetDate: values.targetDate.toISOString() } : {}),
    };
    if (editing && goal) {
      updateGoal.mutate({ publicId: goal.publicId, input }, { onSuccess: () => onSuccess?.() });
    } else {
      createGoal.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="goal-name">Nama Target</Label>
        <Input id="goal-name" placeholder="cth: Dana darurat, Liburan" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="goal-amount">Target Nominal</Label>
        <Input id="goal-amount" type="number" step="0.01" min="0" placeholder="0" {...register("targetAmount")} />
        {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Target Selesai (opsional)</Label>
        <DatePicker
          value={watch("targetDate") ?? null}
          onChange={(d) => setValue("targetDate", d)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Target"}
      </Button>
    </form>
  );
}