import { api } from "./api";
import type { ApiResponse, Attachment, Paginated } from "@/types";

export interface AttachmentInput {
  transactionPublicId?: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

export const attachmentService = {
  async list(
    transactionPublicId?: string,
    page = 1,
    limit = 100
  ): Promise<Paginated<Attachment>> {
    const res = await api.get<ApiResponse<Paginated<Attachment>>>("/attachments", {
      params: { transactionPublicId, page, limit },
    });
    return res.data.data;
  },

  async create(input: AttachmentInput): Promise<Attachment> {
    const res = await api.post<ApiResponse<Attachment>>("/attachments", input);
    return res.data.data;
  },

  async delete(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/attachments/${publicId}`);
  },
};
