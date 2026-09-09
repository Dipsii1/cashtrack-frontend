"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { IncomeExpenseChart } from "@/components/charts/line-chart";
import { CategoryPieChart } from "@/components/charts/pie-chart";
import { MonthlyBarChart } from "@/components/charts/bar-chart";
import { BudgetProgress } from "@/components/charts/budget-progress";
import { CategoryIcon } from "@/components/common/category-icon";
import { useDashboard } from "@/hooks/useDashboard";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { WalletForm } from "@/features/wallets/wallet-form";
import { BudgetForm } from "@/features/budgets/budget-form";
import { SavingsGoalForm } from "@/features/savings-goals/savings-goal-form";
import { formatCurrency } from "@/utils/format";
import { formatDate, getBudgetPeriodLabel } from "@/utils/date";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const dashboard = useDashboard();
  const [quickForm, setQuickForm] = React.useState<"transaction" | "wallet" | "budget" | "saving" | null>(null);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(new Date(), "EEEE, dd MMMM yyyy")} — Ringkasan keuangan Anda
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Saldo"
          value={formatCurrency(dashboard.totalBalance)}
          icon={Wallet}
          accent="emerald"
          loading={dashboard.loading}
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={formatCurrency(dashboard.income)}
          icon={TrendingUp}
          accent="blue"
          loading={dashboard.loading}
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={formatCurrency(dashboard.expense)}
          icon={TrendingDown}
          accent="rose"
          loading={dashboard.loading}
        />
        <StatCard
          title="Sisa Budget"
          value={formatCurrency(dashboard.budgetRemaining)}
          icon={Target}
          accent="amber"
          loading={dashboard.loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Pemasukan vs Pengeluaran</CardTitle>
            <CardDescription>Perbandingan harian bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={dashboard.incomeExpenseByDay} loading={dashboard.loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategori Pengeluaran</CardTitle>
            <CardDescription>Distribusi pengeluaran bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={dashboard.categoryExpense} loading={dashboard.loading} height={250} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Pengeluaran Bulanan</CardTitle>
              <CardDescription>6 bulan terakhir</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MonthlyBarChart data={dashboard.monthlySpending} loading={dashboard.loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget</CardTitle>
            <CardDescription>Ringkasan anggaran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : dashboard.budgets.length === 0 ? (
              <EmptyState title="Belum ada budget" description="Buat budget untuk mengontrol pengeluaran" />
            ) : (
              dashboard.budgets.slice(0, 3).map((budget) => (
                <div key={budget.publicId} className="rounded-2xl border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{budget.name}</p>
                    <Badge variant="secondary">{getBudgetPeriodLabel(budget.period)}</Badge>
                  </div>
                  <BudgetProgress
                    spent={dashboard.spentThisMonth}
                    budget={Number(budget.amount)}
                    period={getBudgetPeriodLabel(budget.period)}
                    showPercent={false}
                  />
                </div>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/budgets">Lihat semua</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
            <CardDescription>6 transaksi terakhir</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions" className="gap-1">
              Lihat semua <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {dashboard.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : dashboard.recentTransactions.length === 0 ? (
            <EmptyState title="Belum ada transaksi" description="Mulai catat transaksi pertama Anda" />
          ) : (
            <div className="divide-y">
              {dashboard.recentTransactions.map((tx) => {
                const Icon =
                  tx.type === "INCOME" ? ArrowUpRight : tx.type === "EXPENSE" ? ArrowDownRight : ArrowLeftRight;
                const isIncome = tx.type === "INCOME";
                return (
                  <div key={tx.publicId} className="flex items-center gap-3 py-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{tx.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category?.name ?? "Tanpa kategori"} • {formatDate(tx.transactionDate)}
                      </p>
                    </div>
                    <span className={cn("font-semibold text-sm", isIncome ? "text-foreground" : "text-muted-foreground")}>
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={quickForm !== null}
        onOpenChange={(open) => !open && setQuickForm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {quickForm === "transaction" && "Tambah Transaksi"}
              {quickForm === "wallet" && "Tambah Dompet"}
              {quickForm === "budget" && "Tambah Budget"}
              {quickForm === "saving" && "Tambah Target Tabungan"}
            </DialogTitle>
          </DialogHeader>
          {quickForm === "transaction" && <TransactionForm onSuccess={() => setQuickForm(null)} />}
          {quickForm === "wallet" && <WalletForm onSuccess={() => setQuickForm(null)} />}
          {quickForm === "budget" && <BudgetForm onSuccess={() => setQuickForm(null)} />}
          {quickForm === "saving" && <SavingsGoalForm onSuccess={() => setQuickForm(null)} />}
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-5 right-5 z-30 hidden lg:flex flex-col gap-2">
        <Button size="sm" variant="outline" className="shadow-lg" onClick={() => setQuickForm("saving")}>
          <PiggyBank className="h-4 w-4" /> Target
        </Button>
        <Button size="sm" variant="outline" className="shadow-lg" onClick={() => setQuickForm("budget")}>
          <Target className="h-4 w-4" /> Budget
        </Button>
        <Button size="sm" variant="outline" className="shadow-lg" onClick={() => setQuickForm("wallet")}>
          <Wallet className="h-4 w-4" /> Dompet
        </Button>
        <Button size="sm" className="shadow-lg shadow-primary/30" onClick={() => setQuickForm("transaction")}>
          <Plus className="h-4 w-4" /> Transaksi
        </Button>
      </div>
    </div>
  );
}