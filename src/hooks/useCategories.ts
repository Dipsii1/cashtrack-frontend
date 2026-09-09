import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService, type CategoryInput } from "@/services/category";
import { getErrorMessage } from "@/utils/errors";
import type { Category, CategoryType } from "@/types";

type CategoryListResponse = { data: Category[]; meta: unknown };

export const categoryKeys = {
  all: ["categories"] as const,
  list: (type?: CategoryType) => [...categoryKeys.all, "list", type ?? "all"] as const,
};

export function useCategories(type?: CategoryType, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: () => categoryService.list(type, 1, 100),
    enabled,
    select: (data: CategoryListResponse) => data.data,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoryService.create(input),
    onSuccess: (category) => {
      const prepend = (old: CategoryListResponse | undefined) =>
        old ? { ...old, data: [category, ...old.data] } : old;

      qc.setQueryData<CategoryListResponse>(categoryKeys.list(category.type), prepend);
      qc.setQueryData<CategoryListResponse>(categoryKeys.list(), prepend);
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Kategori berhasil dibuat");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: Partial<CategoryInput> }) =>
      categoryService.update(publicId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Kategori berhasil diperbarui");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => categoryService.delete(publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Kategori berhasil dihapus");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}