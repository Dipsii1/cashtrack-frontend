"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tags, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { CategoryIcon } from "@/components/common/category-icon";
import { CategoryForm } from "@/features/categories/category-form";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { getCategoryTypeLabel } from "@/utils/date";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { data: allCategories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [creating, setCreating] = React.useState(false);

  const expenses = allCategories.filter((c) => c.type === "EXPENSE");
  const incomes = allCategories.filter((c) => c.type === "INCOME");

function CategoryGrid({ categories, accent }: { categories: Category[]; accent?: string }) {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      );
    }
    if (categories.length === 0) {
      return <EmptyState title="Belum ada kategori" description="Buat kategori baru untuk mengelompokkan transaksi" actionLabel="Tambah Kategori" onAction={() => setCreating(true)} />;
    }
    return (
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.publicId}
              layout
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
              className="group relative rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <CategoryIcon icon={category.icon} color={category.color} size="lg" />
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(category)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <ConfirmDialog
                      trigger={
                        <button
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Hapus ${category.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      }
                      title="Hapus Kategori?"
                      description={`Kategori "${category.name}" akan dihapus. Transaksi dengan kategori ini akan menjadi tanpa kategori.`}
                      onConfirm={() => deleteCategory.mutate(category.publicId)}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{getCategoryTypeLabel(category.type)}</p>
                </div>
              </div>
              <div
                className={cn("absolute bottom-0 left-4 right-4 h-0.5 rounded-full", accent)}
              />
            </motion.div>
          ))}
        </div>
        </AnimatePresence>
      );
    }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        description="Kelola kategori pemasukan dan pengeluaran"
        icon={Tags}
        actions={
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kategori</DialogTitle>
                <DialogDescription>Buat kategori baru dengan ikon dan warna</DialogDescription>
              </DialogHeader>
              <CategoryForm onSuccess={() => setCreating(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">Pengeluaran ({expenses.length})</TabsTrigger>
          <TabsTrigger value="income">Pemasukan ({incomes.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="expense">
          <CategoryGrid categories={expenses} accent="bg-foreground" />
        </TabsContent>
        <TabsContent value="income">
          <CategoryGrid categories={incomes} accent="bg-muted-foreground" />
        </TabsContent>
      </Tabs>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>Perbarui informasi kategori</DialogDescription>
          </DialogHeader>
          {editing && <CategoryForm category={editing} onSuccess={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}