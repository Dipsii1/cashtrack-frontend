"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  X,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-primitive";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { CategoryIcon } from "@/components/common/category-icon";
import { DatePicker } from "@/components/common/date-picker";
import { SearchInput } from "@/components/common/search-input";
import { TransactionForm } from "@/features/transactions/transaction-form";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/utils/format";
import { formatDate, getTransactionTypeLabel } from "@/utils/date";
import { cn } from "@/lib/utils";

type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export default function TransactionsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | "">("");
  const [walletFilter, setWalletFilter] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const {
    data: transactions = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } },
    isLoading,
    refetch,
  } = useTransactions({
    page,
    limit: 10,
    search: search || undefined,
    type: typeFilter || undefined,
    walletPublicId: walletFilter || undefined,
    categoryPublicId: categoryFilter || undefined,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  });

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();

  const [editingTx, setEditingTx] = React.useState<typeof transactions.data[0] | null>(null);
  const [creatingTx, setCreatingTx] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const hasFilters = typeFilter || walletFilter || categoryFilter || startDate || endDate;

  function handleDelete(publicId: string) {
    deleteTx.mutate(publicId, { onSuccess: () => refetch() });
  }

  function handleEdit(tx: typeof transactions.data[0]) {
    setEditingTx(tx);
  }

  function clearFilters() {
    setTypeFilter("");
    setWalletFilter("");
    setCategoryFilter("");
    setStartDate(null);
    setEndDate(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        description="Kelola semua transaksi keuangan"
        icon={CreditCard}
        actions={
          <Dialog open={creatingTx} onOpenChange={setCreatingTx}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Transaksi</DialogTitle>
                <DialogDescription>Catat pemasukan, pengeluaran, atau transfer</DialogDescription>
              </DialogHeader>
              <TransactionForm onSuccess={() => { setCreatingTx(false); refetch(); }} />
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="overflow-hidden">
        <div className="p-4 border-b space-y-4">
          <div className="relative max-w-sm">
            <SearchInput
              placeholder="Cari judul, catatan..."
              value={search}
              onChange={setSearch}
              onClear={() => setSearch("")}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionType | "")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua</SelectItem>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={walletFilter} onValueChange={setWalletFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua dompet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua dompet</SelectItem>
                {wallets.map((w) => (
                  <SelectItem key={w.publicId} value={w.publicId}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.publicId} value={c.publicId}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-2">
              <Filter className="h-4 w-4" />
              {hasFilters && <span className="text-foreground">●</span>}
            </Button>

            <Button variant="outline" className="gap-2" onClick={clearFilters} disabled={!hasFilters}>
              <X className="h-4 w-4" /> Reset
            </Button>
          </div>

{filtersOpen && (
             <AnimatePresence>
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="space-y-3 p-3 rounded-xl bg-muted/30">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Dari Tanggal</Label>
                  <DatePicker value={startDate} onChange={setStartDate} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sampai Tanggal</Label>
                  <DatePicker value={endDate} onChange={setEndDate} />
                </div>
              </div>
</motion.div>
             </AnimatePresence>
           )}
         </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Dompet</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="w-[100px]">Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="w-[80px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <EmptyState title="Tidak ada transaksi" description="Coba ubah filter atau tambah transaksi baru" />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.data.map((tx) => (
                  <TableRow key={tx.publicId}>
                    <TableCell>
                      {tx.category && (
                        <CategoryIcon icon={tx.category.icon} color={tx.category.color} size="sm" />
                      )}
                    </TableCell>
                    <TableCell>{tx.category?.name ?? "—"}</TableCell>
                    <TableCell className="font-medium">{tx.wallet.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{tx.title}</p>
                        {tx.note && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.note}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(tx.transactionDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.type === "INCOME" ? "success" :
                          tx.type === "EXPENSE" ? "destructive" :
                          "info"
                        }
                      >
                        {getTransactionTypeLabel(tx.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(tx)}>
<motion.svg
                             whileTap={{ scale: 0.95 }}
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </motion.svg>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Hapus Transaksi?"
                          description={`Transaksi "${tx.title}" akan dihapus permanen.`}
                          onConfirm={() => handleDelete(tx.publicId)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {transactions.meta.totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <Pagination
              page={transactions.meta.page}
              totalPages={transactions.meta.totalPages}
              total={transactions.meta.total}
              limit={transactions.meta.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      <Dialog open={editingTx !== null} onOpenChange={(open) => !open && setEditingTx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
            <DialogDescription>Perbarui detail transaksi</DialogDescription>
          </DialogHeader>
          {editingTx && <TransactionForm transaction={editingTx} onSuccess={() => { setEditingTx(null); refetch(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}