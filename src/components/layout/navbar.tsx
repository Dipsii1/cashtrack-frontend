"use client";
import * as React from "react";
import { Menu, Sun, Moon, Bell, ChevronDown, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";
import { useThemeStore } from "@/store/theme";
import { Sidebar } from "./sidebar";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebarStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <header className={cn("sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-xl", collapsed ? "lg:ml-20" : "lg:ml-72")}>
      <div className="flex h-full items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="hidden lg:flex h-10 w-10 rounded-xl" onClick={toggleCollapsed}>
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-10 items-center gap-2 rounded-xl pr-3 pl-2" aria-label="Menu pengguna">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium">{user?.name ?? "Pengguna"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{user?.name ?? "Pengguna"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email ?? ""}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => { logout(); }}>
                <LogOutIcon className="h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}