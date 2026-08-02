import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletService, type WalletInput } from "@/services/wallet";
import { getErrorMessage } from "@/utils/errors";
import type { Wallet } from "@/types";

export const walletKeys = {
  all: ["wallets"] as const,
  list: () => [...walletKeys.all, "list"] as const,
};

export function useWallets(enabled = true) {
  return useQuery({
    queryKey: walletKeys.list(),
    queryFn: () => walletService.list(1, 100),
    enabled,
    select: (data: { data: Wallet[]; meta: unknown }) => data.data,
  });
}

export function useCreateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WalletInput) => walletService.create(input),
    onSuccess: (wallet) => {
      qc.setQueryData<Wallet[]>(walletKeys.list(), (old) => [wallet, ...(old ?? [])]);
      qc.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Wallet berhasil dibuat");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: Partial<WalletInput> }) =>
      walletService.update(publicId, input),
    onSuccess: (updated) => {
      qc.setQueryData<Wallet[]>(walletKeys.list(), (old) =>
        old?.map((w) => (w.publicId === updated.publicId ? updated : w))
      );
      toast.success("Wallet berhasil diperbarui");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => walletService.delete(publicId),
    onMutate: async (publicId) => {
      await qc.cancelQueries({ queryKey: walletKeys.list() });
      const previous = qc.getQueryData<Wallet[]>(walletKeys.list());
      qc.setQueryData<Wallet[]>(walletKeys.list(), (old) => old?.filter((w) => w.publicId !== publicId));
      return { previous };
    },
    onError: (_err, _publicId, ctx) => {
      if (ctx?.previous) qc.setQueryData(walletKeys.list(), ctx.previous);
      toast.error(getErrorMessage(_err));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Wallet berhasil dihapus");
    },
  });
}