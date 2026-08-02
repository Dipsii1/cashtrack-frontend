import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recurringService, type RecurringInput } from "@/services/recurring";
import { getErrorMessage } from "@/utils/errors";
import type { RecurringTransaction } from "@/types";

export const recurringKeys = {
  all: ["recurring-transactions"] as const,
  list: (isActive?: boolean) => [...recurringKeys.all, "list", isActive] as const,
};

export function useRecurringTransactions(isActive?: boolean, enabled = true) {
  return useQuery({
    queryKey: recurringKeys.list(isActive),
    queryFn: () => recurringService.list(1, 100, isActive),
    enabled,
    select: (data: { data: RecurringTransaction[]; meta: unknown }) => data.data,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecurringInput) => recurringService.create(input),
    onSuccess: (rt) => {
      qc.setQueryData<RecurringTransaction[]>(recurringKeys.list(), (old) => [rt, ...(old ?? [])]);
      qc.invalidateQueries({ queryKey: recurringKeys.all });
      toast.success("Transaksi berkala berhasil dibuat");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: Partial<RecurringInput> }) =>
      recurringService.update(publicId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all });
      toast.success("Transaksi berkala berhasil diperbarui");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => recurringService.delete(publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all });
      toast.success("Transaksi berkala berhasil dihapus");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}