"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Receipt } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    grand_total: "",
    paid_amount: "",
    payment_mode: "CASH",
    item_name: "22K Gold Chain",
    gross_weight: "10.000",
    net_weight: "9.800",
    rate_per_gram: "6875"
  });

  const fetchSales = async () => {
    try {
      const data = await apiRequest<any[]>("/sales");
      setSales(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
    apiRequest<any[]>("/customers").then(setCustomers).catch(console.error);
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gTot = parseFloat(form.grand_total);
      const pAmt = parseFloat(form.paid_amount || form.grand_total);
      await apiRequest("/sales", {
        method: "POST",
        body: JSON.stringify({
          customer_id: form.customer_id || null,
          subtotal_amount: gTot,
          grand_total: gTot,
          paid_amount: pAmt,
          payment_mode: form.payment_mode,
          items: [
            {
              item_name: form.item_name,
              gross_weight: parseFloat(form.gross_weight),
              net_weight: parseFloat(form.net_weight),
              rate_per_gram: parseFloat(form.rate_per_gram),
              item_total: gTot
            }
          ]
        })
      });
      setShowModal(false);
      fetchSales();
    } catch (err: any) {
      alert(err.message || "Failed to create sale");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Sales & POS Billing</h1>
          <p className="text-xs text-slate-400 mt-1">Jewellery invoices, making charges & customer billing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Invoice No</th>
              <th className="p-4">Date</th>
              <th className="p-4">Grand Total</th>
              <th className="p-4">Paid</th>
              <th className="p-4">Payment Mode</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-100">{s.invoice_number}</td>
                <td className="p-4 text-slate-400">{s.sale_date}</td>
                <td className="p-4 font-semibold text-amber-400">₹{Number(s.grand_total).toLocaleString()}</td>
                <td className="p-4 text-slate-200">₹{Number(s.paid_amount).toLocaleString()}</td>
                <td className="p-4 font-medium">{s.payment_mode}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    {s.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-slate-100">
            <h2 className="text-lg font-bold mb-4">New Jewellery Invoice</h2>
            <form onSubmit={handleCreateSale} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  value={form.item_name}
                  onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Net Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={form.net_weight}
                    onChange={(e) => setForm({ ...form, net_weight: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Rate (₹ / g)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.rate_per_gram}
                    onChange={(e) => setForm({ ...form, rate_per_gram: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Grand Total Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.grand_total}
                  onChange={(e) => setForm({ ...form, grand_total: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
