"use client";

import { useState, useEffect } from "react";
import { fetchWorks, apiWorkToWork, formatLakh } from "@/lib/api";
import { Work } from "@/types";
import { useRouter } from "next/navigation";
import { TrendingDown } from "lucide-react";

export default function InefficiencyDetectionPage() {
  const [works, setWorks]   = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Works with high utilisation risk signal low fund usage efficiency
    fetchWorks({ limit: 500, min_risk: 25 })
      .then((ws) => {
        const mapped = ws.map(apiWorkToWork);
        // Sort by utilisation + delay risk as proxy for inefficiency
        const inefficient = mapped.sort((a, b) => {
          const aScore = (ws.find(w => w.work_uid === a.id)?.utilisation_risk ?? 0) + (ws.find(w => w.work_uid === a.id)?.delay_risk ?? 0);
          const bScore = (ws.find(w => w.work_uid === b.id)?.utilisation_risk ?? 0) + (ws.find(w => w.work_uid === b.id)?.delay_risk ?? 0);
          return bScore - aScore;
        });
        setWorks(inefficient);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const delayedWorks   = works.filter((w) => w.reasons.some((r) => r.code === "DELAY"));
  const lowUtilWorks   = works.filter((w) => w.reasons.some((r) => r.code === "UTIL"));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Inefficiency Detection</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Works with timeline delays and low fund utilisation — indicators of implementation inefficiency
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1">Works Analysed</p>
          <p className="text-3xl font-bold text-slate-800">{loading ? "…" : works.length.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-5">
          <p className="text-xs text-amber-600 mb-1">Timeline Delays Detected</p>
          <p className="text-3xl font-bold text-amber-700">{loading ? "…" : delayedWorks.length.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 shadow-sm p-5">
          <p className="text-xs text-orange-600 mb-1">Low Utilisation Detected</p>
          <p className="text-3xl font-bold text-orange-700">{loading ? "…" : lowUtilWorks.length.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-800">
        <strong>Inefficiency signals:</strong> Works with delay risk &gt; 40 indicate significant timeline overruns. Works with utilisation risk &gt; 40 indicate MP funds are not being spent at expected rates. Both are risk components in the composite AI risk score.
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Detecting inefficiencies…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Work ID</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                  <th className="text-left px-4 py-2 font-medium">State</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-right px-4 py-2 font-medium">Risk</th>
                  <th className="text-left px-4 py-2 font-medium">Signals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {works.slice(0, 200).map((w) => (
                  <tr key={w.id} onClick={() => router.push(`/work/${w.id}`)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-4 py-2 font-mono font-semibold text-slate-700">{w.id}</td>
                    <td className="px-4 py-2 max-w-[240px] truncate text-slate-600">{w.description}</td>
                    <td className="px-4 py-2 text-slate-500">{w.state}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatLakh(w.sanctionedAmount * 1e5)}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${w.riskScore > 74 ? "bg-red-100 text-red-700" : w.riskScore > 49 ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>
                        {w.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1 flex-wrap">
                        {w.reasons.map((r) => (
                          <span key={r.code} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{r.label}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t text-xs text-slate-500">Showing top {Math.min(200, works.length)} works by inefficiency signals</div>
        </div>
      )}
    </div>
  );
}
