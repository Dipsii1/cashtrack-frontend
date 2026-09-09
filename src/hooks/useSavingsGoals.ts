import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  savingService,
  type SavingsGoalInput,
  type SavingsContributionInput,
} from "@/services/saving";
import { getErrorMessage } from "@/utils/errors";
import type { SavingsGoal, SavingsContribution } from "@/types";

export const savingsKeys = {
  all: ["savings-goals"] as const,
  list: () => [...savingsKeys.all, "list"] as const,
};

async function fetchGoalsWithContributions(): Promise<SavingsGoal[]> {
  const [goalsRes, contributionsRes] = await Promise.all([
    savingService.list(1, 100),
    savingService.listContributions(),
  ]);

  const contributionsByGoal = new Map<string, SavingsContribution[]>();
  for (const c of contributionsRes.data) {
    const goalId = c.savingsGoal.publicId;
    const arr = contributionsByGoal.get(goalId) ?? [];
    arr.push(c);
    contributionsByGoal.set(goalId, arr);
  }

  return goalsRes.data.map((goal) => ({
    ...goal,
    contributions: contributionsByGoal.get(goal.publicId) ?? [],
  }));
}

export function useSavingsGoals(enabled = true) {
  return useQuery({
    queryKey: savingsKeys.list(),
    queryFn: fetchGoalsWithContributions,
    enabled,
  });
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SavingsGoalInput) => savingService.create(input),
    onSuccess: (goal) => {
      qc.setQueryData<SavingsGoal[]>(savingsKeys.list(), (old) =>
        old ? [{ ...goal, contributions: goal.contributions ?? [] }, ...old] : old
      );
      qc.invalidateQueries({ queryKey: savingsKeys.all });
      toast.success("Tabungan berhasil dibuat");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      input,
    }: {
      publicId: string;
      input: Partial<SavingsGoalInput> & { currentAmount?: number; isAchieved?: boolean };
    }) => savingService.update(publicId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savingsKeys.all });
      toast.success("Tabungan berhasil diperbarui");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => savingService.delete(publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savingsKeys.all });
      toast.success("Tabungan berhasil dihapus");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateSavingsContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalPublicId,
      input,
    }: {
      goalPublicId: string;
      input: SavingsContributionInput;
    }) => savingService.createContribution(goalPublicId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savingsKeys.all });
      toast.success("Kontribusi berhasil ditambahkan");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteSavingsContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => savingService.deleteContribution(publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savingsKeys.all });
      toast.success("Kontribusi berhasil dihapus");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}