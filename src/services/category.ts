import { api } from "./api";
import type { ApiResponse, Category, CategoryType, Paginated } from "@/types";

export interface CategoryInput {
  name: string;
  icon?: string;
  color?: string;
  type?: CategoryType;
}

export const categoryService = {
  async list(type?: CategoryType, page = 1, limit = 100): Promise<Paginated<Category>> {
    const res = await api.get<ApiResponse<Paginated<Category>>>("/categories", {
      params: { type, page, limit },
    });
    return res.data.data;
  },

  async get(publicId: string): Promise<Category> {
    const res = await api.get<ApiResponse<Category>>(`/categories/${publicId}`);
    return res.data.data;
  },

  async create(input: CategoryInput): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>("/categories", input);
    return res.data.data;
  },

  async update(publicId: string, input: Partial<CategoryInput>): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/categories/${publicId}`, input);
    return res.data.data;
  },

  async delete(publicId: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/categories/${publicId}`);
  },
};