"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { CategoryIcon } from "@/components/common/category-icon";
import { cn } from "@/lib/utils";
import type { Category, CategoryType } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Format warna tidak valid").optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

type CategoryFormValues = z.infer<typeof schema>;

const presetColors = ["#0a0a0a", "#262626", "#404040", "#525252", "#737373", "#a3a3a3", "#d4d4d4", "#ededed"];

const presetIcons = ["shopping", "food", "transport", "home", "gaming", "travel", "health", "education", "work", "savings", "salary", "coffee", "movie", "phone", "gift", "other"];

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const editing = Boolean(category);
  const isPending = createCategory.isPending || updateCategory.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      icon: category?.icon ?? "other",
      color: category?.color ?? "#0a0a0a",
      type: category?.type ?? "EXPENSE",
    },
  });

  const color = watch("color");
  const icon = watch("icon");
  const type = watch("type");

  function onSubmit(values: CategoryFormValues) {
    const input = {
      name: values.name,
      icon: values.icon || undefined,
      color: values.color || undefined,
      type: values.type as CategoryType,
    };
    if (editing && category) {
      updateCategory.mutate({ publicId: category.publicId, input }, { onSuccess: () => onSuccess?.() });
    } else {
      createCategory.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border p-3">
        <CategoryIcon icon={icon} color={color} size="lg" />
        <div className="flex-1">
          <p className="font-medium">{watch("name") || "Nama kategori"}</p>
          <p className="text-xs text-muted-foreground">{type === "INCOME" ? "Pemasukan" : "Pengeluaran"}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category-name">Nama Kategori</Label>
        <Input id="category-name" placeholder="cth: Makanan, Transportasi" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Tipe</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["EXPENSE", "INCOME"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("type", t, { shouldValidate: true })}
              className={cn(
                "rounded-2xl border py-2 text-sm font-medium transition-all",
type === t
                ? t === "EXPENSE"
                  ? "border-transparent bg-foreground text-background"
                  : "border-transparent bg-foreground text-background"
                : "hover:bg-muted"
              )}
            >
              {t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Ikon</Label>
        <div className="grid grid-cols-8 gap-1.5">
          {presetIcons.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setValue("icon", iconName, { shouldValidate: true })}
              className={cn(
                "flex items-center justify-center rounded-xl border p-1.5 transition-all",
                icon === iconName ? "border-primary bg-primary/10" : "hover:bg-muted"
              )}
            >
              <CategoryIcon icon={iconName} color={color} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Warna</Label>
        <div className="flex flex-wrap gap-2">
          {presetColors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c, { shouldValidate: true })}
              className={cn(
                "h-8 w-8 rounded-full transition-transform hover:scale-110",
                color === c && "ring-2 ring-primary ring-offset-2"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Warna ${c}`}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Kategori"}
      </Button>
    </form>
  );
}