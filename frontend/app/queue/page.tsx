"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchWorks, apiWorkToWork } from "@/lib/api";
import { Work } from "@/types";
import { getRiskBand } from "@/lib/riskUtils";
import QueueFilters, { Filters } from "@/components/queue/QueueFilters";
import QueueTable from "@/components/queue/QueueTable";

const DEFAULT_FILTERS: Filters = {
  search: "", riskBand: "all", state: "All States", category: "all", status: "all",
};

export default function QueuePage() {
  const [allWorks, setAllWorks] = useState<Work[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filters, setFilters]   = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    fetchWorks({ limit: 1000, min_risk: 0 })
      .then((ws) => { setAllWorks(ws.map(apiWorkToWork)); setLoading(false); })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return allWorks.filter((w) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!w.id.toLowerCase().includes(q) && !w.agencyName.toLowerCase().includes(q) && !w.description.toLowerCase().includes(q))
          return false;
      }
      if (filters.riskBand !== "all" && getRiskBand(w.riskScore) !== filters.riskBand) return false;
      if (filters.state !== "All States" && w.state !== filters.state) return false;
      if (filters.category !== "all" && w.category !== filters.category) return false;
      if (filters.status !== "all" && w.status !== filters.status) return false;
      return true;
    });
  }, [allWorks, filters]);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Investigation Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All AI-flagged works · sorted by risk score · {loading ? "Loading…" : `${allWorks.length.toLocaleString("en-IN")} works loaded`}
          </p>
        </div>
        {error && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-xs">
            ⚠ API error — showing cached data. {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <QueueFilters filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-sm text-slate-500">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading works from ML pipeline…
        </div>
      ) : (
        <>
          <div className="text-xs text-slate-500 px-1">
            Showing <strong className="text-slate-700">{filtered.length.toLocaleString("en-IN")}</strong> of {allWorks.length.toLocaleString("en-IN")} works
          </div>
          <QueueTable works={filtered} onClearFilters={clearFilters} />
        </>
      )}
    </div>
  );
}
