import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recurringService, type RecurringInput } from "@/services/recurring";
import { getErrorMessage } from "@/utils/errors";
import type { RecurringTransaction } from "@/types";

type RecurringListResponse = { data: RecurringTransaction[]; meta: unknown };

export const recurringKeys = {
  all: ["recurring-transactions"] as const,
  list: (isActive?: boolean) => [...recurringKeys.all, "list", isActive] as const,
};

export function useRecurringTransactions(isActive?: boolean, enabled = true) {
  return useQuery({
    queryKey: recurringKeys.list(isActive),
    queryFn: () => recurringService.list(1, 100, isActive),
    enabled,
    select: (data: RecurringListResponse) => data.data,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecurringInput) => recurringService.create(input),
    onSuccess: (rt) => {
      // rt baru dibuat, biasanya aktif — sentuh cache yang relevan (true & undefined),
      // lalu invalidate semua supaya varian lain (false) ikut ter-refresh
      const prepend = (old: RecurringListResponse | undefined) =>
        old ? { ...old, data: [rt, ...old.data] } : old;

      qc.setQueryData<RecurringListResponse>(recurringKeys.list(true), prepend);
      qc.setQueryData<RecurringListResponse>(recurringKeys.list(undefined), prepend);
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