"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/store/auth";
import { motion } from "framer-motion";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const authed = isAuthenticated();
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");

    if (!authed && !isAuthPage) {
      router.replace("/login");
      return;
    }
    if (authed && isAuthPage) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary"
        >
          <span className="font-bold text-primary-foreground">CT</span>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}