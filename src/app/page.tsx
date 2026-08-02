"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/store/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-primary">
        <span className="font-bold text-primary-foreground">CT</span>
      </div>
    </div>
  );
}