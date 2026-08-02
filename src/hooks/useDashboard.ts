import { useQuery } from "@tanstack/react-query";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { transactionService } from "@/services/transaction";
import { useWallets } from "./useWallets";
import { useSavingsGoals } from "./useSavingsGoals";
import { useBudgets } from "./useBudgets";
import { useCategories } from "./useCategories";
import type { Transaction, Wallet } from "@/types";

export function useDashboard() {
  const now = new Date();
  const start6Months = subMonths(now, 5);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const transactionsQuery = useQuery({
    queryKey: ["dashboard", "transactions"],
    queryFn: () =>
      transactionService.list({
        startDate: start6Months.toISOString(),
        limit: 1000,
      }),
    select: (data: { data: Transaction[]; meta: unknown }) => data.data,
  });

  const walletsQuery = useWallets();
  const savingsQuery = useSavingsGoals();
  const budgetsQuery = useBudgets();
  const categoriesQuery = useCategories();

  const transactions = transactionsQuery.data ?? [];
  const wallets = walletsQuery.data ?? [];
  const goals = savingsQuery.data ?? [];
  const budgets = budgetsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const loading =
    transactionsQuery.isLoading || walletsQuery.isLoading || savingsQuery.isLoading || budgetsQuery.isLoading || categoriesQuery.isLoading;

  const totalBalance = wallets.reduce((sum, w: Wallet) => sum + Number(w.balance), 0);

  const thisMonthTx = transactions.filter((t: Transaction) => {
    const d = new Date(t.transactionDate);
    return d >= monthStart && d <= monthEnd;
  });

  const income = thisMonthTx
    .filter((t: Transaction) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = thisMonthTx
    .filter((t: Transaction) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = goals
    .filter((g) => !g.isAchieved)
    .reduce((sum, g) => sum + Number(g.currentAmount), 0);

  const spentThisMonth = expense;

  const budgetTotal = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const budgetRemaining = Math.max(budgetTotal - spentThisMonth, 0);

  const incomeExpenseByDay = (() => {
    const map = new Map<string, { date: string; income: number; expense: number }>();
    const daysInMonth = monthEnd.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), i);
      map.set(format(date, "yyyy-MM-dd"), { date: format(date, "yyyy-MM-dd"), income: 0, expense: 0 });
    }
    for (const t of thisMonthTx) {
      const key = format(new Date(t.transactionDate), "yyyy-MM-dd");
      const entry = map.get(key);
      if (!entry) continue;
      if (t.type === "INCOME") entry.income += Number(t.amount);
      if (t.type === "EXPENSE") entry.expense += Number(t.amount);
    }
    return Array.from(map.values());
  })();

  const categoryExpense = (() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    for (const t of thisMonthTx) {
      if (t.type !== "EXPENSE" || !t.category) continue;
      const existing = map.get(t.category.publicId) ?? {
        name: t.category.name,
        value: 0,
        color: t.category.color ?? "#0a0a0a",
      };
      existing.value += Number(t.amount);
      map.set(t.category.publicId, existing);
    }
    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  })();

  const monthlySpending = (() => {
    const result: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthTx = transactions.filter((t: Transaction) => {
        const d = new Date(t.transactionDate);
        return d >= start && d <= end;
      });
      result.push({
        month: format(date, "MMM"),
        income: monthTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0),
        expense: monthTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0),
      });
    }
    return result;
  })();

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    .slice(0, 6);

  const categoryMap = new Map(categories.map((c) => [c.publicId, c]));

  return {
    loading,
    totalBalance,
    income,
    expense,
    savings,
    budgetRemaining,
    budgetTotal,
    spentThisMonth,
    incomeExpenseByDay,
    categoryExpense,
    monthlySpending,
    recentTransactions,
    wallets,
    budgets,
    goals,
    categories,
    categoryMap,
  };
}