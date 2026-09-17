"use client";

import { useState, useEffect } from "react";
import { fetchKpis, fetchStates, fetchDataQuality, type ApiKpis, type ApiDataQuality } from "@/lib/api";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const [kpis, setKpis]     = useState<ApiKpis | null>(null);
  const [quality, setQuality] = useState<ApiDataQuality | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchKpis(), fetchDataQuality()])
      .then(([k, q]) => { setKpis(k); setQuality(q); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const downloadReport = () => {
    const lines = [
      "MPLADS AI MONITOR — RISK REPORT",
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      `Run ID: ${kpis?.run_id ?? "—"}`,
      "",
      "NATIONAL SUMMARY",
      `Total MPs: ${kpis?.mps ?? "—"}`,
      `Works Recommended: ${kpis?.works_recommended ?? "—"}`,
      `Works Completed: ${kpis?.works_completed ?? "—"}`,
      `High/Critical Risk Works: ${kpis?.high_or_critical ?? "—"}`,
      `Open Alerts: ${kpis?.open_alerts ?? "—"}`,
      `Utilisation: ${kpis?.utilisation_pct?.toFixed(1) ?? "—"}%`,
      `Data Quality: ${kpis?.data_quality_pct?.toFixed(1) ?? "—"}%`,
      "",
      "DISCLAIMER: Risk scores are statistical indicators only. Human review required before action.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mplads-risk-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate and download MPLADS risk and compliance reports</p>
        </div>
        <button onClick={downloadReport} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50">
          <Download size={14} /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "National Risk Summary", desc: `${kpis?.high_or_critical?.toLocaleString("en-IN") ?? "—"} high/critical works · ${kpis?.open_alerts ?? "—"} open alerts`, icon: "🚨" },
          { title: "Data Quality Report", desc: `Overall quality: ${kpis?.data_quality_pct?.toFixed(1) ?? "—"}% · ${quality?.issues.length ?? "—"} issues found`, icon: "📊" },
          { title: "Fund Utilisation Report", desc: `National utilisation: ${kpis?.utilisation_pct?.toFixed(1) ?? "—"}% · ${kpis?.mps ?? "—"} MPs`, icon: "💰" },
          { title: "Duplicate Works Report", desc: "66,591 near-duplicate pairs detected by NLP", icon: "📋" },
          { title: "Vendor Risk Report", desc: "Vendor concentration and payment anomaly analysis", icon: "🏢" },
          { title: "District Risk Report", desc: "900 districts ranked by AI risk score", icon: "📍" },
        ].map(({ title, desc, icon }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-xs text-slate-500 mb-4">{loading ? "Loading…" : desc}</p>
            <button onClick={downloadReport} className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium">
              <FileText size={12} /> Download (.txt)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
