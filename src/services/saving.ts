import { api } from "./api";
import type { ApiResponse, Paginated, SavingsGoal, SavingsContribution } from "@/types";

export interface SavingsGoalInput {
  name: string;
  targetAmount: number;
  targetDate?: string;
}

export interface SavingsContributionInput {
  walletPublicId?: string;
  amount: number;
  note?: string;
  contributionDate?: string;
}

export const savingService = {
  async list(page = 1, limit = 100): Promise<Paginated<SavingsGoal>> {
    const res = await api.get<ApiResponse<Paginated<SavingsGoal>>>("/savings-goals", {
      params: { page, limit },
    });
    return res.data.data;
  },

  async get(publicId: string): Promise<SavingsGoal> {
    const res = await api.get<ApiResponse<SavingsGoal>>(`/savings-goals/${publicId}`);
    return res.data.data;
  },

  async create(input: SavingsGoalInput): Promise<SavingsGoal> {
    const res = await api.post<ApiResponse<SavingsGoal>>("/savings-goals", input);
    return res.data.data;
  },

  async update(
    publicId: string,
    input: Partial<SavingsGoalInput> & { currentAmount?: number; isAchieved?: boolean }
  ): Promise<SavingsGoal> {
    const res = await api.put<ApiResponse<SavingsGoal>>(`/savings-goals/${publicId}`, input);
    return res.data.data;
  },

  async delete(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/savings-goals/${publicId}`);
  },

  async listContributions(goalPublicId?: string): Promise<Paginated<SavingsContribution>> {
    const res = await api.get<ApiResponse<Paginated<SavingsContribution>>>(
      "/savings-contributions",
      { params: { page: 1, limit: 100, savingsGoalPublicId: goalPublicId ?? undefined } }
    );
    return res.data.data;
  },

  async createContribution(
    goalPublicId: string,
    input: SavingsContributionInput
  ): Promise<SavingsContribution> {
    const res = await api.post<ApiResponse<SavingsContribution>>(
      "/savings-contributions",
      { savingsGoalPublicId: goalPublicId, ...input }
    );
    return res.data.data;
  },

  async deleteContribution(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/savings-contributions/${publicId}`);
  },
};
