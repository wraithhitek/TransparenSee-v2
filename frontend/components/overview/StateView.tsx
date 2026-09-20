"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
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
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";

export function StateView() {
  const { selectedState, availableDistricts } = useRole();
  const [selectedSort, setSelectedSort] = useState<"rank" | "absorption" | "delay">("rank");

  const districtsData = [
    { name: availableDistricts[0] || "District A", rank: 1, works: 242, sanctionedCr: 48.5, utilisedCr: 42.1, absorptionPct: 86.8, pendingApprovals: 4, riskTier: "Low" },
    { name: availableDistricts[1] || "District B", rank: 2, works: 198, sanctionedCr: 39.0, utilisedCr: 32.8, absorptionPct: 84.1, pendingApprovals: 6, riskTier: "Low" },
    { name: availableDistricts[2] || "District C", rank: 3, works: 176, sanctionedCr: 35.2, utilisedCr: 28.5, absorptionPct: 81.0, pendingApprovals: 3, riskTier: "Low" },
    { name: availableDistricts[3] || "District D", rank: 4, works: 164, sanctionedCr: 32.8, utilisedCr: 24.6, absorptionPct: 75.0, pendingApprovals: 8, riskTier: "Medium" },
    { name: availableDistricts[4] || "District E", rank: 5, works: 142, sanctionedCr: 29.4, utilisedCr: 20.9, absorptionPct: 71.1, pendingApprovals: 5, riskTier: "Medium" },
    { name: availableDistricts[5] || "District F", rank: 6, works: 130, sanctionedCr: 26.0, utilisedCr: 16.9, absorptionPct: 65.0, pendingApprovals: 9, riskTier: "High" },
    { name: availableDistricts[6] || "District G", rank: 7, works: 115, sanctionedCr: 23.5, utilisedCr: 13.6, absorptionPct: 57.9, pendingApprovals: 12, riskTier: "High" },
  ];

  const sortedDistricts = [...districtsData].sort((a, b) => {
    if (selectedSort === "absorption") return b.absorptionPct - a.absorptionPct;
    if (selectedSort === "delay") return b.pendingApprovals - a.pendingApprovals;
    return a.rank - b.rank;
  });

  return (
    <div className="space-y-3.5 animate-dashboard-in text-slate-800">
      {/* ================= STATE NARRATIVE HEADER ================= */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight tracking-tight text-slate-900">
              State Executive Assessment — {selectedState}
            </h1>
            <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
              Ranked 3rd of 28 States
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Comparative verdict: <strong className="text-purple-900">+4.2% higher absorption</strong> than national benchmark · 14 high-efficiency districts, 2 districts require arbitration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50">
            <Download size={13} className="text-slate-500" />
            <span>State Cabinet Dossier</span>
          </button>
        </div>
      </header>

      {/* ================= STATE TAILORED KPIS ================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total State Outlay</div>
          <div className="mt-1 text-lg font-bold text-slate-900">₹ 485.0 Cr</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp size={11} />
            <span>₹ 380.2 Cr utilised (78.4%)</span>
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
          <div className="mt-1 text-lg font-bold text-amber-600">34 Works</div>
          <div className="mt-0.5 text-[10px] text-amber-700 font-medium">
            ₹ 28.4 Cr awaiting State Nodal sign-off
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Inter-District Variance</div>
          <div className="mt-1 text-lg font-bold text-slate-900">12.4% Spread</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            Top: 86.8% · Bottom: 57.9%
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
              State Trend Advisory: Fund Lapse Trajectory in 2 Lagging Districts
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-amber-800">
              {districtsData[6].name} and {districtsData[5].name} show absorption below 65%. ₹18.4 Cr risks lapse by Q3 if physical work-orders are not expedited.
            </p>
          </div>
        </div>

        <Link
          href="/queue"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-50"
        >
          <span>Issue State Review Notice</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* ================= MAIN STATE GRID ================= */}
      <section className="grid min-w-0 items-start gap-3 lg:grid-cols-[1.15fr_1fr_1.15fr]">
        {/* COLUMN 1: District Performance Ranking Matrix */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">District Performance Ranking</h2>
              <p className="text-[11px] text-slate-400">Inter-district absorption & execution league</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedSort("rank")}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                  selectedSort === "rank" ? "bg-purple-100 text-purple-700" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Rank
              </button>
              <button
                type="button"
                onClick={() => setSelectedSort("absorption")}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                  selectedSort === "absorption" ? "bg-purple-100 text-purple-700" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Absorption
              </button>
              <button
                type="button"
                onClick={() => setSelectedSort("delay")}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                  selectedSort === "delay" ? "bg-purple-100 text-purple-700" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Backlog
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {sortedDistricts.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 transition-all hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold ${
                    i < 3 ? "bg-purple-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    #{d.rank}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{d.name}</div>
                    <div className="text-[10px] text-slate-400">{d.works} works · ₹{d.utilisedCr} Cr spent</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{d.absorptionPct}%</div>
                  <div className="flex items-center justify-end gap-1.5 text-[10px]">
                    <span className="text-slate-400">{d.pendingApprovals} pending</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      d.riskTier === "Low" ? "bg-emerald-500" : d.riskTier === "Medium" ? "bg-amber-400" : "bg-red-500"
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: Sectoral Allocation & State Fund Utilization */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">State Sectoral Outlay</h2>
            <p className="text-[11px] text-slate-400">Distribution of ₹485 Cr state MPLADS funds</p>
          </div>

          <div className="mt-4 space-y-3.5">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Rural Roads & Connectivity</span>
                <span className="font-bold text-slate-900">₹ 184.2 Cr (38%)</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: "38%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">88.4% physical completion rate</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Drinking Water & Sanitation</span>
                <span className="font-bold text-slate-900">₹ 121.5 Cr (25%)</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-cyan-500" style={{ width: "25%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">76.2% physical completion rate</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Education & Smart Classrooms</span>
                <span className="font-bold text-slate-900">₹ 97.0 Cr (20%)</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-purple-600" style={{ width: "20%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">82.1% physical completion rate</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Community Health Centers</span>
                <span className="font-bold text-slate-900">₹ 82.3 Cr (17%)</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: "17%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">69.4% physical completion rate</div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-purple-50/70 p-3 border border-purple-100">
            <div className="flex items-center gap-2 text-purple-900 text-xs font-bold">
              <Scale size={14} className="text-purple-600" />
              <span>State Arbitration Mandate</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-purple-800">
              State Nodal Authority maintains statutory power to re-align unspent district balances past 18 months into lagging priority blocks.
            </p>
          </div>
        </div>

        {/* COLUMN 3: Pending State Approvals Queue */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pending State Approvals</h2>
              <p className="text-[11px] text-slate-400">34 works awaiting administrative sanction</p>
            </div>
            <Link href="/queue" className="text-xs font-semibold text-purple-700 hover:text-purple-900">
              Full Queue
            </Link>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {[
              { title: "Bridge reconstruction on Varuna Tributary", district: availableDistricts[0] || "Varanasi", cost: "₹ 2.8 Cr", days: 14, mp: "Hon'ble MP" },
              { title: "Government Polytechnic Solar Microgrid", district: availableDistricts[1] || "Lucknow", cost: "₹ 1.9 Cr", days: 19, mp: "Hon'ble MP" },
              { title: "District Women's Hospital Oxygen Pipeline", district: availableDistricts[2] || "Prayagraj", cost: "₹ 3.4 Cr", days: 8, mp: "Hon'ble MP" },
              { title: "Multi-village piped water supply scheme", district: availableDistricts[3] || "Gorakhpur", cost: "₹ 4.2 Cr", days: 22, mp: "Hon'ble MP" },
            ].map((item, idx) => (
              <div key={idx} className="py-2.5 transition-all hover:bg-slate-50 px-1 rounded">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{item.district} · {item.mp}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-slate-900">{item.cost}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Clock size={11} />
                    <span>In review for {item.days} days</span>
                  </span>
                  <button className="rounded bg-purple-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-purple-700 cursor-pointer">
                    Sanction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StateView;
