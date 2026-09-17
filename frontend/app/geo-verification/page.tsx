"use client";

import { useState, useEffect } from "react";
import { fetchDistricts, fetchStates, type ApiDistrict } from "@/lib/api";
import { MapPin } from "lucide-react";

export default function GeoVerificationPage() {
  const [districts, setDistricts] = useState<ApiDistrict[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchDistricts(undefined, 500)
      .then((d) => { setDistricts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Districts with concentrated works (high risk score) are candidates for geo verification
  const concentrated = districts.filter((d) => d.risk_score > 40).sort((a, b) => b.high_risk_works - a.high_risk_works);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Geo Verification</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Districts with concentrated high-risk works requiring physical geo-verification
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>Geo verification:</strong> Districts with multiple high-risk works within close proximity may indicate scope overlap, duplicate billing, or works that were never executed. Field officers should verify GPS-tagged photographs for works in these districts.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Districts</p>
          <p className="text-3xl font-bold text-slate-800">{loading ? "…" : districts.length}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-5 text-center">
          <p className="text-xs text-red-600 mb-1">Priority Verification (risk &gt; 40)</p>
          <p className="text-3xl font-bold text-red-700">{loading ? "…" : concentrated.length}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 shadow-sm p-5 text-center">
          <p className="text-xs text-orange-600 mb-1">Total High Risk Works</p>
          <p className="text-3xl font-bold text-orange-700">{loading ? "…" : districts.reduce((s, d) => s + d.high_risk_works, 0).toLocaleString("en-IN")}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Analysing districts…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b text-xs font-semibold text-slate-600">
            Priority Districts for Field Verification
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">District</th>
                  <th className="text-left px-4 py-2 font-medium">State</th>
                  <th className="text-right px-4 py-2 font-medium">Recommended</th>
                  <th className="text-right px-4 py-2 font-medium">High Risk Works</th>
                  <th className="text-right px-4 py-2 font-medium">Completion %</th>
                  <th className="text-right px-4 py-2 font-medium">Risk Score</th>
                  <th className="text-right px-4 py-2 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {concentrated.map((d) => {
                  const priority = d.high_risk_works > 20 ? "HIGH" : d.high_risk_works > 10 ? "MEDIUM" : "LOW";
                  return (
                    <tr key={`${d.state}-${d.ida_district}`} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5"><MapPin size={11} className="text-slate-400" />{d.ida_district}</div>
                      </td>
                      <td className="px-4 py-2 text-slate-500">{d.state}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{d.works_recommended}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`font-semibold ${d.high_risk_works > 20 ? "text-red-700" : d.high_risk_works > 10 ? "text-orange-700" : "text-slate-700"}`}>
                          {d.high_risk_works}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">{d.completion_rate_pct.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold">{d.risk_score.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${priority === "HIGH" ? "bg-red-100 text-red-700" : priority === "MEDIUM" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>
                          {priority}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
