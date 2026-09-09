"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useCreateAttachment } from "@/hooks/useAttachments";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/utils/format";

const mimeTypeOptions = [
  { value: "image/png", label: "image/png" },
  { value: "image/jpeg", label: "image/jpeg" },
  { value: "image/gif", label: "image/gif" },
  { value: "application/pdf", label: "application/pdf" },
  { value: "application/octet-stream", label: "application/octet-stream" },
  { value: "text/csv", label: "text/csv" },
];

const schema = z.object({
  transactionPublicId: z
    .string()
    .optional()
    .or(z.literal("")),
  fileName: z.string().min(1, "Nama file wajib diisi").max(255),
  fileUrl: z.string().url("URL tidak valid").max(2048),
  mimeType: z.string().min(1, "Tipe file wajib dipilih").max(100),
  fileSize: z.coerce.number().int().nonnegative("Ukuran file tidak valid"),
});

type AttachmentFormValues = z.infer<typeof schema>;

interface AttachmentFormProps {
  onSuccess?: () => void;
}

export function AttachmentForm({ onSuccess }: AttachmentFormProps) {
  const createAttachment = useCreateAttachment();
  const { data: txData } = useTransactions({ page: 1, limit: 100 });
  const transactions = txData?.data ?? [];
  const isPending = createAttachment.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttachmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionPublicId: "",
      fileName: "",
      fileUrl: "",
      mimeType: "",
      fileSize: undefined,
    },
  });

  function onSubmit(values: AttachmentFormValues) {
    const input = {
      ...(values.transactionPublicId
        ? { transactionPublicId: values.transactionPublicId }
        : {}),
      fileName: values.fileName,
      fileUrl: values.fileUrl,
      mimeType: values.mimeType,
      fileSize: Math.round(values.fileSize),
    };
    createAttachment.mutate(input, { onSuccess: () => onSuccess?.() });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Transaksi (opsional)</Label>
        <Select
          placeholder="Pilih transaksi (opsional)"
          options={[
            { value: "", label: "Tanpa transaksi" },
            ...transactions.map((t) => ({
              value: t.publicId,
              label: `${t.title} — ${formatCurrency(t.amount, t.wallet.currency)}`,
            })),
          ]}
          {...register("transactionPublicId")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="attachment-name">Nama File</Label>
        <Input
          id="attachment-name"
          placeholder="cth: struk-belanja.pdf"
          {...register("fileName")}
        />
        {errors.fileName && (
          <p className="text-xs text-destructive">{errors.fileName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="attachment-url">URL File</Label>
        <Input
          id="attachment-url"
          placeholder="https://..."
          {...register("fileUrl")}
        />
        {errors.fileUrl && (
          <p className="text-xs text-destructive">{errors.fileUrl.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Tipe File</Label>
        <Select
          placeholder="Pilih tipe file"
          options={mimeTypeOptions}
          {...register("mimeType")}
        />
        {errors.mimeType && (
          <p className="text-xs text-destructive">{errors.mimeType.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="attachment-size">Ukuran File (bytes)</Label>
        <Input
          id="attachment-size"
          type="number"
          min="0"
          placeholder="0"
          {...register("fileSize")}
        />
        {errors.fileSize && (
          <p className="text-xs text-destructive">{errors.fileSize.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Tambah Lampiran"}
      </Button>
    </form>
  );
}
