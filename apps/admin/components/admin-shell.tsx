"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Layers,
  ClipboardList,
  Users,
  Drama,
  KeyRound,
  LogOut,
  Menu,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/onboarding/quizzes", label: "Quizzes", icon: Layers },
  { href: "/onboarding/questions", label: "Questions", icon: ClipboardList },
  { href: "/onboarding/personas", label: "Personas", icon: Users },
  { href: "/onboarding/characters", label: "Characters", icon: Drama },
  { href: "/onboarding/access-codes", label: "Access Codes", icon: KeyRound },
];

const HEADER_MENU_ITEMS = [
  { href: "/onboarding", label: "Onboarding", icon: Compass },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top header — full width, black */}
      <header className="h-12 bg-black text-white flex items-center justify-between px-4 shrink-0">
        <span className="font-semibold text-sm tracking-wide">
          Company Admin
        </span>

        {/* Desktop: inline buttons (md+) */}
        <nav className="hidden md:flex items-center gap-1">
          {HEADER_MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 transition-colors",
                    isActive
                      ? "bg-white text-black hover:bg-white/90 hover:text-black"
                      : "bg-white/15 text-white/70 hover:bg-white/25 hover:text-white"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Mobile: dropdown (<md) */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white gap-2"
              >
                <Menu className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {HEADER_MENU_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "cursor-pointer gap-2",
                        isActive && "font-semibold"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r bg-sidebar-background flex flex-col">
          <div className="p-4 border-b">
            <h1 className="font-semibold text-lg">Onboarding Assistant</h1>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
