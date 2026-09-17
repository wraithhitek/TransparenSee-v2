"use client";

import { useState, useEffect } from "react";
import { fetchDistricts, fetchStates, type ApiDistrict, type ApiState } from "@/lib/api";
import { MapPin } from "lucide-react";

export default function DistrictIntelligencePage() {
  const [districts, setDistricts] = useState<ApiDistrict[]>([]);
  const [states, setStates]       = useState<ApiState[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedState, setSelectedState] = useState("");
  const [sortKey, setSortKey]     = useState<keyof ApiDistrict>("risk_score");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("desc");

  useEffect(() => {
    Promise.all([fetchDistricts(selectedState || undefined), fetchStates()])
      .then(([d, s]) => { setDistricts(d); setStates(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedState]);

  const sorted = [...districts].sort((a, b) => {
    const av = a[sortKey] as number, bv = b[sortKey] as number;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const toggleSort = (k: keyof ApiDistrict) => {
    if (sortKey === k) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const thBtn = (label: string, key: keyof ApiDistrict) => (
    <th className="text-right px-4 py-2 font-medium cursor-pointer hover:text-slate-700 whitespace-nowrap select-none"
      onClick={() => toggleSort(key)}>
      {label} {sortKey === key ? (sortDir === "desc" ? "↓" : "↑") : ""}
    </th>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">District Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Loading…" : `${districts.length} districts`} with MPLADS works risk profiles
          </p>
        </div>
        <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
          className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-sky-400">
          <option value="">All States</option>
          {states.map((s) => <option key={s.state} value={s.state}>{s.state}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading district data…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">District</th>
                  <th className="text-left px-4 py-2 font-medium">State</th>
                  {thBtn("Recommended", "works_recommended")}
                  {thBtn("Completed", "works_completed")}
                  {thBtn("Completion %", "completion_rate_pct")}
                  {thBtn("High Risk Works", "high_risk_works")}
                  {thBtn("Risk Score", "risk_score")}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((d) => (
                  <tr key={`${d.state}-${d.ida_district}`} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-400" />
                        {d.ida_district}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{d.state}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{d.works_recommended.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{d.works_completed.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <span className={`font-semibold ${d.completion_rate_pct < 50 ? "text-red-600" : d.completion_rate_pct < 75 ? "text-amber-600" : "text-green-600"}`}>
                        {d.completion_rate_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <span className={d.high_risk_works > 10 ? "text-red-600 font-semibold" : "text-slate-700"}>{d.high_risk_works}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${d.risk_score > 74 ? "bg-red-100 text-red-700" : d.risk_score > 49 ? "bg-orange-100 text-orange-700" : d.risk_score > 24 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {d.risk_score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t text-xs text-slate-500">
            {sorted.length} districts shown · Click column headers to sort
          </div>
        </div>
      )}
    </div>
  );
}
