import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ApiResponse } from "@/types";
import type { Transaction, Wallet, Budget, SavingsGoal, Category } from "@/types";

interface DashboardData {
  totalBalance: number;
  income: number;
  expense: number;
  savings: number;
  budgetRemaining: number;
  budgetTotal: number;
  spentThisMonth: number;
  incomeExpenseByDay: { date: string; income: number; expense: number }[];
  categoryExpense: { name: string; value: number; color: string }[];
  monthlySpending: { month: string; income: number; expense: number }[];
  recentTransactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  goals: SavingsGoal[];
  categories: Category[];
  categoryMap: Record<string, Category>;
}

export function useDashboard() {
  const query = useQuery<ApiResponse<DashboardData>>({
    queryKey: ["dashboard"],
    queryFn: () => api.get<ApiResponse<DashboardData>>("/dashboard").then((res) => res.data),
  });

  const data = query.data?.data;
  const wallets = data?.wallets ?? [];
  const goals = data?.goals ?? [];
  const budgets = data?.budgets ?? [];
  const categories = data?.categories ?? [];
  const categoryMap = new Map(Object.entries(data?.categoryMap ?? {})) as Map<string, Category>;

  return {
    loading: query.isLoading,
    totalBalance: data?.totalBalance ?? 0,
    income: data?.income ?? 0,
    expense: data?.expense ?? 0,
    savings: data?.savings ?? 0,
    budgetRemaining: data?.budgetRemaining ?? 0,
    budgetTotal: data?.budgetTotal ?? 0,
    spentThisMonth: data?.spentThisMonth ?? 0,
    incomeExpenseByDay: data?.incomeExpenseByDay ?? [],
    categoryExpense: data?.categoryExpense ?? [],
    monthlySpending: data?.monthlySpending ?? [],
    recentTransactions: data?.recentTransactions ?? [],
    wallets,
    budgets,
    goals,
    categories,
    categoryMap,
    refetch: query.refetch,
  };
}
