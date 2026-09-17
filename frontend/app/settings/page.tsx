"use client";

import { useState, useEffect } from "react";
import { fetchMeta, type ApiMeta } from "@/lib/api";

export default function SettingsPage() {
  const [meta, setMeta]     = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeta().then((m) => { setMeta(m); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">System configuration and model version information</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      ) : meta ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">System Versions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Platform", val: meta.platform },
                { label: "Risk Engine", val: meta.versions.risk_engine },
                { label: "Feature Version", val: meta.versions.features },
                { label: "Model Version", val: meta.versions.model },
                { label: "Current Run", val: meta.run_id },
                { label: "Your Role", val: meta.role },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 font-mono">{val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Risk Band Configuration</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(meta.risk_bands).map(([band, config]) => (
                <div key={band} className={`p-3 rounded-lg text-center border ${band === "CRITICAL" ? "bg-red-50 border-red-200" : band === "HIGH" ? "bg-orange-50 border-orange-200" : band === "MODERATE" ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                  <p className="text-xs font-bold mb-1">{band}</p>
                  <p className="text-xs text-slate-600">{JSON.stringify(config)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Datasets in Current Run</h2>
            <div className="space-y-2">
              {meta.datasets.map((d) => (
                <div key={d.dataset} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-700">{d.dataset}</span>
                    <span className="text-xs text-slate-400 ml-2">{d.record_count.toLocaleString("en-IN")} records</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${d.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
