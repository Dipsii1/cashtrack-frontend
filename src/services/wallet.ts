import { api } from "./api";
import type { ApiResponse, Paginated, Wallet } from "@/types";

export interface WalletInput {
  name: string;
  currency?: string;
  balance?: number;
  isDefault?: boolean;
}

export const walletService = {
  async list(page = 1, limit = 100): Promise<Paginated<Wallet>> {
    const res = await api.get<ApiResponse<Paginated<Wallet>>>("/wallets", {
      params: { page, limit },
    });
    return res.data.data;
  },

  async get(publicId: string): Promise<Wallet> {
    const res = await api.get<ApiResponse<Wallet>>(`/wallets/${publicId}`);
    return res.data.data;
  },

  async create(input: WalletInput): Promise<Wallet> {
    const res = await api.post<ApiResponse<Wallet>>("/wallets", input);
    return res.data.data;
  },

  async update(publicId: string, input: Partial<WalletInput>): Promise<Wallet> {
    const res = await api.put<ApiResponse<Wallet>>(`/wallets/${publicId}`, input);
    return res.data.data;
  },

  async delete(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/wallets/${publicId}`);
  },
};