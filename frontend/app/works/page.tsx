"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchWorks, apiWorkToWork, fetchKpis } from "@/lib/api";
import { Work } from "@/types";
import { getRiskBand } from "@/lib/riskUtils";
import QueueFilters, { Filters } from "@/components/queue/QueueFilters";
import QueueTable from "@/components/queue/QueueTable";
import { BarChart2 } from "lucide-react";

const DEFAULT_FILTERS: Filters = { search: "", riskBand: "all", state: "All States", category: "all", status: "all" };

export default function WorksPage() {
  const [allWorks, setAllWorks] = useState<Work[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [minRisk, setMinRisk] = useState(0);

  useEffect(() => {
    Promise.all([
      fetchWorks({ limit: 1000, min_risk: minRisk }),
      fetchKpis(),
    ]).then(([ws, kpis]) => {
      setAllWorks(ws.map(apiWorkToWork));
      setTotalCount(kpis.works_recommended);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [minRisk]);

  const filtered = useMemo(() => allWorks.filter((w) => {
    if (filters.search) { const q = filters.search.toLowerCase(); if (!w.id.toLowerCase().includes(q) && !w.agencyName.toLowerCase().includes(q) && !w.description.toLowerCase().includes(q)) return false; }
    if (filters.riskBand !== "all" && getRiskBand(w.riskScore) !== filters.riskBand) return false;
    if (filters.state !== "All States" && w.state !== filters.state) return false;
    if (filters.category !== "all" && w.category !== filters.category) return false;
    if (filters.status !== "all" && w.status !== filters.status) return false;
    return true;
  }), [allWorks, filters]);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Works Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete register of {totalCount.toLocaleString("en-IN")} MPLADS works · AI risk-scored
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Min risk:</span>
          {[0, 25, 50, 75].map((v) => (
            <button key={v} onClick={() => setMinRisk(v)}
              className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${minRisk === v ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"}`}>
              {v}+
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Works", val: totalCount.toLocaleString("en-IN"), color: "text-sky-600" },
          { label: "Loaded", val: allWorks.length.toLocaleString("en-IN"), color: "text-slate-700" },
          { label: "Filtered", val: filtered.length.toLocaleString("en-IN"), color: "text-slate-700" },
          { label: "High/Critical", val: allWorks.filter(w => w.riskScore > 60).length.toLocaleString("en-IN"), color: "text-red-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <QueueFilters filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-sm text-slate-500">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading works…
        </div>
      ) : (
        <QueueTable works={filtered} onClearFilters={clearFilters} />
      )}
    </div>
  );
}
