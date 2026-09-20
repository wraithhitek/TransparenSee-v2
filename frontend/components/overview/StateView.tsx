"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Flame,
  Layers,
  MapPin,
  Scale,
  Send,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { fetchDistricts, fetchStates, type ApiDistrict, type ApiState } from "@/lib/api";

interface DistrictRow {
  name: string;
  rank: number;
  works: number;
  sanctionedCr: number;
  utilisedCr: number;
  absorptionPct: number;
  pendingApprovals: number;
  riskTier: "Low" | "Medium" | "High";
  sanctionedStatus?: boolean;
}

export function StateView() {
  const { selectedState, availableDistricts } = useRole();
  const [selectedSort, setSelectedSort] = useState<"rank" | "absorption" | "delay">("rank");

  // Real data state
  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [stateSummary, setStateSummary] = useState<ApiState | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & toast state
  const [arbitrationModalOpen, setArbitrationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reviewNoticeIssued, setReviewNoticeIssued] = useState(false);

  // Arbitration form state
  const [arbitrationAction, setArbitrationAction] = useState("Issue 15-Day Performance Ultimatum");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 4500);
  };

  // Fetch real districts for this state
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchDistricts(selectedState, 50).catch(() => [] as ApiDistrict[]),
      fetchStates().catch(() => [] as ApiState[]),
    ]).then(([apiDistricts, apiStates]) => {
      if (!isMounted) return;

      const currState = apiStates.find(
        (s) => s.state.toLowerCase() === selectedState.toLowerCase()
      );
      if (currState) setStateSummary(currState);

      if (apiDistricts && apiDistricts.length > 0) {
        const rows: DistrictRow[] = apiDistricts.slice(0, 10).map((d, i) => {
          const sanctioned = d.expenditure > 0 ? (d.expenditure * 1.25) / 10000000 : 35 + i * 5;
          const utilised = d.expenditure > 0 ? d.expenditure / 10000000 : 28 + i * 4;
          const abs = d.completion_rate_pct > 0 ? d.completion_rate_pct : Math.round((utilised / sanctioned) * 100);
          return {
            name: d.ida_district,
            rank: i + 1,
            works: d.works_recommended || 150 + i * 20,
            sanctionedCr: Number(sanctioned.toFixed(1)),
            utilisedCr: Number(utilised.toFixed(1)),
            absorptionPct: Number(abs.toFixed(1)),
            pendingApprovals: Math.max(1, Math.round(d.high_risk_works || 4)),
            riskTier: d.risk_score > 60 ? "High" : d.risk_score > 40 ? "Medium" : "Low",
          };
        });
        setDistricts(rows);
      } else {
        // Fallback using availableDistricts
        const defaultRows: DistrictRow[] = (availableDistricts.length > 0 ? availableDistricts : [
          "District A", "District B", "District C", "District D", "District E", "District F", "District G"
        ]).slice(0, 7).map((dName, i) => ({
          name: dName,
          rank: i + 1,
          works: 242 - i * 20,
          sanctionedCr: Number((48.5 - i * 4.1).toFixed(1)),
          utilisedCr: Number((42.1 - i * 4.7).toFixed(1)),
          absorptionPct: Number((86.8 - i * 4.8).toFixed(1)),
          pendingApprovals: 4 + i * 2,
          riskTier: i < 3 ? "Low" : i < 5 ? "Medium" : "High",
        }));
        setDistricts(defaultRows);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedState, availableDistricts]);

  // Derived metrics
  const totalOutlayCr = districts.reduce((acc, d) => acc + d.sanctionedCr, 0) || 485.0;
  const totalUtilisedCr = districts.reduce((acc, d) => acc + d.utilisedCr, 0) || 380.2;
  const avgAbsorption = totalOutlayCr > 0 ? ((totalUtilisedCr / totalOutlayCr) * 100).toFixed(1) : "78.4";
  const pendingSanctionsTotal = districts.reduce((acc, d) => acc + d.pendingApprovals, 0) || 34;

  const sortedDistricts = [...districts].sort((a, b) => {
    if (selectedSort === "absorption") return b.absorptionPct - a.absorptionPct;
    if (selectedSort === "delay") return b.pendingApprovals - a.pendingApprovals;
    return a.rank - b.rank;
  });

  // Export State Dossier
  const handleExportDossier = () => {
    const report = [
      `================================================================`,
      `GOVERNMENT OF ${selectedState.toUpperCase()} - STATE PLANNING DEPT`,
      `MPLADS COMPREHENSIVE IMPLEMENTATION & ARBITRATION DOSSIER (2026)`,
      `================================================================`,
      `Generated: ${new Date().toLocaleString()}`,
      `State Outlay: ₹ ${totalOutlayCr.toFixed(1)} Cr | Utilised: ₹ ${totalUtilisedCr.toFixed(1)} Cr (${avgAbsorption}%)`,
      `Total Pending State Sanctions: ${pendingSanctionsTotal} Works`,
      ``,
      `INTER-DISTRICT PERFORMANCE MATRIX:`,
      `----------------------------------------------------------------`,
      `Rank | District        | Works | Outlay (Cr) | Utilised (Cr) | Absorption | Risk`,
      `----------------------------------------------------------------`,
      ...sortedDistricts.map(
        (d) =>
          `#${d.rank.toString().padEnd(3)} | ${d.name.padEnd(15)} | ${d.works.toString().padEnd(5)} | ₹${d.sanctionedCr.toFixed(1).padStart(7)} Cr | ₹${d.utilisedCr.toFixed(1).padStart(7)} Cr | ${d.absorptionPct}%`.padEnd(10) +
          ` | ${d.riskTier}`
      ),
      `----------------------------------------------------------------`,
      `End of Official Cabinet Dossier`,
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPLADS_Cabinet_Dossier_${selectedState.replace(/\s+/g, "_")}_2026.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    triggerToast(`✓ State Cabinet Dossier for ${selectedState} exported successfully.`);
  };

  // Sanction a district tranche
  const handleSanctionDistrict = (districtName: string) => {
    setDistricts((prev) =>
      prev.map((d) =>
        d.name === districtName
          ? { ...d, pendingApprovals: Math.max(0, d.pendingApprovals - 1), sanctionedStatus: true }
          : d
      )
    );
    triggerToast(`✓ State Sanction authorized for ${districtName}. PFMS release note issued.`);
  };

  // Dispatch arbitration
  const handleDispatchArbitration = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewNoticeIssued(true);
    setArbitrationModalOpen(false);
    triggerToast(`✓ State Nodal Directive issued: "${arbitrationAction}". Compliance report required in 15 days.`);
  };

  return (
    <div className="relative space-y-3.5 animate-dashboard-in text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border border-purple-300 bg-purple-950 text-white px-4 py-3 shadow-2xl animate-fade-in">
          <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-purple-300 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================= STATE NARRATIVE HEADER ================= */}
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <h1
            className="truncate text-[19px] sm:text-[21px] font-bold leading-tight tracking-tight text-slate-900"
            title={`State Executive Assessment — ${selectedState}`}
          >
            State Executive Assessment — {selectedState}
          </h1>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            Comparative verdict: <strong className="text-purple-900">+{avgAbsorption}% absorption rate</strong> across {districts.length} active districts · Inter-district arbitration active
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex h-[36px] items-center rounded-lg border border-purple-200 bg-purple-50 px-3 text-xs font-bold text-purple-700 whitespace-nowrap shadow-2xs">
            Ranked 3rd of 28 States
          </span>
          <button
            onClick={handleExportDossier}
            className="inline-flex h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
          >
            <Download size={14} className="text-slate-500" />
            <span>State Cabinet Dossier</span>
          </button>
        </div>
      </header>

      {/* ================= STATE TAILORED KPIS ================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total State Outlay</div>
          <div className="mt-1 text-lg font-bold text-slate-900">₹ {totalOutlayCr.toFixed(1)} Cr</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp size={11} />
            <span>₹ {totalUtilisedCr.toFixed(1)} Cr utilised ({avgAbsorption}%)</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Comparative Ranking</div>
          <div className="mt-1 text-lg font-bold text-purple-700">Rank #3 / 28</div>
          <div className="mt-0.5 text-[10px] text-purple-600 font-semibold">
            Top 10% absorption index
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Pending State Sanctions</div>
          <div className="mt-1 text-lg font-bold text-amber-600">{pendingSanctionsTotal} Works</div>
          <div className="mt-0.5 text-[10px] text-amber-700 font-medium">
            ₹ {(pendingSanctionsTotal * 0.8).toFixed(1)} Cr awaiting State Nodal sign-off
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Inter-District Variance</div>
          <div className="mt-1 text-lg font-bold text-slate-900">12.4% Spread</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            Top: {districts[0]?.absorptionPct ?? 86.8}% · Bottom: {districts[districts.length - 1]?.absorptionPct ?? 57.9}%
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Grievance Redressal</div>
          <div className="mt-1 text-lg font-bold text-emerald-700">91.2%</div>
          <div className="mt-0.5 text-[10px] text-emerald-600 font-medium">
            Avg 11.4 days resolution time
          </div>
        </div>
      </section>

      {/* ================= TREND-BASED AMBER WARNING ALERT ================= */}
      <section className="flex flex-col gap-2.5 rounded-lg border border-amber-300/80 bg-amber-50/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
            <CircleAlert className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-amber-900">
              {reviewNoticeIssued
                ? "✓ State Arbitration Review Order Dispatched · Special Task Force Assigned"
                : `State Trend Advisory: Fund Lapse Trajectory in 2 Lagging Districts of ${selectedState}`}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-amber-800">
              {reviewNoticeIssued
                ? "Collectorates have been directed to rebalance uncommitted funds before Q3 close."
                : `${districts[districts.length - 1]?.name || "Bottom District"} shows absorption below 65%. Funds risk lapse if physical work-orders are not expedited.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setArbitrationModalOpen(true)}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-50 cursor-pointer transition-all active:scale-95"
        >
          <span>{reviewNoticeIssued ? "Review Arbitration Directives" : "Trigger Arbitration Review"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* ================= MAIN STATE GRID ================= */}
      <section className="grid min-w-0 items-start gap-3 lg:grid-cols-[1.35fr_1fr]">
        {/* COLUMN 1: District Performance & Arbitration Matrix */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inter-District Ranking Matrix</h2>
              <p className="text-[11px] text-slate-400">Comparative absorption, delivery velocity & risk tiering</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Sort:</span>
              <button
                onClick={() => setSelectedSort("rank")}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold cursor-pointer ${
                  selectedSort === "rank" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Rank
              </button>
              <button
                onClick={() => setSelectedSort("absorption")}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold cursor-pointer ${
                  selectedSort === "absorption" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Absorption
              </button>
              <button
                onClick={() => setSelectedSort("delay")}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold cursor-pointer ${
                  selectedSort === "delay" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                SLA Breaches
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-2">#</th>
                  <th className="pb-2">District</th>
                  <th className="pb-2 text-right">Works</th>
                  <th className="pb-2 text-right">Outlay</th>
                  <th className="pb-2 text-right">Absorption</th>
                  <th className="pb-2 text-right">Risk</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedDistricts.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-bold text-slate-400">#{d.rank}</td>
                    <td className="py-2.5">
                      <span className="font-bold text-slate-900 block">{d.name}</span>
                      <span className="text-[10px] text-slate-400">{d.pendingApprovals} pending approvals</span>
                    </td>
                    <td className="py-2.5 text-right font-medium">{d.works}</td>
                    <td className="py-2.5 text-right">
                      <span className="font-bold text-slate-800">₹{d.utilisedCr} Cr</span>
                      <span className="block text-[10px] text-slate-400">of ₹{d.sanctionedCr} Cr</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              d.absorptionPct >= 80 ? "bg-emerald-500" : d.absorptionPct >= 70 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${d.absorptionPct}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{d.absorptionPct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          d.riskTier === "Low"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : d.riskTier === "Medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {d.riskTier}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {d.sanctionedStatus ? (
                        <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-700">
                          <Check size={11} strokeWidth={2.5} />
                          <span>Sanctioned</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSanctionDistrict(d.name)}
                          className="rounded bg-purple-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-purple-700 cursor-pointer shadow-2xs transition-all active:scale-95"
                        >
                          Sanction
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMN 2: Sectoral Allocation & State Directives */}
        <div className="space-y-3">
          {/* Sectoral Breakdown */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">State Sectoral Distribution</h2>
              <p className="text-[11px] text-slate-400">Distribution across statutory development categories</p>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Rural Roads & Bridges</span>
                  <span className="font-bold text-slate-900">₹ 142.5 Cr (32%)</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: "32%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Drinking Water & Sanitation</span>
                  <span className="font-bold text-slate-900">₹ 121.0 Cr (27%)</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "27%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Education & Smart Classrooms</span>
                  <span className="font-bold text-slate-900">₹ 98.4 Cr (22%)</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "22%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Healthcare Facilities</span>
                  <span className="font-bold text-slate-900">₹ 83.1 Cr (19%)</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "19%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Trust Architecture Card */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 p-4 shadow-xs text-xs">
            <div className="flex items-center gap-2 font-bold text-purple-900">
              <Scale size={15} className="text-purple-700" />
              <span>Trust Architecture: State Arbitrates & Allocates</span>
            </div>
            <p className="mt-1.5 text-[11px] text-purple-900/80 leading-relaxed">
              State Nodal Authority commands horizontal arbitration powers to rebalance uncommitted funds from lagging districts to high-velocity administrative zones prior to statutory lapse.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MODAL: ARBITRATION REVIEW ================= */}
      {arbitrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-purple-200 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-100 text-purple-700">
                  <Scale size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Trigger State Arbitration Review</h3>
                  <p className="text-[11px] text-slate-500">Chief Secretary Inter-District Fund Rebalancing Directive</p>
                </div>
              </div>
              <button
                onClick={() => setArbitrationModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDispatchArbitration} className="mt-4 space-y-3.5">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <div className="font-bold text-slate-900">Target State Scope: {selectedState}</div>
                <div className="text-[11px] text-slate-600">
                  Lagging Districts Identified: {districts[districts.length - 1]?.name || "District F"} (Absorption: {districts[districts.length - 1]?.absorptionPct || "57.9"}%)
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Executive Arbitration Action
                </label>
                <select
                  value={arbitrationAction}
                  onChange={(e) => setArbitrationAction(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Issue 15-Day Performance Ultimatum to DM">Issue 15-Day Performance Ultimatum to Collectorate</option>
                  <option value="Depute State Quality Monitors (SQM) for Audit">Depute State Quality Monitors (SQM) for Ground Audit</option>
                  <option value="Reallocate ₹12 Cr Uncommitted Funds to High-Velocity District">Reallocate ₹12 Cr Uncommitted Funds to Top Performing District</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State Circular Note Body
                </label>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700 leading-relaxed font-mono">
                  "Notice is hereby given under State MPLADS Arbitration Powers. The identified district exhibits absorption variance exceeding permissible limits. Immediate acceleration of work-orders is mandated."
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setArbitrationModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 cursor-pointer shadow-sm"
                >
                  <Send size={13} />
                  <span>Dispatch State Directive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StateView;
