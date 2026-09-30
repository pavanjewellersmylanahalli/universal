"use client";

import { useEffect, useState } from "react";
import { BookOpen, Wallet, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function AccountingPage() {
  const [cashBook, setCashBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCashBook = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/accounting/cash-book");
      setCashBook(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashBook();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Daily Cash Book & Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">Reconciliation: Opening Balance + Cash In - Cash Out = Closing Balance</p>
      </div>

      {/* Cash Book Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Opening Balance</span>
          <p className="text-xl font-bold text-slate-100 mt-2">
            ₹{Number(cashBook?.opening_balance || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Total Cash Receipts
          </span>
          <p className="text-xl font-bold text-emerald-400 mt-2">
            +₹{Number(cashBook?.total_cash_in || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Cash Payments
          </span>
          <p className="text-xl font-bold text-rose-400 mt-2">
            -₹{Number(cashBook?.total_cash_out || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 bg-amber-500/5">
          <span className="text-xs text-amber-400 font-bold">Reconciled Closing Balance</span>
          <p className="text-xl font-bold text-amber-400 mt-2">
            ₹{Number(cashBook?.closing_balance || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Cash Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-slate-100 text-sm">
          Cash Movement Audit Log
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">Type</th>
              <th className="p-4">Category</th>
              <th className="p-4">Description</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Balance After</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {cashBook?.transactions?.map((t: any) => (
              <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 text-slate-400">{new Date(t.transaction_date).toLocaleTimeString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.transaction_type === "CASH_IN" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {t.transaction_type}
                  </span>
                </td>
                <td className="p-4 font-medium">{t.category}</td>
                <td className="p-4 text-slate-400">{t.description || "N/A"}</td>
                <td className={`p-4 font-bold ${t.transaction_type === "CASH_IN" ? "text-emerald-400" : "text-rose-400"}`}>
                  {t.transaction_type === "CASH_IN" ? "+" : "-"}₹{Number(t.amount).toLocaleString()}
                </td>
                <td className="p-4 font-semibold text-slate-200">₹{Number(t.balance_after).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
