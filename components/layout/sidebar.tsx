"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coins,
  Gem,
  ShoppingCart,
  BookOpen,
  Building,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";
import { apiRequest, removeAuthToken } from "@/lib/api-client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    apiRequest("/auth/me")
      .then((data) => setProfile(data))
      .catch(() => {
        removeAuthToken();
        router.push("/login");
      });
  }, [router]);

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Girvi / Gold Loans", href: "/dashboard/girvi", icon: Coins },
    { label: "Jewellery Stock", href: "/dashboard/inventory", icon: Gem },
    { label: "Sales & POS", href: "/dashboard/sales", icon: ShoppingCart },
    { label: "Cash Book & Ledger", href: "/dashboard/accounting", icon: BookOpen },
    { label: "Bank Re-Pledge", href: "/dashboard/bank-pledge", icon: Building },
    { label: "Gold & Silver Rates", href: "/dashboard/rates", icon: TrendingUp },
    { label: "Reports", href: "/dashboard/reports", icon: FileSpreadsheet },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 font-sans text-slate-200 select-none">
      {/* Organization Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md shadow-amber-500/10">
          {profile?.organization?.name?.[0] || "U"}
        </div>
        <div className="overflow-hidden">
          <h2 className="text-sm font-bold text-slate-100 truncate">
            {profile?.organization?.name || "Loading..."}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>{profile?.user?.role || "STAFF"}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{profile?.user?.name || "User"}</p>
            <p className="text-[10px] text-slate-500 truncate">{profile?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
