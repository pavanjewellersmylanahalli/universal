"use client";

import { useEffect, useState } from "react";
import { Gem, Plus, Search } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    sku: "",
    name: "",
    metal_type: "GOLD",
    purity: "22K",
    quantity: "1",
    gross_weight: "",
    net_weight: "",
    selling_price: ""
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>("/inventory");
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/inventory", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity),
          gross_weight: parseFloat(form.gross_weight),
          net_weight: parseFloat(form.net_weight),
          selling_price: parseFloat(form.selling_price || "0")
        })
      });
      setShowModal(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || "Failed to add stock item");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Jewellery Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">Shop stock tracking for Gold, Silver, Diamond & Bullion</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Stock Item
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">SKU / Item</th>
              <th className="p-4">Metal</th>
              <th className="p-4">Purity</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Gross Wt</th>
              <th className="p-4">Net Wt</th>
              <th className="p-4">Selling Price</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-100">{i.name}</div>
                  <div className="text-[10px] text-slate-500">{i.sku}</div>
                </td>
                <td className="p-4"><span className="text-amber-400 font-medium">{i.metal_type}</span></td>
                <td className="p-4">{i.purity}</td>
                <td className="p-4">{i.quantity}</td>
                <td className="p-4">{Number(i.gross_weight).toFixed(3)}g</td>
                <td className="p-4">{Number(i.net_weight).toFixed(3)}g</td>
                <td className="p-4 font-semibold text-slate-100">₹{Number(i.selling_price).toLocaleString()}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    {i.status}
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
            <h2 className="text-lg font-bold mb-4">Add Inventory Item</h2>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SKU / Code *</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. SK-G22-001"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 22K Gold Bangle"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gross Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={form.gross_weight}
                    onChange={(e) => setForm({ ...form, gross_weight: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Net Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={form.net_weight}
                    onChange={(e) => setForm({ ...form, net_weight: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                  />
                </div>
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
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
