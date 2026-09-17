"use client";

import { useState, useEffect } from "react";
import { fetchKpis, fetchStates, type ApiKpis, type ApiState } from "@/lib/api";
import { TrendingUp } from "lucide-react";

export default function TrendForecastingPage() {
  const [kpis, setKpis]     = useState<ApiKpis | null>(null);
  const [states, setStates] = useState<ApiState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchKpis(), fetchStates()])
      .then(([k, s]) => { setKpis(k); setStates(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Trend &amp; Forecasting</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          MPLADS fund utilisation trends and risk trajectory across states
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {loading ? Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse"><div className="h-3 bg-slate-200 rounded w-2/3 mb-3" /><div className="h-8 bg-slate-200 rounded w-1/2" /></div>
        )) : [
          { label: "Utilisation Rate", val: `${kpis?.utilisation_pct?.toFixed(1) ?? "—"}%`, sub: "national average", trend: (kpis?.utilisation_pct ?? 0) > 70 ? "↑" : "↓", color: (kpis?.utilisation_pct ?? 0) > 70 ? "text-green-700" : "text-red-700" },
          { label: "Completion Rate", val: kpis ? `${((kpis.works_completed / kpis.works_recommended) * 100).toFixed(1)}%` : "—", sub: "works completed", trend: "→", color: "text-slate-700" },
          { label: "Open Alerts", val: kpis?.open_alerts?.toLocaleString("en-IN") ?? "—", sub: "requiring action", trend: "↑", color: "text-red-700" },
        ].map(({ label, val, sub, trend, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs text-slate-500 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{val} <span className="text-base">{trend}</span></p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">State-wise Utilisation</h2>
        {loading ? <div className="text-center text-sm text-slate-500 py-4">Loading…</div> : (
          <div className="space-y-3">
            {states.sort((a, b) => a.mean_risk - b.mean_risk).map((s) => (
              <div key={s.state}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{s.state}</span>
                  <span className="text-xs text-slate-500">{s.works.toLocaleString("en-IN")} works · {s.high_risk} high risk</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.mean_risk > 50 ? "bg-red-400" : s.mean_risk > 25 ? "bg-amber-400" : "bg-green-400"}`}
                    style={{ width: `${s.mean_risk}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
        <TrendingUp size={16} className="inline mr-2 text-slate-400" />
        <strong>Predictive modelling:</strong> The HistGradientBoosting completion propensity model scores open works by their likelihood of completion, trained on the patterns of 43,173 completed works. Low propensity scores indicate works at risk of stalling.
      </div>
    </div>
  );
}
