"use client";

import { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function MetalRatesPage() {
  const [rate, setRate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    gold_24k_per_gram: "7500",
    gold_22k_per_gram: "6875",
    gold_18k_per_gram: "5625",
    silver_per_gram: "90.00"
  });

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/rates/latest");
      setRate(data);
      setForm({
        gold_24k_per_gram: data.gold_24k_per_gram,
        gold_22k_per_gram: data.gold_22k_per_gram,
        gold_18k_per_gram: data.gold_18k_per_gram,
        silver_per_gram: data.silver_per_gram
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const data = await apiRequest("/rates", {
        method: "POST",
        body: JSON.stringify({
          gold_24k_per_gram: parseFloat(form.gold_24k_per_gram),
          gold_22k_per_gram: parseFloat(form.gold_22k_per_gram),
          gold_18k_per_gram: parseFloat(form.gold_18k_per_gram),
          silver_per_gram: parseFloat(form.silver_per_gram),
          source: "MANUAL"
        })
      });
      setRate(data);
      alert("Metal rates updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update rates");
    } finally {
      setUpdating(false);
    }
  };

  const fetchLiveRate = async () => {
    setUpdating(true);
    try {
      const data = await apiRequest("/rates/fetch-live", { method: "POST" });
      setRate(data);
      setForm({
        gold_24k_per_gram: data.gold_24k_per_gram,
        gold_22k_per_gram: data.gold_22k_per_gram,
        gold_18k_per_gram: data.gold_18k_per_gram,
        silver_per_gram: data.silver_per_gram
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Gold & Silver Metal Rates</h1>
          <p className="text-xs text-slate-400 mt-1">Configure Organization Daily Rates for Gold 24K, 22K, 18K and Silver</p>
        </div>

        <button
          onClick={fetchLiveRate}
          disabled={updating}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${updating ? "animate-spin" : ""}`} />
          Fetch Live Market Rate
        </button>
      </div>

      {/* Current Rates Display */}
      {rate && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400">Gold 24K</span>
            <p className="text-lg font-bold text-amber-400 mt-1">₹{Number(rate.gold_24k_per_gram).toLocaleString()}/g</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Gold 22K</span>
            <p className="text-lg font-bold text-amber-400 mt-1">₹{Number(rate.gold_22k_per_gram).toLocaleString()}/g</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Gold 18K</span>
            <p className="text-lg font-bold text-amber-400 mt-1">₹{Number(rate.gold_18k_per_gram).toLocaleString()}/g</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Silver 999</span>
            <p className="text-lg font-bold text-slate-200 mt-1">₹{Number(rate.silver_per_gram).toLocaleString()}/g</p>
          </div>
        </div>
      )}

      {/* Rate Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-100 mb-4">Set Today's Organization Rates</h2>
        <form onSubmit={handleUpdateRates} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gold 24K (₹ per gram)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.gold_24k_per_gram}
                onChange={(e) => setForm({ ...form, gold_24k_per_gram: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gold 22K (₹ per gram)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.gold_22k_per_gram}
                onChange={(e) => setForm({ ...form, gold_22k_per_gram: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gold 18K (₹ per gram)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.gold_18k_per_gram}
                onChange={(e) => setForm({ ...form, gold_18k_per_gram: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Silver (₹ per gram)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.silver_per_gram}
                onChange={(e) => setForm({ ...form, silver_per_gram: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
          >
            {updating ? "Saving Rates..." : "Save Today's Rates"}
          </button>
        </form>
      </div>
    </div>
  );
}
