"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { fetchWorks, apiWorkToWork } from "@/lib/api";
import { Work, RiskBand } from "@/types";
import { getRiskBand, getRiskBandCounts } from "@/lib/riskUtils";
import RiskBandToggle from "@/components/map/RiskBandToggle";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-slate-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading map…</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [works, setWorks]       = useState<Work[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeBand, setActiveBand] = useState<RiskBand | "all">("all");

  // Only load high-risk works for the map (performance — 126K pins is too many)
  useEffect(() => {
    fetchWorks({ limit: 1000, min_risk: 50 })
      .then((ws) => { setWorks(ws.map(apiWorkToWork)); setLoading(false); })
      .catch(() => {
        // fallback to static
        import("@/data/works").then(({ works: sw }) => { setWorks(sw); setLoading(false); });
      });
  }, []);

  const counts = getRiskBandCounts(works);
  const visibleCount = useMemo(() => {
    if (activeBand === "all") return works.length;
    return works.filter((w) => getRiskBand(w.riskScore) === activeBand).length;
  }, [works, activeBand]);

  return (
    <div className="space-y-4 h-full">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Map View</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Geographic distribution of flagged works (risk ≥ 50) — click a pin for details
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <RiskBandToggle active={activeBand} onChange={setActiveBand} />
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {loading ? (
            <span className="animate-pulse">Loading works…</span>
          ) : (
            <>
              <span>Showing <strong className="text-slate-700">{visibleCount}</strong> of {works.length} works</span>
              <span>·</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-red-800 mr-1" />Critical: {counts.critical}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />High: {counts.high}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Medium: {counts.medium}</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MapView works={works} activeBand={activeBand} />
        )}
      </div>

      <p className="text-xs text-slate-400 italic text-center">
        Map data © OpenStreetMap contributors · Pin size scales with risk score · Coordinates are district-level approximations
      </p>
    </div>
  );
}
