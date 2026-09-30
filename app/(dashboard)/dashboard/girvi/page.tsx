"use client";

import { useEffect, useState, useRef } from "react";
import { Coins, Plus, Search, FileText, Share2, Upload, Camera, Trash2, X, Check } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

function numberToWords(num: number): string {
  if (!num || isNaN(num)) return "";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: any): string => {
    if ((n = n.toString()).length > 9) return 'overflow';
    const n_array: any = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return '';
    let str = '';
    str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
    return str;
  };

  const words = inWords(Math.floor(num));
  return words ? `${words.trim()} Rupees Only` : "";
}

function getOneYearOneMonthAhead(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

export default function GirviPage() {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [showModal, setShowModal] = useState(false);

  const [activeCameraIndex, setActiveCameraIndex] = useState<number | "customer" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultDueDateStr = getOneYearOneMonthAhead(todayStr);

  const [form, setForm] = useState({
    pledge_number: "",
    pledge_date: todayStr,
    due_date: defaultDueDateStr,
    customer_name: "",
    relation_type: "",
    relation_name: "",
    mobile_number: "",
    monthly_income: "",
    address: "",
    customer_photo_url: "",
    monthly_interest_rate: "1.50",
    articles: [
      {
        name: "",
        quantity: 1,
        gross_wt: "",
        less_wt: "0",
        net_wt: "0",
        present_value: "",
        loan_amount: "",
        loan_words: "",
        photo_url: ""
      }
    ]
  });

  const fetchPledges = async () => {
    setLoading(true);
    try {
      const url = activeTab === "ALL" ? "/pledges" : `/pledges?status=${activeTab}`;
      const data = await apiRequest<any[]>(url);
      setPledges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPledges();
  }, [activeTab]);

  const handlePledgeDateChange = (newPledgeDate: string) => {
    const calcDue = getOneYearOneMonthAhead(newPledgeDate);
    setForm({
      ...form,
      pledge_date: newPledgeDate,
      due_date: calcDue
    });
  };

  const updateArticle = (index: number, field: string, value: any) => {
    const updated = [...form.articles];
    const current = { ...updated[index], [field]: value };

    if (field === "gross_wt" || field === "less_wt") {
      const g = parseFloat(current.gross_wt || "0");
      const l = parseFloat(current.less_wt || "0");
      current.net_wt = Math.max(0, g - l).toFixed(3);
    }

    if (field === "loan_amount") {
      const lAmt = parseFloat(value || "0");
      current.loan_words = numberToWords(lAmt);
    }

    updated[index] = current;
    setForm({ ...form, articles: updated });
  };

  const addArticle = () => {
    setForm({
      ...form,
      articles: [
        ...form.articles,
        {
          name: "",
          quantity: 1,
          gross_wt: "",
          less_wt: "0",
          net_wt: "0",
          present_value: "",
          loan_amount: "",
          loan_words: "",
          photo_url: ""
        }
      ]
    });
  };

  const removeArticle = (index: number) => {
    if (form.articles.length <= 1) return;
    setForm({
      ...form,
      articles: form.articles.filter((_, i) => i !== index)
    });
  };

  const startCamera = async (target: number | "customer") => {
    setActiveCameraIndex(target);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Unable to access camera device");
    }
  };

  const capturePhoto = (target: number | "customer") => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());

      if (target === "customer") {
        setForm({ ...form, customer_photo_url: dataUrl });
      } else {
        const updated = [...form.articles];
        updated[target].photo_url = dataUrl;
        setForm({ ...form, articles: updated });
      }
      setActiveCameraIndex(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: number | "customer") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (target === "customer") {
          setForm({ ...form, customer_photo_url: dataUrl });
        } else {
          const updated = [...form.articles];
          updated[target].photo_url = dataUrl;
          setForm({ ...form, articles: updated });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        pledge_number: form.pledge_number || undefined,
        pledge_date: form.pledge_date,
        due_date: form.due_date,
        customer_name: form.customer_name,
        relation_type: form.relation_type,
        relation_name: form.relation_name,
        mobile_number: form.mobile_number,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : undefined,
        address: form.address,
        customer_photo_url: form.customer_photo_url,
        monthly_interest_rate: parseFloat(form.monthly_interest_rate),
        items: form.articles.map((art) => ({
          ornament_category: art.name,
          quantity: parseInt(art.quantity.toString() || "1"),
          gross_weight: parseFloat(art.gross_wt || "0"),
          less_weight: parseFloat(art.less_wt || "0"),
          net_weight: parseFloat(art.net_wt || "0"),
          purity: "22K",
          estimated_market_value: parseFloat(art.present_value || "0"),
          loan_value: parseFloat(art.loan_amount || "0"),
          photo_url: art.photo_url
        }))
      };

      await apiRequest("/pledges", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setShowModal(false);
      fetchPledges();
    } catch (err: any) {
      alert(err.message || "Failed to create pledge");
    }
  };

  const shareWhatsApp = (pledge: any) => {
    const text = encodeURIComponent(
      `Pledge Receipt #${pledge.pledge_number}\nLoan Amount: ₹${Number(pledge.loan_amount).toLocaleString()}\nMonthly Interest: ${pledge.monthly_interest_rate}%\nThank you!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Girvi & Gold Loans</h1>
          <p className="text-xs text-slate-400 mt-1">Manage pledged ornaments, interest calculations & customer agreements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Pledge
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {["ALL", "ACTIVE", "PARTIAL_PAYMENT", "OVERDUE", "CLOSED"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === status
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Pledges Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Pledge No</th>
              <th className="p-4">Pledge Date</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Loan Amount</th>
              <th className="p-4">Interest Rate</th>
              <th className="p-4">Net Wt</th>
              <th className="p-4">Interest Due</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pledges.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-100">{p.pledge_number}</td>
                <td className="p-4 text-slate-400">{p.pledge_date}</td>
                <td className="p-4 text-slate-400">{p.due_date}</td>
                <td className="p-4 font-semibold text-amber-400">₹{Number(p.loan_amount).toLocaleString()}</td>
                <td className="p-4">{p.monthly_interest_rate}% / mo</td>
                <td className="p-4">{Number(p.total_net_weight).toFixed(3)}g</td>
                <td className="p-4 font-semibold text-rose-400">₹{Number(p.interest_outstanding).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" :
                    p.status === "CLOSED" ? "bg-slate-800 text-slate-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <a
                    href={`/api/v1/pledges/${p.id}/pdf`}
                    target="_blank"
                    className="p-1.5 inline-block text-slate-400 hover:text-amber-400 bg-slate-800 rounded-md"
                    title="Download Receipt PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => shareWhatsApp(p)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-md"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE NEW PLEDGE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl p-6 lg:p-8 relative max-h-[92vh] overflow-y-auto font-sans">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1: CUSTOMER DETAILS */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                  Customer Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      PLEDGE NO *
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={form.pledge_number}
                      onChange={(e) => setForm({ ...form, pledge_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      PLEDGE DATE *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.pledge_date}
                      onChange={(e) => handlePledgeDateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      DUE DATE * (1 YR + 1 MO)
                    </label>
                    <input
                      type="date"
                      required
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      CUSTOMER NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Full Name"
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      RELATION TYPE
                    </label>
                    <select
                      value={form.relation_type}
                      onChange={(e) => setForm({ ...form, relation_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select...</option>
                      <option value="Father">Father</option>
                      <option value="Husband">Husband</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Mother">Mother</option>
                      <option value="Wife">Wife</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      RELATION NAME
                    </label>
                    <input
                      type="text"
                      placeholder="Father / Husband Name"
                      value={form.relation_name}
                      onChange={(e) => setForm({ ...form, relation_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      MOBILE NUMBER
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10-digit number"
                      value={form.mobile_number}
                      onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                      MONTHLY INCOME (₹)
                    </label>
                    <input
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="e.g. 50000"
                      value={form.monthly_income}
                      onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-1">
                    ADDRESS
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Complete Customer Residential Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-2">
                    CUSTOMER PHOTO
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer border border-slate-200 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "customer")}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => startCamera("customer")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                    {form.customer_photo_url && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Photo Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: ARTICLES */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                  <h2 className="text-base font-bold text-slate-900">Articles</h2>
                  <button
                    type="button"
                    onClick={addArticle}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Article
                  </button>
                </div>

                <div className="space-y-6">
                  {form.articles.map((art, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm relative space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800">Article #{idx + 1}</span>
                        {form.articles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArticle(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            NAME *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Gold Ring"
                            value={art.name}
                            onChange={(e) => updateArticle(idx, "name", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            QUANTITY *
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            required
                            min="1"
                            value={art.quantity}
                            onChange={(e) => updateArticle(idx, "quantity", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            GROSS WT (G) *
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            step="0.001"
                            required
                            placeholder="0.000"
                            value={art.gross_wt}
                            onChange={(e) => updateArticle(idx, "gross_wt", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            LESS WT (G)
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            step="0.001"
                            placeholder="0.000"
                            value={art.less_wt}
                            onChange={(e) => updateArticle(idx, "less_wt", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            NET WT (G)
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={art.net_wt}
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-indigo-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            PRESENT VALUE (₹) *
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            required
                            placeholder="e.g. 75000"
                            value={art.present_value}
                            onChange={(e) => updateArticle(idx, "present_value", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            LOAN AMOUNT (₹) *
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            required
                            placeholder="e.g. 50000"
                            value={art.loan_amount}
                            onChange={(e) => updateArticle(idx, "loan_amount", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-emerald-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          LOAN AMOUNT WORDS
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={art.loan_words}
                          placeholder="Amount in words will auto-generate..."
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                          ITEM PHOTO
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200">
                            <Upload className="w-3.5 h-3.5" /> Upload File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, idx)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => startCamera(idx)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                          >
                            <Camera className="w-3.5 h-3.5" /> Take Photo
                          </button>
                          {art.photo_url && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Photo Attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CAMERA CAPTURE PREVIEW MODAL */}
              {activeCameraIndex !== null && (
                <div className="p-4 bg-slate-900 rounded-2xl text-white flex flex-col items-center gap-3">
                  <p className="text-xs font-bold">Align Subject and Capture</p>
                  <video ref={videoRef} autoPlay playsInline className="w-64 h-48 bg-black rounded-lg" />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => capturePhoto(activeCameraIndex)}
                      className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCameraIndex(null)}
                      className="px-4 py-1.5 bg-slate-700 text-white text-xs font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Monthly Interest Rate (%):</label>
                  <input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    step="0.01"
                    value={form.monthly_interest_rate}
                    onChange={(e) => setForm({ ...form, monthly_interest_rate: e.target.value })}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-amber-600"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    Disburse Loan & Save Pledge
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
