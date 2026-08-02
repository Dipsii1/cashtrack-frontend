"use client";
import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Gamepad2,
  Plane,
  HeartPulse,
  GraduationCap,
  Briefcase,
  PiggyBank,
  ShoppingBag,
  Coffee,
  Film,
  Music,
  Phone,
  Wifi,
  Zap,
  Droplets,
  Gift,
  Baby,
  PawPrint,
  Dumbbell,
  BookOpen,
  Truck,
  Wrench,
  CreditCard,
  Landmark,
  TrendingUp,
  CircleDollarSign,
  Leaf,
  Smartphone,
  Laptop,
  Shirt,
  Scissors,
  Ticket,
  Bus,
  Fuel,
  Banknote,
  Percent,
  Star,
  Rocket,
  Umbrella,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  wallet: Wallet,
  shopping: ShoppingCart,
  shoppingbag: ShoppingBag,
  food: Utensils,
  coffee: Coffee,
  transport: Car,
  bus: Bus,
  fuel: Fuel,
  home: Home,
  gaming: Gamepad2,
  travel: Plane,
  health: HeartPulse,
  education: GraduationCap,
  work: Briefcase,
  savings: PiggyBank,
  bank: Landmark,
  salary: TrendingUp,
  income: CircleDollarSign,
  movie: Film,
  music: Music,
  phone: Phone,
  internet: Wifi,
  electricity: Zap,
  water: Droplets,
  gift: Gift,
  baby: Baby,
  pet: PawPrint,
  sport: Dumbbell,
  book: BookOpen,
  delivery: Truck,
  repair: Wrench,
  card: CreditCard,
  cash: Banknote,
  tax: Percent,
  star: Star,
  rocket: Rocket,
  insurance: Umbrella,
  fashion: Shirt,
  beauty: Scissors,
  ticket: Ticket,
  plant: Leaf,
  device: Smartphone,
  laptop: Laptop,
  other: Sparkles,
};

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Sparkles;
  return iconMap[iconName.toLowerCase()] ?? Sparkles;
}

interface CategoryIconProps {
  icon: string | null | undefined;
  color: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 rounded-xl",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-2xl",
};

const iconSizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function colorToGray(hex: string | null | undefined, fallback = "#0a0a0a"): string {
  if (!hex) return fallback;
  const m = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return fallback;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum > 0.8) return "#737373";
  if (lum > 0.5) return "#3f3f46";
  return "#0a0a0a";
}

export function CategoryIcon({ icon, color, size = "md", className }: CategoryIconProps) {
  const Icon = getCategoryIcon(icon);
  const colorValue = colorToGray(color);
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${sizes[size]} ${className ?? ""}`}
      style={{ backgroundColor: `${colorValue}1a`, color: colorValue }}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}