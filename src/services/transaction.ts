import { api } from "./api";
import type { ApiResponse, Paginated, Transaction, TransactionType } from "@/types";

export interface TransactionInput {
  walletPublicId: string;
  categoryPublicId?: string;
  type: TransactionType;
  title: string;
  amount: number;
  note?: string;
  transactionDate?: string;
}

export interface TransactionQuery {
  startDate?: string;
  endDate?: string;
  walletPublicId?: string;
  categoryPublicId?: string;
  type?: TransactionType;
  search?: string;
  page?: number;
  limit?: number;
}

export const transactionService = {
  async list(query: TransactionQuery = {}): Promise<Paginated<Transaction>> {
    const res = await api.get<ApiResponse<Paginated<Transaction>>>("/transactions", {
      params: { ...query },
    });
    return res.data.data;
  },

  async get(publicId: string): Promise<Transaction> {
    const res = await api.get<ApiResponse<Transaction>>(`/transactions/${publicId}`);
    return res.data.data;
  },

  async create(input: TransactionInput): Promise<Transaction> {
    const res = await api.post<ApiResponse<Transaction>>("/transactions", input);
    return res.data.data;
  },

  async update(publicId: string, input: Partial<TransactionInput>): Promise<Transaction> {
    const res = await api.put<ApiResponse<Transaction>>(`/transactions/${publicId}`, input);
    return res.data.data;
  },

  async delete(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/transactions/${publicId}`);
  },
};