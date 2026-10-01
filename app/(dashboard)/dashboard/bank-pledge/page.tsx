"use client";

import { useEffect, useState } from "react";
import { Building, Plus, Search, CheckSquare, Square, Calendar, User, DollarSign, History, X, ShieldAlert } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

interface EligiblePledge {
  id: string;
  pledge_no: string;
  pledge_date: string;
  customer_name: string;
  customer_phone: string;
  principal_amount: number;
  articles_summary: string;
  total_gross_weight: number;
  total_net_weight: number;
}

interface InterestPayment {
  id: string;
  payment_date: string;
  amount: number;
  interest_period?: string;
  payment_mode: string;
  reference_no?: string;
  notes?: string;
}

interface BankRepledge {
  id: string;
  repledge_bill_no?: string;
  repledge_name?: string;
  repledge_bank?: string;
  repledge_date: string;
  repledge_amount: number;
  loan_amount: number;
  monthly_interest_rate: number;
  total_gross_weight: number;
  total_net_weight: number;
  status: string;
  bank_name: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  interest_payments: InterestPayment[];
}


const PRESET_NAMES = ["VIKASH", "DEEPAK", "VIKRAM", "SHANKARLAL", "MAINADEVI", "KAVITHA", "OMPRAKASH"];
const PRESET_BANKS = ["KS", "MM", "BOB", "DH", "SBI"];

