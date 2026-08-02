"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Wallet, CreditCard, Tags, Target, PiggyBank, CalendarClock, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wallets", label: "Dompet", icon: Wallet },
  { href: "/transactions", label: "Transaksi", icon: CreditCard },
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/savings-goals", label: "Target Tabungan", icon: PiggyBank },
  { href: "/recurring-transactions", label: "Transaksi Berkala", icon: CalendarClock },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebarStore();
  const { logout, user } = useAuthStore();

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col border-r bg-sidebar transition-all duration-300",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("flex items-center gap-3 overflow-hidden", collapsed ? "justify-center" : "")}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  key="logo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg tracking-tight text-sidebar-foreground"
                >
                  CashTrack
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9 rounded-xl", collapsed && "hidden lg:flex")}
            onClick={toggleCollapsed}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Navigasi utama">
          <AnimatePresence mode="popLayout">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </AnimatePresence>
        </nav>

        <div className="border-t p-3">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="user"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                    <span className="font-medium">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.name ?? "Pengguna"}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email ?? ""}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            className={cn("w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed && "justify-center")}
            onClick={() => { logout(); setMobileOpen(false); }}
          >
            <LogOut className="h-5 w-5" />
            <AnimatePresence mode="wait">
              {!collapsed && <motion.span key="logout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Keluar</motion.span>}
            </AnimatePresence>
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}