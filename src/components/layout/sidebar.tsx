"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Tags,
  Target,
  PiggyBank,
  Paperclip,
  CalendarClock,
  Settings,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/hooks/useLogout";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wallets", label: "Dompet", icon: Wallet },
  { href: "/transactions", label: "Transaksi", icon: CreditCard },
  { href: "/categories", label: "Kategori", icon: Tags },
  // { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/savings-goals", label: "Target & Kontribusi Tabungan", icon: PiggyBank },
  // { href: "/attachments", label: "Lampiran", icon: Paperclip },
  { href: "/recurring-transactions", label: "Transaksi Berkala", icon: CalendarClock },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className={cn("z-30", className)} {...props}>
      <SidebarHeader className="mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard" className="flex items-center gap-3 font-bold">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  CT
                </span>
                <span>CashTrack</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex-1 mt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback>
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{user?.name ?? "Pengguna"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3"
                onClick={() => logout()}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Keluar</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
