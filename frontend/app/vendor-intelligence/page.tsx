"use client";

import { useState, useEffect } from "react";
import { fetchVendors, bandColor, formatLakh, type ApiVendor } from "@/lib/api";
import { Building2 } from "lucide-react";

export default function VendorIntelligencePage() {
  const [vendors, setVendors]   = useState<ApiVendor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [minRisk, setMinRisk]   = useState(0);
  const [sortKey, setSortKey]   = useState<"composite_risk" | "total_amount" | "payment_lines" | "district_share">("composite_risk");
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchVendors({ limit: 500, min_risk: minRisk })
      .then((v) => { setVendors(v); setLoading(false); })
      .catch(() => setLoading(false));
  }, [minRisk]);

  const sorted = [...vendors].sort((a, b) => {
    const av = (a[sortKey] as number) ?? 0, bv = (b[sortKey] as number) ?? 0;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const highRisk = vendors.filter((v) => v.composite_risk > 60);
  const totalAmount = vendors.reduce((s, v) => s + v.total_amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Vendor Intelligence</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          AI risk profiles for {vendors.length.toLocaleString("en-IN")} vendors across all districts
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Vendors", val: vendors.length.toLocaleString("en-IN"), color: "text-slate-800" },
          { label: "High/Critical Risk", val: highRisk.length.toLocaleString("en-IN"), color: "text-red-700" },
          { label: "Total Payments", val: formatLakh(totalAmount), color: "text-sky-700" },
          { label: "Avg Risk Score", val: vendors.length ? (vendors.reduce((s, v) => s + v.composite_risk, 0) / vendors.length).toFixed(1) : "—", color: "text-slate-700" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? "…" : val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-500">Min risk:</span>
        {[0, 25, 50, 75].map((v) => (
          <button key={v} onClick={() => setMinRisk(v)}
            className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${minRisk === v ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
            {v}+
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-3">Sort by:</span>
        {(["composite_risk", "total_amount", "payment_lines", "district_share"] as const).map((k) => (
          <button key={k} onClick={() => { if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } }}
            className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${sortKey === k ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            {k.replace(/_/g, " ")} {sortKey === k ? (sortDir === "desc" ? "↓" : "↑") : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading vendor data…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Vendor</th>
                  <th className="text-left px-4 py-2 font-medium">State / District</th>
                  <th className="text-right px-4 py-2 font-medium">Payment Lines</th>
                  <th className="text-right px-4 py-2 font-medium">Total Amount</th>
                  <th className="text-right px-4 py-2 font-medium">District Share %</th>
                  <th className="text-right px-4 py-2 font-medium">Repeat Line %</th>
                  <th className="text-right px-4 py-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.slice(0, 300).map((v) => (
                  <tr key={v.vendor_uid} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={11} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800 max-w-[200px] truncate">{v.vendor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{v.ida_district}, {v.state}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{(v.payment_lines ?? 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatLakh(v.total_amount ?? 0)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <span className={(v.district_share ?? 0) > 50 ? "text-red-600 font-semibold" : ""}>{(v.district_share ?? 0).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <span className={(v.repeat_line_share ?? 0) > 30 ? "text-orange-600 font-semibold" : ""}>{(v.repeat_line_share ?? 0).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${bandColor(v.risk_band)}`}>
                        {v.composite_risk.toFixed(0)} {v.risk_band}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t text-xs text-slate-500">
            Showing {Math.min(300, sorted.length)} of {sorted.length} vendors
          </div>
        </div>
      )}
    </div>
  );
}
