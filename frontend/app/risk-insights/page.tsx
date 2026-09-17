"use client";

import { useState, useEffect } from "react";
import { fetchStates, fetchKpis, fetchWorks, type ApiState, type ApiKpis } from "@/lib/api";
import { getRiskBand } from "@/lib/riskUtils";

export default function RiskInsightsPage() {
  const [states, setStates]   = useState<ApiState[]>([]);
  const [kpis, setKpis]       = useState<ApiKpis | null>(null);
  const [riskDist, setRiskDist] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStates(), fetchKpis(), fetchWorks({ limit: 1000, min_risk: 0 })])
      .then(([s, k, works]) => {
        setStates(s);
        setKpis(k);
        const dist = { critical: 0, high: 0, medium: 0, low: 0 };
        works.forEach((w) => { dist[getRiskBand(Math.round(w.composite_risk))]++; });
        setRiskDist(dist);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const total = riskDist.critical + riskDist.high + riskDist.medium + riskDist.low || 1;
  const bands = [
    { label: "Critical (75–100)", val: riskDist.critical, color: "bg-red-600", text: "text-red-700", pct: (riskDist.critical / total * 100) },
    { label: "High (50–74)",      val: riskDist.high,     color: "bg-orange-500", text: "text-orange-700", pct: (riskDist.high / total * 100) },
    { label: "Moderate (25–49)", val: riskDist.medium,   color: "bg-amber-400", text: "text-amber-700", pct: (riskDist.medium / total * 100) },
    { label: "Low (0–24)",        val: riskDist.low,      color: "bg-green-500", text: "text-green-700", pct: (riskDist.low / total * 100) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">AI Risk Insights</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Risk distribution across all states and MPs from the ML pipeline
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-2/3 mb-3" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
          </div>
        )) : [
          { label: "Mean Risk Score", val: kpis?.mean_risk?.toFixed(1) ?? "—", sub: "/100", color: "text-slate-800" },
          { label: "High or Critical", val: kpis?.high_or_critical?.toLocaleString("en-IN") ?? "—", sub: "works", color: "text-red-700" },
          { label: "Critical Works", val: kpis?.critical?.toLocaleString("en-IN") ?? "—", sub: "works", color: "text-red-900" },
          { label: "Data Quality", val: `${kpis?.data_quality_pct?.toFixed(1) ?? "—"}%`, sub: "overall", color: "text-green-700" },
        ].map(({ label, val, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{val} <span className="text-xs font-normal text-slate-400">{sub}</span></p>
          </div>
        ))}
      </div>

      {/* Risk Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Risk Band Distribution</h2>
        <div className="space-y-4">
          {bands.map(({ label, val, color, text, pct }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`text-sm font-bold tabular-nums ${text}`}>
                  {val.toLocaleString("en-IN")} <span className="text-slate-400 font-normal text-xs">({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Rankings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">State Risk Rankings</h2>
        {loading ? (
          <div className="text-center text-sm text-slate-500 py-4">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="text-left pb-2 font-medium">#</th>
                  <th className="text-left pb-2 font-medium">State</th>
                  <th className="text-right pb-2 font-medium">Works</th>
                  <th className="text-right pb-2 font-medium">High Risk</th>
                  <th className="text-right pb-2 font-medium">High Risk %</th>
                  <th className="text-right pb-2 font-medium">Mean Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {states.map((s, i) => (
                  <tr key={s.state} className="hover:bg-slate-50">
                    <td className="py-2 text-slate-400">{i + 1}</td>
                    <td className="py-2 font-medium text-slate-800">{s.state}</td>
                    <td className="py-2 text-right tabular-nums">{s.works.toLocaleString("en-IN")}</td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={s.high_risk > 100 ? "text-red-600 font-semibold" : "text-slate-700"}>{s.high_risk.toLocaleString("en-IN")}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={`font-semibold ${s.works ? (s.high_risk / s.works * 100) > 10 ? "text-red-600" : "text-slate-600" : "text-slate-600"}`}>
                        {s.works ? (s.high_risk / s.works * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.mean_risk > 50 ? "bg-red-400" : s.mean_risk > 25 ? "bg-amber-400" : "bg-green-400"}`}
                            style={{ width: `${s.mean_risk}%` }} />
                        </div>
                        <span className="tabular-nums">{s.mean_risk.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
