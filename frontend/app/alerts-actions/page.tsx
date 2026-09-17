"use client";

import { useState, useEffect } from "react";
import { fetchAlerts, patchAlert, bandColor, type ApiAlert } from "@/lib/api";
import { Bell, CheckCircle, XCircle, Eye, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = ["OPEN", "UNDER_REVIEW", "VERIFIED", "FALSE_POSITIVE", "RESOLVED"];

const statusStyle: Record<string, string> = {
  OPEN: "bg-red-50 text-red-700 border-red-200",
  UNDER_REVIEW: "bg-sky-50 text-sky-700 border-sky-200",
  VERIFIED: "bg-orange-50 text-orange-700 border-orange-200",
  FALSE_POSITIVE: "bg-slate-50 text-slate-600 border-slate-200",
  RESOLVED: "bg-green-50 text-green-700 border-green-200",
};

export default function AlertsActionsPage() {
  const [alerts, setAlerts]         = useState<ApiAlert[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [updating, setUpdating]     = useState<string | null>(null);

  const load = (status?: string) => {
    setLoading(true);
    fetchAlerts({ status: status && status !== "ALL" ? status : undefined, limit: 500 })
      .then((a) => { setAlerts(a); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    setUpdating(alertId);
    try {
      await patchAlert(alertId, newStatus);
      setAlerts((prev) => prev.map((a) => a.alert_id === alertId ? { ...a, status: newStatus } : a));
    } catch (e) { console.error(e); }
    setUpdating(null);
  };

  const counts = ["OPEN", "UNDER_REVIEW", "VERIFIED", "FALSE_POSITIVE", "RESOLVED"].reduce((acc, s) => {
    acc[s] = alerts.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Alerts &amp; Actions</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          AI-raised alerts requiring human review and action
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "OPEN", "UNDER_REVIEW", "VERIFIED", "FALSE_POSITIVE", "RESOLVED"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${statusFilter === s ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"}`}>
            {s.replace("_", " ")}
            {s !== "ALL" && counts[s] !== undefined && <span className="ml-1.5 opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading alerts…</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          No alerts with status "{statusFilter}"
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.alert_id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusStyle[alert.status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {alert.status.replace("_", " ")}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${bandColor(alert.risk_band)}`}>
                      {alert.risk_band} · {alert.risk_score.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.entity_id}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">{alert.title}</h3>
                  <p className="text-xs text-slate-500 mb-1">{alert.state}{alert.district ? `, ${alert.district}` : ""}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.detected}</p>
                  {alert.recommended_action && (
                    <p className="text-xs text-sky-700 mt-2 p-2 bg-sky-50 border border-sky-100 rounded-lg">
                      <strong>Recommended:</strong> {alert.recommended_action}
                    </p>
                  )}
                </div>

                {/* Status changer */}
                <div className="shrink-0 flex flex-col gap-1.5 min-w-[140px]">
                  <select
                    value={alert.status}
                    onChange={(e) => handleStatusChange(alert.alert_id, e.target.value)}
                    disabled={updating === alert.alert_id}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:border-sky-400 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                  {updating === alert.alert_id && (
                    <span className="text-[10px] text-sky-600 text-center animate-pulse">Updating…</span>
                  )}
                  <a href={`/work/${alert.entity_id}`} className="text-[10px] text-sky-600 hover:underline text-center">
                    View Work Detail →
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">
                Raised {new Date(alert.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
