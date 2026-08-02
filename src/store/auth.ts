import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokens, User } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (tokens: AuthTokens, user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (tokens, user) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "cashtrack-auth" }
  )
);

export function getAuth(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: useAuthStore.getState().accessToken,
    refreshToken: useAuthStore.getState().refreshToken,
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  useAuthStore.getState().setTokens(accessToken, refreshToken);
}

export function setUser(user: User) {
  useAuthStore.getState().setUser(user);
}

export function logout() {
  useAuthStore.getState().logout();
}

export function isAuthenticated(): boolean {
  return Boolean(useAuthStore.getState().accessToken);
}
