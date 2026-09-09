"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/common/date-picker";
import { useCreateSavingsContribution, useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useWallets } from "@/hooks/useWallets";

const schema = z.object({
  savingsGoalPublicId: z.string().min(1, "Tujuan tabungan wajib dipilih"),
  walletPublicId: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Jumlah harus lebih dari 0"),
  note: z.string().optional(),
  contributionDate: z.date().nullable().optional(),
});

type SavingsContributionFormValues = z.infer<typeof schema>;

interface SavingsContributionFormProps {
  goalPublicId?: string;
  onSuccess?: () => void;
}

export function SavingsContributionForm({ goalPublicId, onSuccess }: SavingsContributionFormProps) {
  const createContribution = useCreateSavingsContribution();
  const { data: goals = [] } = useSavingsGoals();
  const { data: wallets = [] } = useWallets();
  const isPending = createContribution.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SavingsContributionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      savingsGoalPublicId: goalPublicId ?? "",
      walletPublicId: "",
      amount: undefined,
      note: "",
      contributionDate: null,
    },
  });

  function onSubmit(values: SavingsContributionFormValues) {
    const input = {
      ...(values.walletPublicId ? { walletPublicId: values.walletPublicId } : {}),
      amount: values.amount,
      ...(values.note ? { note: values.note } : {}),
      ...(values.contributionDate
        ? { contributionDate: values.contributionDate.toISOString() }
        : {}),
    };
    createContribution.mutate(
      { goalPublicId: values.savingsGoalPublicId, input },
      { onSuccess: () => onSuccess?.() }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {goalPublicId ? (
        <input type="hidden" value={goalPublicId} {...register("savingsGoalPublicId")} />
      ) : (
        <div className="space-y-1.5">
          <Label>Tujuan Tabungan</Label>
          <Select
            placeholder="Pilih tujuan tabungan"
            options={goals.map((g) => ({ value: g.publicId, label: g.name }))}
            {...register("savingsGoalPublicId")}
          />
          {errors.savingsGoalPublicId && (
            <p className="text-xs text-destructive">{errors.savingsGoalPublicId.message}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Dompet (opsional)</Label>
        <Select
          placeholder="Tanpa dompet"
          options={[
            { value: "", label: "Tanpa dompet" },
            ...wallets.map((w) => ({
              value: w.publicId,
              label: `${w.name} (${w.currency})`,
            })),
          ]}
          {...register("walletPublicId")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contribution-amount">Jumlah</Label>
        <Input
          id="contribution-amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contribution-note">Catatan (opsional)</Label>
        <Textarea
          id="contribution-note"
          placeholder="Catatan..."
          {...register("note")}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Tanggal (opsional)</Label>
        <DatePicker
          value={watch("contributionDate") ?? null}
          onChange={(d) => setValue("contributionDate", d)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Tambah Kontribusi"}
      </Button>
    </form>
  );
}
