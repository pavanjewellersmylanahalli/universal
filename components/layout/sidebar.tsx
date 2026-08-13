"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Vault,
  Building2,
  BarChart3,
  Bell,
  UserCog,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  Gem,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/girvi", label: "Girvi", icon: FileText },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/vault", label: "Vault", icon: Vault },
  { href: "/dashboard/bank-pledge", label: "Bank Pledge", icon: Building2 },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/users", label: "Users", icon: UserCog },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
        isActive
          ? "bg-gold-500/15 text-gold-400 border-l-2 border-gold-500 ml-0 pl-[14px]"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 ml-0"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
          isActive ? "text-gold-400" : "text-zinc-500"
        )}
      />
      <span>{label}</span>
      {isActive && (
        <ChevronRight className="ml-auto h-3 w-3 text-gold-400 opacity-60" />
      )}
    </Link>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const businessName = (session as any)?.businessName ?? "GirviPro";

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg glow-gold">
          <Gem className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">{businessName}</div>
          <div className="text-xs text-zinc-500">GirviPro</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
            onClick={onClose}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-zinc-200 truncate">
              {session?.user?.name ?? "User"}
            </div>
            <div className="text-xs text-zinc-500 truncate">
              {session?.user?.email ?? ""}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="search"
            placeholder="Search customers, Girvi, payments…"
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 rounded border border-zinc-700 px-1.5 text-[10px] text-zinc-600">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