export default function BankPledgePage() {
  const [repledges, setRepledges] = useState<BankRepledge[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRepledgeForPayment, setSelectedRepledgeForPayment] = useState<BankRepledge | null>(null);

  // Search & Multi-Select Pledges
  const [searchQuery, setSearchQuery] = useState("");
  const [eligiblePledges, setEligiblePledges] = useState<EligiblePledge[]>([]);
  const [selectedPledgeIds, setSelectedPledgeIds] = useState<string[]>([]);
  const [searchingPledges, setSearchingPledges] = useState(false);

  // New Bank Repledge Form Data
  const [formData, setFormData] = useState({
    repledge_date: new Date().toISOString().split("T")[0],
    repledge_bill_no: "",
    repledge_name: "VIKASH",
    custom_name: "",
    repledge_bank: "KS",
    custom_bank: "",
    repledge_amount: "",
    monthly_interest_rate: "",
    notes: ""
  });

  // Interest Payment Form Data
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    interest_period: "",
    payment_mode: "CASH",
    reference_no: "",
    notes: ""
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRepledges = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<BankRepledge[]>("/bank-repledge");
      setRepledges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligiblePledges = async (queryStr = "") => {
    setSearchingPledges(true);
    try {
      const queryParam = queryStr ? `?q=${encodeURIComponent(queryStr)}` : "";
      const data = await apiRequest<EligiblePledge[]>(`/bank-repledge/eligible-pledges${queryParam}`);
      setEligiblePledges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingPledges(false);
    }
  };

  useEffect(() => {
    fetchRepledges();
  }, []);

  const handleOpenNewModal = () => {
    setFormData({
      repledge_date: new Date().toISOString().split("T")[0],
      repledge_bill_no: `RP-${Math.floor(100000 + Math.random() * 900000)}`,
      repledge_name: "VIKASH",
      custom_name: "",
      repledge_bank: "KS",
      custom_bank: "",
      repledge_amount: "",
      monthly_interest_rate: "1.5",
      notes: ""
    });
    setSelectedPledgeIds([]);
    setErrorMsg("");
    fetchEligiblePledges();
    setIsNewModalOpen(true);
  };

  const toggleSelectPledge = (id: string) => {
    setSelectedPledgeIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectedItemsData = eligiblePledges.filter((p) => selectedPledgeIds.includes(p.id));
  const totalSelectedGross = selectedItemsData.reduce((acc, i) => acc + Number(i.total_gross_weight || 0), 0);
  const totalSelectedNet = selectedItemsData.reduce((acc, i) => acc + Number(i.total_net_weight || 0), 0);

  const handleCreateRepledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPledgeIds.length === 0) {
      setErrorMsg("Please select at least one customer pledge item to re-pledge.");
      return;
    }

    if (!formData.repledge_bill_no.trim()) {
      setErrorMsg("Please enter a valid Repledge Bill Number.");
      return;
    }

    if (!formData.repledge_amount || Number(formData.repledge_amount) <= 0) {
      setErrorMsg("Please enter a valid Repledge Amount.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    const finalName = formData.repledge_name === "OTHER" ? formData.custom_name : formData.repledge_name;
    const finalBank = formData.repledge_bank === "OTHER" ? formData.custom_bank : formData.repledge_bank;

    try {
      await apiRequest("/bank-repledge", {
        method: "POST",
        body: JSON.stringify({
          pledge_ids: selectedPledgeIds,
          repledge_date: formData.repledge_date,
          repledge_bill_no: formData.repledge_bill_no,
          repledge_name: finalName,
          repledge_bank: finalBank,
          repledge_amount: Number(formData.repledge_amount),
          monthly_interest_rate: Number(formData.monthly_interest_rate || 0),
          notes: formData.notes
        })
      });

      setIsNewModalOpen(false);
      fetchRepledges();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create Bank Re-pledge.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPaymentModal = (item: BankRepledge) => {
    setSelectedRepledgeForPayment(item);
    setPaymentData({
      payment_date: new Date().toISOString().split("T")[0],
      amount: "",
      interest_period: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
      payment_mode: "CASH",
      reference_no: "",
      notes: ""
    });
    setErrorMsg("");
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepledgeForPayment) return;
    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      setErrorMsg("Please enter a valid Interest Payment Amount.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      await apiRequest(`/bank-repledge/${selectedRepledgeForPayment.id}/interest-payment`, {
        method: "POST",
        body: JSON.stringify({
          payment_date: paymentData.payment_date,
          amount: Number(paymentData.amount),
          interest_period: paymentData.interest_period,
          payment_mode: paymentData.payment_mode,
          reference_no: paymentData.reference_no,
          notes: paymentData.notes
        })
      });

      setIsPaymentModalOpen(false);
      fetchRepledges();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record interest payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building className="w-7 h-7 text-amber-500" />
            Bank Re-Pledge Girvi Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Re-pledge shop customer gold items with banks/financiers & track monthly interest payments
          </p>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Re-pledge Girvi
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Bill No</th>
              <th className="p-4">Repledge Date</th>
              <th className="p-4">Repledge Name</th>
              <th className="p-4">Bank</th>
              <th className="p-4">Total Weight</th>
              <th className="p-4">Repledge Amount</th>
              <th className="p-4">Monthly Rate</th>
              <th className="p-4">Interest Paid</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">Loading bank re-pledges...</td>
              </tr>
            ) : repledges.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No Bank Re-pledges recorded yet. Click <strong>+ New Re-pledge Girvi</strong> to start.
                </td>
              </tr>
            ) : (
              repledges.map((r) => {
                const totalInterestPaid = (r.interest_payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-amber-400">{r.repledge_bill_no || r.reference_number}</td>
                    <td className="p-4 text-slate-400">{r.repledge_date}</td>
                    <td className="p-4 font-semibold text-slate-100">{r.repledge_name || "-"}</td>
                    <td className="p-4 font-bold text-blue-400">{r.repledge_bank || r.bank_name}</td>
                    <td className="p-4 text-slate-300 font-mono">
                      {Number(r.total_gross_weight).toFixed(2)}g G / {Number(r.total_net_weight).toFixed(2)}g N
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      ₹{Number(r.repledge_amount || r.loan_amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-300">{r.monthly_interest_rate}% / mo</td>
                    <td className="p-4 text-amber-300 font-semibold">
                      ₹{totalInterestPaid.toLocaleString()} ({r.interest_payments?.length || 0} payments)
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenPaymentModal(r)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 rounded-lg text-[11px] font-medium transition-all"
                      >
                        + Pay Interest
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* NEW RE-PLEDGE GIRVI MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  New Re-pledge Girvi Entry
                </h2>
                <p className="text-xs text-slate-400">Select customer items from shop and record bank re-pledge</p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateRepledge} className="space-y-6">
              {/* ITEM SEARCH & MULTI-SELECT SECTION */}
              <div className="space-y-3 bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    1. Search & Select Customer Pledge Items ({selectedPledgeIds.length} Selected)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Gross: {totalSelectedGross.toFixed(2)}g | Net: {totalSelectedNet.toFixed(2)}g
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search active pledge by customer name, mobile, pledge number, or ornaments..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      fetchEligiblePledges(e.target.value);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-800/80 rounded-lg divide-y divide-slate-800/50 bg-slate-900/80">
                  {searchingPledges ? (
                    <div className="p-4 text-center text-xs text-slate-500">Searching pledges...</div>
                  ) : eligiblePledges.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No available shop pledges found.</div>
                  ) : (
                    eligiblePledges.map((item) => {
                      const isSelected = selectedPledgeIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelectPledge(item.id)}
                          className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? "bg-amber-500/10 border-l-2 border-amber-500" : "hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                            <div>
                              <div className="font-bold text-slate-200">
                                {item.pledge_no} - {item.customer_name} ({item.customer_phone})
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{item.articles_summary}</div>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="font-semibold text-emerald-400">₹{item.principal_amount.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-500">
                              {item.total_gross_weight}g G / {item.total_net_weight}g N
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* REPLEDGE DETAILS FORM FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repledge Date</label>
                  <input
                    type="date"
                    value={formData.repledge_date}
                    onChange={(e) => setFormData({ ...formData, repledge_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repledge Bill Number</label>
                  <input
                    type="text"
                    placeholder="Enter Repledge Bill No"
                    value={formData.repledge_bill_no}
                    onChange={(e) => setFormData({ ...formData, repledge_bill_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repledge Name</label>
                  <select
                    value={formData.repledge_name}
                    onChange={(e) => setFormData({ ...formData, repledge_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    {PRESET_NAMES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="OTHER">+ Other (Type Custom Name)</option>
                  </select>
                  {formData.repledge_name === "OTHER" && (
                    <input
                      type="text"
                      placeholder="Type custom name"
                      value={formData.custom_name}
                      onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
                      className="w-full mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repledge Bank</label>
                  <select
                    value={formData.repledge_bank}
                    onChange={(e) => setFormData({ ...formData, repledge_bank: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    {PRESET_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="OTHER">+ Other (Type Custom Bank)</option>
                  </select>
                  {formData.repledge_bank === "OTHER" && (
                    <input
                      type="text"
                      placeholder="Type custom bank code"
                      value={formData.custom_bank}
                      onChange={(e) => setFormData({ ...formData, custom_bank: e.target.value })}
                      className="w-full mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repledge Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Enter total loan amount received"
                    value={formData.repledge_amount}
                    onChange={(e) => setFormData({ ...formData, repledge_amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Interest Rate (%)</label>
                  <input
                    type="number"
                    step="any"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="e.g. 1.5"
                    value={formData.monthly_interest_rate}
                    onChange={(e) => setFormData({ ...formData, monthly_interest_rate: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or remarks..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  {saving ? "Saving..." : "Save Bank Re-pledge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MONTHLY INTEREST PAYMENT MODAL */}
      {isPaymentModalOpen && selectedRepledgeForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  Record Monthly Interest Payment
                </h3>
                <p className="text-xs text-slate-400">
                  Bill #{selectedRepledgeForPayment.repledge_bill_no} ({selectedRepledgeForPayment.repledge_name} / {selectedRepledgeForPayment.repledge_bank})
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Amount Paid (₹)</label>
                <input
                  type="number"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Enter monthly interest amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 font-bold focus:border-amber-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Month / Period</label>
                <input
                  type="text"
                  placeholder="e.g. October 2026"
                  value={paymentData.interest_period}
                  onChange={(e) => setPaymentData({ ...paymentData, interest_period: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={paymentData.payment_mode}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_mode: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK">BANK TRANSFER</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ref / Receipt No</label>
                  <input
                    type="text"
                    placeholder="Optional receipt no"
                    value={paymentData.reference_no}
                    onChange={(e) => setPaymentData({ ...paymentData, reference_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  {saving ? "Recording..." : "Record Interest Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

