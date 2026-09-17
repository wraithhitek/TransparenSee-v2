"use client";

import { useState, useEffect } from "react";
import { fetchMps, fetchStates, bandColor, formatCr, type ApiMp, type ApiState } from "@/lib/api";
import { IndianRupee } from "lucide-react";

export default function FundUtilizationPage() {
  const [mps, setMps]         = useState<ApiMp[]>([]);
  const [states, setStates]   = useState<ApiState[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [bandFilter, setBandFilter]   = useState("");
  const [sortKey, setSortKey] = useState<"utilisation_pct" | "composite_risk" | "allocated_amount" | "high_risk_works">("composite_risk");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    Promise.all([
      fetchMps({ state: stateFilter || undefined, band: bandFilter || undefined, limit: 500 }),
      fetchStates(),
    ]).then(([m, s]) => { setMps(m); setStates(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [stateFilter, bandFilter]);

  const sorted = [...mps].sort((a, b) => {
    const av = a[sortKey] as number, bv = b[sortKey] as number;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const totalAllocated = mps.reduce((s, m) => s + (m.allocated_amount ?? 0), 0);
  const totalExpenditure = mps.reduce((s, m) => s + (m.derived_expenditure ?? 0), 0);
  const avgUtilisation = mps.length ? mps.reduce((s, m) => s + (m.utilisation_pct ?? 0), 0) / mps.length : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fund Utilization</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          MP-wise MPLADS fund allocation, expenditure, and utilisation rates
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total MPs", val: mps.length.toLocaleString("en-IN"), color: "text-slate-800" },
          { label: "Total Allocated", val: formatCr(totalAllocated), color: "text-sky-700" },
          { label: "Total Expenditure", val: formatCr(totalExpenditure), color: "text-green-700" },
          { label: "Avg Utilisation", val: `${avgUtilisation.toFixed(1)}%`, color: avgUtilisation < 50 ? "text-red-700" : "text-slate-700" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? "…" : val}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
          className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-sky-400">
          <option value="">All States</option>
          {states.map((s) => <option key={s.state} value={s.state}>{s.state}</option>)}
        </select>
        <select value={bandFilter} onChange={(e) => setBandFilter(e.target.value)}
          className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-sky-400">
          <option value="">All Risk Bands</option>
          {["CRITICAL", "HIGH", "MODERATE", "LOW"].map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <div className="flex items-center gap-2 ml-auto text-xs text-slate-500">
          Sort:
          {(["composite_risk", "utilisation_pct", "allocated_amount", "high_risk_works"] as const).map((k) => (
            <button key={k} onClick={() => { if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } }}
              className={`px-2 py-1 rounded border transition-colors font-semibold ${sortKey === k ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-200"}`}>
              {k.replace(/_/g, " ")} {sortKey === k ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading MP data…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">MP</th>
                  <th className="text-left px-4 py-2 font-medium">Constituency</th>
                  <th className="text-left px-4 py-2 font-medium">House</th>
                  <th className="text-right px-4 py-2 font-medium">Allocated</th>
                  <th className="text-right px-4 py-2 font-medium">Expenditure</th>
                  <th className="text-right px-4 py-2 font-medium">Utilisation</th>
                  <th className="text-right px-4 py-2 font-medium">Completion %</th>
                  <th className="text-right px-4 py-2 font-medium">Works</th>
                  <th className="text-right px-4 py-2 font-medium">High Risk</th>
                  <th className="text-right px-4 py-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((m) => (
                  <tr key={m.mp_key} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800 max-w-[160px] truncate">{m.mp_name}</td>
                    <td className="px-4 py-2 text-slate-500 max-w-[140px] truncate">{m.constituency}</td>
                    <td className="px-4 py-2 text-slate-500">{m.house === "Lok Sabha" ? "LS" : "RS"}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatCr(m.allocated_amount)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatCr(m.derived_expenditure)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.utilisation_pct > 90 ? "bg-green-500" : m.utilisation_pct > 60 ? "bg-amber-400" : "bg-red-500"}`}
                            style={{ width: `${Math.min(m.utilisation_pct, 100)}%` }} />
                        </div>
                        <span className={`font-semibold tabular-nums ${m.utilisation_pct < 50 ? "text-red-600" : m.utilisation_pct < 75 ? "text-amber-600" : "text-green-600"}`}>
                          {m.utilisation_pct?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{m.completion_rate_pct?.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right tabular-nums">{m.works_total}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={m.high_risk_works > 5 ? "text-red-600 font-semibold" : "text-slate-600"}>{m.high_risk_works}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${bandColor(m.risk_band)}`}>
                        {m.composite_risk.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t text-xs text-slate-500">
            {sorted.length} MPs shown
          </div>
        </div>
      )}
    </div>
  );
}
