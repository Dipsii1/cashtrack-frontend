"use client";
import * as React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { MobileFAB } from "./mobile-fab";
import { useSidebarStore } from "@/store/sidebar";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Navbar />
      <main className={cn("transition-all duration-300 px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8", collapsed ? "lg:ml-20" : "lg:ml-72")}>
        {children}
      </main>
      <MobileFAB />
    </div>
  );
}