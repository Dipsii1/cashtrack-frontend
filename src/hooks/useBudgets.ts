import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetService, type BudgetInput } from "@/services/budget";
import { getErrorMessage } from "@/utils/errors";
import type { Budget, BudgetPeriod } from "@/types";

export const budgetKeys = {
  all: ["budgets"] as const,
  list: () => [...budgetKeys.all, "list"] as const,
};

export function useBudgets(enabled = true) {
  return useQuery({
    queryKey: budgetKeys.list(),
    queryFn: () => budgetService.list(1, 100),
    enabled,
    select: (data: { data: Budget[]; meta: unknown }) => data.data,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetInput) => budgetService.create(input),
    onSuccess: (budget) => {
      qc.setQueryData<Budget[]>(budgetKeys.list(), (old) => [budget, ...(old ?? [])]);
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      toast.success("Budget berhasil dibuat");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: Partial<BudgetInput> }) =>
      budgetService.update(publicId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      toast.success("Budget berhasil diperbarui");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => budgetService.delete(publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      toast.success("Budget berhasil dihapus");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}