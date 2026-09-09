"use client";
import * as React from "react";
import { Paperclip, Plus, Trash2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { AttachmentForm } from "@/features/attachments/attachment-form";
import { useAttachments, useDeleteAttachment } from "@/hooks/useAttachments";
import { useTransactions } from "@/hooks/useTransactions";
import { formatFileSize } from "@/utils/format";
import { formatRelative } from "@/utils/date";

export default function AttachmentsPage() {
  const [selectedTx, setSelectedTx] = React.useState<string>("");
  const [creating, setCreating] = React.useState(false);

  const { data, isLoading, refetch } = useAttachments(true);
  const deleteAttachment = useDeleteAttachment();
  const { data: txData } = useTransactions({ page: 1, limit: 100 });
  const transactions = txData?.data ?? [];

  const txMap = new Map(transactions.map((t) => [t.publicId, t.title]));
  const txOptions = [
    { value: "", label: "Semua Transaksi" },
    ...transactions.map((t) => ({ value: t.publicId, label: t.title })),
  ];

  const all = data?.data ?? [];
  const items = selectedTx
    ? all.filter((a) => a.transactionId === selectedTx)
    : all;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lampiran"
        description="Kelola lampiran file terkait transaksi"
        icon={Paperclip}
        actions={
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Lampiran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Lampiran</DialogTitle>
                <DialogDescription>
                  Hubungkan berkas dengan transaksi (opsional)
                </DialogDescription>
              </DialogHeader>
              <AttachmentForm
                onSuccess={() => {
                  setCreating(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-end justify-between gap-3">
        <div className="w-full max-w-xs space-y-1.5">
          <Select
            placeholder="Semua Transaksi"
            options={txOptions}
            value={selectedTx}
            onChange={(e) => setSelectedTx(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground shrink-0">
          {items.length} lampiran
        </p>
      </div>

      {isLoading ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Transaksi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Ukuran</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada lampiran"
            description="Tambahkan lampiran untuk melampirkan berkas"
            actionLabel="Tambah Lampiran"
            onAction={() => setCreating(true)}
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Transaksi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Ukuran</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.publicId}>
                  <TableCell>
                    <a
                      href={a.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium underline decoration-transparent underline-offset-2 hover:decoration-current"
                    >
                      {a.fileName}
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {a.transactionId
                      ? txMap.get(a.transactionId) ?? a.transactionId
                      : "\u2014"}
                  </TableCell>
                  <TableCell>{a.mimeType}</TableCell>
                  <TableCell className="text-right">
                    {formatFileSize(a.fileSize)}
                  </TableCell>
                  <TableCell>{formatRelative(a.createdAt)}</TableCell>
                  <TableCell>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                      title="Hapus Lampiran?"
                      description={`Hapus lampiran "${a.fileName}"?`}
                      onConfirm={() =>
                        deleteAttachment.mutate(a.publicId, {
                          onSuccess: () => refetch(),
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
