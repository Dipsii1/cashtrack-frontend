import { RouteGuard } from "@/components/common/route-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </RouteGuard>
  );
}