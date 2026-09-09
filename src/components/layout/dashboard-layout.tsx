"use client";

import { AppSidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { MobileFAB } from "./mobile-fab";
import { SidebarInset } from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          {children}
        </main>
        <MobileFAB />
      </SidebarInset>
    </>
  );
}
