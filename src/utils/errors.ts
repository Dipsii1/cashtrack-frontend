import type { ApiErrorPayload } from "@/types/api";
import { AxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorPayload | undefined;
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey) return data.errors[firstKey][0];
    }
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan";
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorPayload | undefined;
    if (data?.errors) {
      return Object.fromEntries(Object.entries(data.errors).map(([k, v]) => [k, v[0]]));
    }
  }
  return {};
}
