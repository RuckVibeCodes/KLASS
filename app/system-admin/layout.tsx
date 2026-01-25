import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isMasterAdminId } from "@/lib/master-admin";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Flag,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Revalidate every 5 minutes for system admin pages
export const revalidate = 300;

export default async function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!isMasterAdminId(userId)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900 text-white border-b border-zinc-800">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/system-admin" className="font-bold text-lg">
              Klass System Admin
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/system-admin"
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/system-admin/communities"
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Communities
              </Link>
              <Link
                href="/system-admin/feature-flags"
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Flag className="h-4 w-4" />
                Feature Flags
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
              Master Admin
            </span>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">{children}</main>
    </div>
  );
}
