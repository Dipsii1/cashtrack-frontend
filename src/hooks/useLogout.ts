"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuthStore } from "@/store/auth";

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);
}