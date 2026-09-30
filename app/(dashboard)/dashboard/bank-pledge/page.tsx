"use client";

import { useEffect, useState } from "react";
import { Building, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function BankPledgePage() {
  const [repledges, setRepledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepledges = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>("/bank-repledge");
      setRepledges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepledges();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Bank Re-Pledge Tracking</h1>
        <p className="text-xs text-slate-400 mt-1">Track customer pledged ornaments re-pledged to financial institutions & banks</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Bank Name</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Ref / Loan Packet No</th>
              <th className="p-4">Re-Pledge Date</th>
              <th className="p-4">Loan Amount</th>
              <th className="p-4">Bank Interest</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {repledges.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-100">{r.bank_name}</td>
                <td className="p-4 text-slate-400">{r.bank_branch}</td>
                <td className="p-4 font-semibold text-amber-400">{r.reference_number}</td>
                <td className="p-4 text-slate-400">{r.repledge_date}</td>
                <td className="p-4 font-semibold text-slate-100">₹{Number(r.loan_amount).toLocaleString()}</td>
                <td className="p-4">{r.annual_interest_rate}% p.a.</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
