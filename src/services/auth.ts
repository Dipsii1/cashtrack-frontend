import { api } from "./api";
import type { ApiResponse, AuthResult, AuthTokens, User } from "@/types";

export const authService = {
  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>("/auth/login", input);
    return res.data.data;
  },

  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>("/auth/register", input);
    return res.data.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await api.post<ApiResponse<AuthTokens>>("/auth/refresh-token", { refreshToken });
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<null>>("/auth/logout");
  },

  async me(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },
};