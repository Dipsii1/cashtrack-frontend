import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { setUser } from "@/store/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
