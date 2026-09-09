import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attachmentService, type AttachmentInput } from "@/services/attachment";
import { getErrorMessage } from "@/utils/errors";
import type { Attachment, Paginated } from "@/types";

type AttachmentListResponse = { data: Attachment[]; meta: unknown };

export const attachmentKeys = {
  all: ["attachments"] as const,
  list: (transactionPublicId?: string) =>
    [...attachmentKeys.all, "list", transactionPublicId] as const,
};

export function useAttachments(enabled = true, transactionPublicId?: string) {
  return useQuery({
    queryKey: attachmentKeys.list(transactionPublicId),
    queryFn: () => attachmentService.list(transactionPublicId, 1, 100),
    enabled,
    select: (data: Paginated<Attachment>) => data,
  });
}

export function useCreateAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AttachmentInput) => attachmentService.create(input),
    onSuccess: (attachment) => {
      qc.setQueryData<AttachmentListResponse>(
        attachmentKeys.list(),
        (old) =>
          old ? { ...old, data: [attachment, ...old.data] } : old
      );
      qc.invalidateQueries({ queryKey: attachmentKeys.all });
      toast.success("Lampiran berhasil ditambahkan");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => attachmentService.delete(publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attachmentKeys.all });
      toast.success("Lampiran berhasil dihapus");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
