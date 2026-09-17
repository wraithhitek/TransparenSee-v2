"use client";

import { useState, useEffect } from "react";
import { fetchKpis, fetchStates, fetchMps, type ApiKpis } from "@/lib/api";

export default function OutcomeAnalyticsPage() {
  const [kpis, setKpis]   = useState<ApiKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [topMps, setTopMps]   = useState<Array<{ mp_name: string; completion_rate_pct: number; utilisation_pct: number; state: string }>>([]);

  useEffect(() => {
    Promise.all([fetchKpis(), fetchMps({ limit: 10 })])
      .then(([k, mps]) => {
        setKpis(k);
        setTopMps(mps.sort((a, b) => b.completion_rate_pct - a.completion_rate_pct).slice(0, 10).map(m => ({
          mp_name: m.mp_name, completion_rate_pct: m.completion_rate_pct,
          utilisation_pct: m.utilisation_pct, state: m.state,
        })));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const completionRate = kpis ? ((kpis.works_completed / kpis.works_recommended) * 100).toFixed(1) : "—";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Outcome Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          MPLADS implementation outcomes — completion rates, fund utilisation, and MP performance
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-20" />) : [
          { label: "Works Recommended", val: kpis?.works_recommended?.toLocaleString("en-IN") ?? "—", color: "text-sky-700" },
          { label: "Works Completed", val: kpis?.works_completed?.toLocaleString("en-IN") ?? "—", color: "text-green-700" },
          { label: "National Completion Rate", val: `${completionRate}%`, color: "text-slate-800" },
          { label: "National Utilisation", val: `${kpis?.utilisation_pct?.toFixed(1) ?? "—"}%`, color: kpis && kpis.utilisation_pct < 50 ? "text-red-700" : "text-green-700" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Top MPs by Completion Rate</h2>
        {loading ? <div className="text-center text-sm text-slate-500">Loading…</div> : (
          <div className="space-y-3">
            {topMps.map((m, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-slate-400 w-4 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700 truncate">{m.mp_name}</span>
                    <span className="text-xs text-slate-500 shrink-0 ml-2">{m.state}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(m.completion_rate_pct, 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-green-700 tabular-nums w-12 text-right shrink-0">{m.completion_rate_pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
