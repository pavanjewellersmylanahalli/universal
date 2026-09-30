"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Download, Filter } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    apiRequest("/reports/girvi").then(setReport).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Reports & Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Multi-branch financial, stock valuation and Girvi portfolio reports</p>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Total Pledges Issued</span>
          <p className="text-2xl font-bold text-slate-100 mt-2">{report?.total_pledges || 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Total Loan Disbursed</span>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            ₹{Number(report?.total_loan_disbursed || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Total Principal Outstanding</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            ₹{Number(report?.total_principal_outstanding || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
