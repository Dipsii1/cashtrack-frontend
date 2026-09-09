import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { savingService, type SavingsGoalInput } from "@/services/saving";
import { getErrorMessage } from "@/utils/errors";
import type { SavingsGoal } from "@/types";

type SavingsListResponse = { data: SavingsGoal[]; meta: unknown };

export const savingsKeys = {
  all: ["savings-goals"] as const,
  list: () => [...savingsKeys.all, "list"] as const,
};

export function useSavingsGoals(enabled = true) {
  return useQuery({
    queryKey: savingsKeys.list(),
    queryFn: () => savingService.list(1, 100),
    enabled,
    select: (data: SavingsListResponse) => data.data,
  });
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SavingsGoalInput) => savingService.create(input),
    onSuccess: (goal) => {
      qc.setQueryData<SavingsListResponse>(savingsKeys.list(), (old) =>
        old ? { ...old, data: [goal, ...old.data] } : old
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