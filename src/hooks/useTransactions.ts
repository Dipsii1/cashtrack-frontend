import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transactionService, type TransactionInput, type TransactionQuery } from "@/services/transaction";
import { getErrorMessage } from "@/utils/errors";
import type { Paginated, Transaction, TransactionType } from "@/types";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (query?: TransactionQuery) => [...transactionKeys.all, "list", query] as const,
};

export function useTransactions(query: TransactionQuery = {}) {
  const params = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    startDate: query.startDate,
    endDate: query.endDate,
    walletPublicId: query.walletPublicId,
    categoryPublicId: query.categoryPublicId,
    type: query.type,
    search: query.search,
  };
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionService.list(params),
    select: (data: Paginated<Transaction>) => data,
  });
}

export function useTransaction(publicId: string, enabled = true) {
  return useQuery({
    queryKey: [...transactionKeys.all, "detail", publicId],
    queryFn: () => transactionService.get(publicId),
    enabled: enabled && !!publicId,
    select: (data) => data,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => transactionService.create(input),
    onMutate: async (newTx) => {
      await qc.cancelQueries({ queryKey: transactionKeys.all });
      const previous = qc.getQueryData<{ data: Transaction[]; meta: unknown }>(
        transactionKeys.list({ page: 1, limit: 10 })
      );
      const optimisticTx: Transaction = {
        publicId: `temp-${Date.now()}`,
        type: newTx.type,
        title: newTx.title,
        amount: newTx.amount,
        note: newTx.note ?? null,
        transactionDate: newTx.transactionDate ?? new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wallet: { publicId: newTx.walletPublicId, name: "", currency: "IDR" },
        category: null,
      };
      qc.setQueryData<{ data: Transaction[]; meta: unknown }>(
        transactionKeys.list({ page: 1, limit: 10 }),
        (old) => old ? { ...old, data: [optimisticTx, ...old.data] } : undefined
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(transactionKeys.list({ page: 1, limit: 10 }), ctx.previous);
      toast.error(getErrorMessage(_err));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Transaksi berhasil dibuat");
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: Partial<TransactionInput> }) =>
      transactionService.update(publicId, input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: transactionKeys.all });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Transaksi berhasil diperbarui");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => transactionService.delete(publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Transaksi berhasil dihapus");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}