import { api } from "./api";
import type { ApiResponse, Budget, BudgetPeriod, Paginated } from "@/types";

export interface BudgetInput {
  name: string;
  amount: number;
  period: BudgetPeriod;
  walletPublicId?: string;
  categoryPublicId?: string;
  startDate?: string;
  endDate?: string;
}

export const budgetService = {
  async list(page = 1, limit = 100): Promise<Paginated<Budget>> {
    const res = await api.get<ApiResponse<Paginated<Budget>>>("/budgets", {
      params: { page, limit },
    });
    return res.data.data;
  },

  async get(publicId: string): Promise<Budget> {
    const res = await api.get<ApiResponse<Budget>>(`/budgets/${publicId}`);
    return res.data.data;
  },

  async create(input: BudgetInput): Promise<Budget> {
    const res = await api.post<ApiResponse<Budget>>("/budgets", input);
    return res.data.data;
  },

  async update(publicId: string, input: Partial<BudgetInput>): Promise<Budget> {
    const res = await api.put<ApiResponse<Budget>>(`/budgets/${publicId}`, input);
    return res.data.data;
  },

  async delete(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/budgets/${publicId}`);
  },
};