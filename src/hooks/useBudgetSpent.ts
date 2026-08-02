import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import type { Budget, Transaction } from "@/types";

export function useBudgetSpent(budgets: Budget[]) {
  const now = new Date();

  const queries = useQuery({
    queryKey: ["budget-spent"],
    queryFn: () =>
      transactionService.list({
        startDate: startOfYear(now).toISOString(),
        limit: 1000,
      }),
    select: (data: { data: Transaction[]; meta: unknown }) => data.data,
  });

  function spentFor(budget: Budget): number {
    const transactions = queries.data ?? [];
    let range: { start: Date; end: Date };
    switch (budget.period) {
      case "WEEKLY":
        range = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        break;
      case "YEARLY":
        range = { start: startOfYear(now), end: endOfYear(now) };
        break;
      default:
        range = { start: startOfMonth(now), end: endOfMonth(now) };
    }

    return transactions
      .filter((t: Transaction) => {
        if (t.type !== "EXPENSE") return false;
        const d = new Date(t.transactionDate);
        if (d < range.start || d > range.end) return false;
        if (budget.categoryId && t.category?.publicId !== budget.categoryId) return false;
        if (budget.walletId && t.wallet.publicId !== budget.walletId) return false;
        return true;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  return {
    loading: queries.isLoading,
    spentFor,
    totalSpent: (queries.data ?? []).reduce((sum: number, t: Transaction) => (t.type === "EXPENSE" ? sum + Number(t.amount) : sum), 0),
  };
}