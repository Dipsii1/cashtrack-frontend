import { api } from "./api";
import type { ApiResponse, Frequency, Paginated, RecurringTransaction, TransactionType } from "@/types";

export interface RecurringInput {
  walletPublicId: string;
  categoryPublicId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  interval?: number;
  nextRunDate?: string;
  isActive?: boolean;
}

export const recurringService = {
  async list(page = 1, limit = 100, isActive?: boolean): Promise<Paginated<RecurringTransaction>> {
    const res = await api.get<ApiResponse<Paginated<RecurringTransaction>>>("/recurring-transactions", {
      params: { page, limit, isActive: isActive === undefined ? undefined : String(isActive) },
    });
    return res.data.data;
  },

  async get(publicId: string): Promise<RecurringTransaction> {
    const res = await api.get<ApiResponse<RecurringTransaction>>(`/recurring-transactions/${publicId}`);
    return res.data.data;
  },

  async create(input: RecurringInput): Promise<RecurringTransaction> {
    const res = await api.post<ApiResponse<RecurringTransaction>>("/recurring-transactions", input);
    return res.data.data;
  },

  async update(publicId: string, input: Partial<RecurringInput>): Promise<RecurringTransaction> {
    const res = await api.put<ApiResponse<RecurringTransaction>>(`/recurring-transactions/${publicId}`, input);
    return res.data.data;
  },

  async delete(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/recurring-transactions/${publicId}`);
  },
};