import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CashTrack — Personal Finance",
  description: "Aplikasi pencatatan keuangan pribadi modern",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased", inter.variable)}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}