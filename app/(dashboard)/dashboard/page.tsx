"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  DollarSign,
  TrendingUp,
  Wallet,
  Users,
  Gem,
  PlusCircle,
  Receipt,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/dashboard/summary");
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Business Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time metrics for your jewellery & Girvi operations</p>
        </div>

        <div className="flex items-center gap-3">
          {summary?.metal_rate && (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Gold 22K: ₹{Number(summary.metal_rate.gold_22k_per_gram).toLocaleString()}/g</span>
              </div>
              <div className="text-xs text-slate-400">
                Silver: ₹{Number(summary.metal_rate.silver_per_gram).toLocaleString()}/g
              </div>
              {summary.metal_rate.is_stale && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded font-medium">Stale</span>
              )}
            </div>
          )}
          <button
            onClick={fetchSummary}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Pledges</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">{summary?.active_pledges_count || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Live customer gold loans</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Principal Outstanding</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">
            ₹{Number(summary?.total_principal_outstanding || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total loan capital deployed</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Interest</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3">
            ₹{Number(summary?.today_interest_collected || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Interest collected today</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cash Box Balance</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">
            ₹{Number(summary?.cash_balance || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Daily Cash Book reconciled</p>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-amber-300">Quick Actions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Create new pledges, record payments, or generate sales invoices</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/girvi"
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Girvi Pledge
          </Link>
          <Link
            href="/dashboard/sales"
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-100 font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-all"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            New Jewellery Sale
          </Link>
          <Link
            href="/dashboard/customers"
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-100 font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-all"
          >
            <Users className="w-4 h-4 text-blue-400" />
            Add Customer
          </Link>
        </div>
      </div>
    </div>
  );
}
