import { RouteGuard } from "@/components/common/route-guard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard>
      <SidebarProvider defaultOpen>
        <DashboardLayout>{children}</DashboardLayout>
      </SidebarProvider>
    </RouteGuard>
  );
}
