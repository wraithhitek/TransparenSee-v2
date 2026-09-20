"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileClock,
  FileWarning,
  HardHat,
  MapPin,
  PauseCircle,
  PlayCircle,
  Siren,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";

export function DistrictView() {
  const { selectedState, selectedDistrict } = useRole();

  const [activeTab, setActiveTab] = useState<"delayed" | "inspection" | "contractor">("delayed");

  return (
    <div className="space-y-3.5 animate-dashboard-in text-slate-800">
      {/* ================= DISTRICT OPERATIONAL HEADER ================= */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight tracking-tight text-slate-900">
              District Collectorate Command — {selectedDistrict}, {selectedState}
            </h1>
            <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
              Ground Execution Mode
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Operational Imperative: <strong className="text-emerald-900">14 works past SLA threshold</strong> · 7 field inspections overdue · Next District Coordination Committee in 4 days
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700">
            <Camera size={13} />
            <span>Order Field Inspection</span>
          </button>
        </div>
      </header>

      {/* ================= DISTRICT TAILORED KPIS ================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Active Works</div>
          <div className="mt-1 text-lg font-bold text-slate-900">184 Works</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            68 ongoing · 92 completed · 24 tendered
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Ground Velocity</div>
          <div className="mt-1 text-lg font-bold text-emerald-700">84.2%</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp size={11} />
            <span>Avg 128 days vs 180 days SLA</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">SLA Breach Sirens</div>
          <div className="mt-1 text-lg font-bold text-red-600">14 Delayed</div>
          <div className="mt-0.5 text-[10px] text-red-600 font-semibold">
            &gt;30 days overdue milestone
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Field Inspections Overdue</div>
          <div className="mt-1 text-lg font-bold text-amber-600">7 Sites</div>
          <div className="mt-0.5 text-[10px] text-amber-700 font-medium">
            Geo-tag verification pending
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Contractor Bill Queue</div>
          <div className="mt-1 text-lg font-bold text-slate-900">₹ 14.2 Cr</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            28 running bills under audit
          </div>
        </div>
      </section>

      {/* ================= SLA-BREACH SIREN ALERT ================= */}
      <section className="flex flex-col gap-2.5 rounded-lg border border-red-300 bg-red-50/80 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-600 animate-pulse">
            <Siren className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-red-800">
              Operational Siren: 14 Works Past Milestone SLA (+42 Days Overdue)
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-red-700">
              Contractors for Rohania Community Health Center and Kashi Bypass Culverts have missed 2 consecutive project milestones. Executive Engineer notice required.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-2xs hover:bg-red-50 cursor-pointer"
        >
          <span>Issue Show-Cause Notice</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* ================= MAIN DISTRICT GRID ================= */}
      <section className="grid min-w-0 items-start gap-3 lg:grid-cols-[1.2fr_1fr_1.1fr]">
        {/* COLUMN 1: Milestone Bottleneck Radar */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Milestone Pipeline Radar</h2>
            <p className="text-[11px] text-slate-400">Ground stage velocity from Proposal to Final Bill</p>
          </div>

          <div className="mt-4 space-y-4">
            {/* Stage 1 */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">1</span>
                <span className="h-8 w-0.5 bg-emerald-300 my-0.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">Administrative Sanction (DM)</span>
                  <span className="text-emerald-700">184 Sanctioned (100%)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Average sanction turnaround: 9 days (within 15-day target)</p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                <span className="h-8 w-0.5 bg-blue-300 my-0.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">Tendering & Work Order</span>
                  <span className="text-blue-700">160 Awarded (87%)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">24 works currently in technical tender evaluation</p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">3</span>
                <span className="h-8 w-0.5 bg-amber-300 my-0.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">Ground Construction</span>
                  <span className="text-amber-700">68 Underway (14 Delayed)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">SLA bottleneck: Material supply shortages in 3 blocks</p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white text-xs font-bold">4</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">Geo-Verification & Handover</span>
                  <span className="text-emerald-700">92 Fully Completed</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">7 works pending completion certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Implementing Agencies Accountability */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Executing Agencies</h2>
            <p className="text-[11px] text-slate-400">Departmental delivery scorecard</p>
          </div>

          <div className="mt-3 space-y-3">
            {[
              { agency: "Rural Engineering Dept (RED)", active: 48, completed: 38, delayed: 4, score: "92%" },
              { agency: "Public Works Dept (PWD - Provincial)", active: 56, completed: 32, delayed: 6, score: "84%" },
              { agency: "UP Jal Nigam (Rural Water)", active: 42, completed: 18, delayed: 3, score: "78%" },
              { agency: "District Urban Development Agency", active: 38, completed: 4, delayed: 1, score: "88%" },
            ].map((a, i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{a.agency}</span>
                  <span className="text-emerald-700">{a.score}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{a.active} works in hand · {a.completed} done</span>
                  <span className="text-red-600 font-semibold">{a.delayed} delayed</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-emerald-50/70 p-3 border border-emerald-100 text-xs">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <HardHat size={14} className="text-emerald-700" />
              <span>Executive Mandate</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
              Collectorate retains legal authority to invoke contractor bank guarantees for delays exceeding 60 days without approved force majeure.
            </p>
          </div>
        </div>

        {/* COLUMN 3: High Priority Action List */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Urgent Intervention List</h2>
              <p className="text-[11px] text-slate-400">Works requiring DM signature / action</p>
            </div>
            <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
              4 Critical
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {[
              { work: "RCC Drain & Road in Ward 14", agency: "PWD", overdue: "+48 days", action: "Show Cause", badge: "Delayed" },
              { work: "Solar High Mast Lights (10 Sites)", agency: "NEDA", overdue: "+35 days", action: "Release Fund", badge: "Milestone" },
              { work: "Primary Health Sub-Center Wardha", agency: "RED", overdue: "+42 days", action: "Site Visit", badge: "Overdue" },
              { work: "Community Library Infrastructure", agency: "DUDA", overdue: "+28 days", action: "Tender Re-eval", badge: "Tender" },
            ].map((item, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200/70 p-2.5 hover:bg-slate-50 transition-all">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.work}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.agency} · Overdue {item.overdue}</p>
                  </div>
                  <span className="rounded bg-red-50 border border-red-200 text-red-700 text-[9px] font-bold px-1.5 py-0.5">
                    {item.badge}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">SLA breach notice ready</span>
                  <button className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 cursor-pointer">
                    {item.action}
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

export default DistrictView;
