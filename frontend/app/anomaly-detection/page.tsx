"use client";

import { useState, useEffect } from "react";
import { fetchWorks, apiWorkToWork, bandColor, formatLakh } from "@/lib/api";
import { Work } from "@/types";
import { useRouter } from "next/navigation";
import { Radar, AlertTriangle } from "lucide-react";

export default function AnomalyDetectionPage() {
  const [works, setWorks]   = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // High risk works are the ones flagged by ML anomaly ensemble
    fetchWorks({ limit: 500, min_risk: 50 })
      .then((ws) => { setWorks(ws.map(apiWorkToWork)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const critical = works.filter((w) => w.riskScore > 80);
  const high     = works.filter((w) => w.riskScore > 60 && w.riskScore <= 80);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Anomaly Detection</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Works flagged by the ML anomaly ensemble (IsolationForest + LOF + DBSCAN)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Anomalous Works</p>
          <p className="text-3xl font-bold text-slate-800">{loading ? "…" : works.length.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-5 text-center">
          <p className="text-xs text-red-600 mb-1">Critical (81–100)</p>
          <p className="text-3xl font-bold text-red-700">{loading ? "…" : critical.length.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 shadow-sm p-5 text-center">
          <p className="text-xs text-orange-600 mb-1">High (61–80)</p>
          <p className="text-3xl font-bold text-orange-700">{loading ? "…" : high.length.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-800">
        <strong>How anomaly detection works:</strong> Three unsupervised ML models — Isolation Forest (3,804 flags), LOF (1,800 flags), and DBSCAN (21,172 noise points) — independently score each work. Works flagged by ≥2 models receive an ensemble anomaly signal that uplifts their composite risk score by up to 15%.
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Running anomaly models…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <Radar size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Anomalous Works (risk ≥ 50)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-slate-500">
                  <th className="text-left px-4 py-2 font-medium">Work ID</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                  <th className="text-left px-4 py-2 font-medium">State / District</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-right px-4 py-2 font-medium">Risk</th>
                  <th className="text-right px-4 py-2 font-medium">Top Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {works.slice(0, 200).map((w) => {
                  const topReason = w.reasons.sort((a, b) => b.weight - a.weight)[0];
                  return (
                    <tr key={w.id} onClick={() => router.push(`/work/${w.id}`)} className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-2 font-mono font-semibold text-slate-700">{w.id}</td>
                      <td className="px-4 py-2 max-w-[240px] truncate text-slate-600">{w.description}</td>
                      <td className="px-4 py-2 text-slate-500">{w.district}, {w.state}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatLakh(w.sanctionedAmount * 1e5)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${w.riskScore > 80 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                          {w.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-slate-500">{topReason?.label ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            Showing top {Math.min(200, works.length)} of {works.length} anomalous works
          </div>
        </div>
      )}
    </div>
  );
}
