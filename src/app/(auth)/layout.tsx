import { RouteGuard } from "@/components/common/route-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RouteGuard>{children}</RouteGuard>;
}