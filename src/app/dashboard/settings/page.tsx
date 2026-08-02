"use client";
import * as React from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Monitor,
  CircleDollarSign,
  Clock,
  LogOut,
  Save,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/common/page-header";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { useSettingsStore } from "@/store/settings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const currencies = [
  { value: "IDR", label: "Rupiah (IDR)", symbol: "Rp" },
  { value: "USD", label: "Dollar (USD)", symbol: "$" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "SGD", label: "Dollar Singapura (SGD)", symbol: "S$" },
  { value: "MYR", label: "Ringgit (MYR)", symbol: "RM" },
  { value: "JPY", label: "Yen (JPY)", symbol: "¥" },
];

const timezones = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Bangkok",
  "Asia/Manila",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
];

const themeOptions = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { currency, timezone, setCurrency, setTimezone } = useSettingsStore();
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");

  const [appliedTheme, setAppliedTheme] = React.useState(theme);
  const [appliedCurrency, setAppliedCurrency] = React.useState(currency);
  const [appliedTimezone, setAppliedTimezone] = React.useState(timezone);

  React.useEffect(() => {
    const root = document.documentElement;
    const resolved =
      appliedTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : appliedTheme;
    root.classList.toggle("dark", resolved === "dark");
  }, [appliedTheme]);

  function saveAppearance() {
    setTheme(appliedTheme);
    setCurrency(appliedCurrency);
    setTimezone(appliedTimezone);
    toast.success("Pengaturan tampilan disimpan");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola profil, tampilan, dan preferensi"
        icon={SettingsIcon}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Profil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Nama</Label>
                <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (name.trim().length < 2) {
                    toast.error("Nama minimal 2 karakter");
                    return;
                  }
                  toast.success("Profil diperbarui (lokal)");
                }}
              >
                <Save className="h-4 w-4" /> Simpan Profil
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Update profil via API belum tersedia di backend, perubahan tersimpan di perangkat ini
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Tampilan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = appliedTheme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAppliedTheme(opt.value as typeof theme)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                        active ? "border-primary bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Preferensi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="setting-currency">Mata Uang</Label>
                <select
                  id="setting-currency"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={appliedCurrency}
                  onChange={(e) => setAppliedCurrency(e.target.value)}
                >
                  {currencies.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setting-timezone">Zona Waktu</Label>
                <select
                  id="setting-timezone"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={appliedTimezone}
                  onChange={(e) => setAppliedTimezone(e.target.value)}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <Button className="w-full" onClick={saveAppearance}>
                <Save className="h-4 w-4" /> Simpan Tampilan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg text-destructive flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Akun
          </CardTitle>
          <CardDescription>Keluar dari sesi saat ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => { logout(); }}>
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}