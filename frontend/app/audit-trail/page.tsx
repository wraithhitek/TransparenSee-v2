"use client";

import { useState, useEffect } from "react";
import { fetchLineage, fetchDataQuality, type ApiLineage, type ApiDataQuality } from "@/lib/api";
import { GitBranch, CheckCircle, AlertTriangle } from "lucide-react";

export default function AuditTrailPage() {
  const [lineage, setLineage]   = useState<ApiLineage[]>([]);
  const [quality, setQuality]   = useState<ApiDataQuality | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([fetchLineage(), fetchDataQuality()])
      .then(([l, q]) => { setLineage(l); setQuality(q); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const qualityMetrics = quality?.metrics.filter((m) => m.metric === "overall_data_quality_pct" || m.dataset === "overall");
  const overallQuality = quality?.metrics.find((m) => m.metric === "overall_data_quality_pct")?.value;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pipeline lineage and data quality report for the current run
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading audit data…</p>
        </div>
      ) : (
        <>
          {/* Data Quality Summary */}
          {quality && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <CheckCircle size={15} className="text-green-500" /> Data Quality Report
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {["validity", "completeness", "uniqueness", "reconciliation"].map((dim) => {
                  const m = quality.metrics.find((x) => x.metric === `${dim}_pct`);
                  const val = m?.value ?? 0;
                  return (
                    <div key={dim} className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${val >= 90 ? "text-green-600" : val >= 75 ? "text-amber-600" : "text-red-600"}`}>
                        {val.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-500 capitalize">{dim}</div>
                    </div>
                  );
                })}
              </div>
              {overallQuality !== undefined && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                  <strong className="text-green-700">Overall Data Quality: {overallQuality.toFixed(2)}%</strong>
                </div>
              )}

              {/* Issues */}
              {quality.issues.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold text-slate-600 mb-3">Validation Issues</h3>
                  <div className="space-y-2">
                    {quality.issues.map((issue, i) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${issue.severity === "ERROR" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                        <AlertTriangle size={12} className={issue.severity === "ERROR" ? "text-red-500 mt-0.5" : "text-amber-500 mt-0.5"} />
                        <div>
                          <span className="font-semibold text-slate-700">{issue.dataset}</span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-slate-600">{issue.rule}</span>
                          <span className="text-slate-400 ml-2">({issue.record_count} records)</span>
                          {issue.detail && <p className="text-slate-500 mt-0.5">{issue.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pipeline Lineage */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <GitBranch size={15} className="text-slate-500" /> Pipeline Lineage ({lineage.length} steps)
            </h2>
            <ol className="space-y-3">
              {lineage.map((l, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center border border-sky-200">{i + 1}</div>
                    {i < lineage.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 mb-0 h-4" />}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{l.stage}</span>
                      <span className="text-xs text-slate-600">{l.action}</span>
                      <span className="text-xs text-slate-400">{new Date(l.ts).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" })}</span>
                    </div>
                    {l.detail && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{l.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
