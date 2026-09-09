"use client";
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-primitive";
import { useCreateWallet, useUpdateWallet } from "@/hooks/useWallets";
import type { Wallet } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nama dompet wajib diisi").max(100),
  currency: z.string().min(3).max(10),
  balance: z.coerce.number().nonnegative("Saldo tidak boleh negatif").optional(),
  isDefault: z.boolean().optional(),
});

type WalletFormValues = z.infer<typeof schema>;

const currencies = [
  { value: "IDR", label: "IDR — Rupiah" },
  { value: "USD", label: "USD — Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "SGD", label: "SGD — Dollar Singapura" },
  { value: "MYR", label: "MYR — Ringgit" },
];

interface WalletFormProps {
  wallet?: Wallet;
  onSuccess?: () => void;
}

export function WalletForm({ wallet, onSuccess }: WalletFormProps) {
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const editing = Boolean(wallet);
  const isPending = createWallet.isPending || updateWallet.isPending;

const {
     register,
     handleSubmit,
     watch,
     setValue,
     control,
     formState: { errors },
   } = useForm<WalletFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: wallet?.name ?? "",
      currency: wallet?.currency ?? "IDR",
      balance: wallet?.balance ?? 0,
      isDefault: wallet?.isDefault ?? false,
    },
  });

  const isDefault = watch("isDefault");

  function onSubmit(values: WalletFormValues) {
    const input = {
      name: values.name,
      currency: values.currency,
      isDefault: values.isDefault,
      ...(!editing && { balance: values.balance }),
    };
    if (editing && wallet) {
      updateWallet.mutate({ publicId: wallet.publicId, input }, { onSuccess: () => onSuccess?.() });
    } else {
      createWallet.mutate(input, { onSuccess: () => onSuccess?.() });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="wallet-name">Nama Dompet</Label>
        <Input id="wallet-name" placeholder="cth: Dompet Utama, Tabungan, Tunai" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

<div className="space-y-1.5">
         <Label>Mata Uang</Label>
         <Controller
           control={control}
           name="currency"
           render={({ field }) => (
             <Select value={field.value} onValueChange={field.onChange}>
               <SelectTrigger>
                 <SelectValue placeholder="Pilih mata uang" />
               </SelectTrigger>
               <SelectContent>
                 {currencies.map((c) => (
                   <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           )}
         />
       </div>

      {!editing && (
        <div className="space-y-1.5">
          <Label htmlFor="wallet-balance">Saldo Awal</Label>
          <Input
            id="wallet-balance"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            {...register("balance")}
          />
          {errors.balance && <p className="text-xs text-destructive">{errors.balance.message}</p>}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border p-3">
        <div>
          <Label htmlFor="wallet-default">Dompet Utama</Label>
          <p className="text-xs text-muted-foreground">Jadikan sebagai dompet default</p>
        </div>
        <Switch id="wallet-default" checked={isDefault} onCheckedChange={(v) => setValue("isDefault", v)} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Dompet"}
      </Button>
    </form>
  );
}