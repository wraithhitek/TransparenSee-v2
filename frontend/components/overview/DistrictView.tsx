"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileClock,
  FileText,
  FileWarning,
  HardHat,
  MapPin,
  PauseCircle,
  PlayCircle,
  Send,
  ShieldAlert,
  Siren,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { fetchWorks, toWorkShape, type WorkShape } from "@/lib/api";

interface UrgentItem {
  id: string;
  work: string;
  agency: string;
  overdue: string;
  action: "Show Cause" | "Release Fund" | "Site Visit" | "Tender Re-eval";
  badge: string;
  status: "pending" | "notice_issued" | "fund_released" | "visit_scheduled" | "tender_revaluated";
  amountCr?: number;
}

export function DistrictView() {
  const { selectedState, selectedDistrict } = useRole();

  // Real data state
  const [districtWorks, setDistrictWorks] = useState<WorkShape[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [showCauseModalOpen, setShowCauseModalOpen] = useState(false);
  const [releaseFundModalOpen, setReleaseFundModalOpen] = useState(false);
  const [siteVisitModalOpen, setSiteVisitModalOpen] = useState(false);

  // Active target work for modals
  const [targetItem, setTargetItem] = useState<UrgentItem | null>(null);

  // Inspection form state
  const [inspectionTeam, setInspectionTeam] = useState("District Technical Vigilance Cell");
  const [inspectionObjective, setInspectionObjective] = useState("Physical Milestone & Quality Verification");
  const [inspectionDate, setInspectionDate] = useState("2026-09-24");
  const [inspectionTargetWork, setInspectionTargetWork] = useState("");

  // Show cause form state
  const [noticeDeadline, setNoticeDeadline] = useState("7 Days");
  const [noticeReason, setNoticeReason] = useState("Consecutive Milestone SLA Breaches (>42 Days Delay)");

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Overdue inspections count state
  const [overdueInspections, setOverdueInspections] = useState(7);

  // Urgent intervention items state
  const [urgentItems, setUrgentItems] = useState<UrgentItem[]>([
    {
      id: "urg-1",
      work: `RCC Drain & Road in Ward 14 (${selectedDistrict})`,
      agency: "Public Works Dept (PWD)",
      overdue: "+48 days",
      action: "Show Cause",
      badge: "Delayed",
      status: "pending",
      amountCr: 0.85,
    },
    {
      id: "urg-2",
      work: `Solar High Mast Lights (10 Sites) — ${selectedDistrict}`,
      agency: "NEDA / Renewable Energy Agency",
      overdue: "+35 days",
      action: "Release Fund",
      badge: "Milestone",
      status: "pending",
      amountCr: 0.35,
    },
    {
      id: "urg-3",
      work: `Primary Health Sub-Center in Block B`,
      agency: "Rural Engineering Dept (RED)",
      overdue: "+42 days",
      action: "Site Visit",
      badge: "Overdue",
      status: "pending",
      amountCr: 1.2,
    },
    {
      id: "urg-4",
      work: `Community Library & Digital Hall`,
      agency: "District Urban Development Agency",
      overdue: "+28 days",
      action: "Tender Re-eval",
      badge: "Tender",
      status: "pending",
      amountCr: 0.65,
    },
  ]);

  // Fetch real works for this district & state
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchWorks({ state: selectedState, district: selectedDistrict, limit: 300 })
      .then((works) => {
        if (!isMounted) return;
        if (works && works.length > 0) {
          const shaped = works.map(toWorkShape);
          setDistrictWorks(shaped);
          if (shaped[0]) setInspectionTargetWork(shaped[0].projectName);

          // Update urgent items with real projects if available
          const delayed = shaped.filter((w) => w.riskScore >= 55).slice(0, 4);
          if (delayed.length > 0) {
            setUrgentItems([
              {
                id: delayed[0].id,
                work: delayed[0].projectName,
                agency: "Public Works Dept (PWD)",
                overdue: `+${Math.round(delayed[0].riskScore * 0.7)} days`,
                action: "Show Cause",
                badge: "Delayed",
                status: "pending",
                amountCr: Number((delayed[0].sanctionedAmount / 10000000).toFixed(2)),
              },
              ...(delayed[1]
                ? [
                    {
                      id: delayed[1].id,
                      work: delayed[1].projectName,
                      agency: "Rural Engineering Dept (RED)",
                      overdue: `+${Math.round(delayed[1].riskScore * 0.5)} days`,
                      action: "Release Fund" as const,
                      badge: "Milestone",
                      status: "pending" as const,
                      amountCr: Number((delayed[1].sanctionedAmount / 10000000).toFixed(2)),
                    },
                  ]
                : []),
              ...(delayed[2]
                ? [
                    {
                      id: delayed[2].id,
                      work: delayed[2].projectName,
                      agency: "UP Jal Nigam (Rural Water)",
                      overdue: `+${Math.round(delayed[2].riskScore * 0.6)} days`,
                      action: "Site Visit" as const,
                      badge: "Overdue",
                      status: "pending" as const,
                      amountCr: Number((delayed[2].sanctionedAmount / 10000000).toFixed(2)),
                    },
                  ]
                : []),
              ...(delayed[3]
                ? [
                    {
                      id: delayed[3].id,
                      work: delayed[3].projectName,
                      agency: "District Urban Dev Agency",
                      overdue: "+28 days",
                      action: "Tender Re-eval" as const,
                      badge: "Tender",
                      status: "pending" as const,
                      amountCr: Number((delayed[3].sanctionedAmount / 10000000).toFixed(2)),
                    },
                  ]
                : []),
            ]);
          }
        } else {
          // Fallback to static works
          import("@/data/works").then(({ works: staticWorks }) => {
            if (!isMounted) return;
            const filtered = staticWorks.filter(
              (w) => w.district?.toLowerCase() === selectedDistrict.toLowerCase() || w.state?.toLowerCase() === selectedState.toLowerCase()
            );
            const list = (filtered.length > 0 ? filtered : staticWorks.slice(0, 15)).map((w) => ({
              id: w.id,
              riskScore: w.riskScore,
              sanctionedAmount: (w.sanctionedAmount ?? 0) * 100000,
              projectName: w.description ?? "Unnamed Project",
              district: w.district ?? selectedDistrict,
              state: w.state ?? selectedState,
              riskBand: "HIGH",
              reasons: (w.reasons ?? []).map((r) => ({ label: r.label, weight: r.weight })),
            }));
            setDistrictWorks(list);
            if (list[0]) setInspectionTargetWork(list[0].projectName);
          });
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        import("@/data/works").then(({ works: staticWorks }) => {
          if (!isMounted) return;
          setDistrictWorks(
            staticWorks.slice(0, 20).map((w) => ({
              id: w.id,
              riskScore: w.riskScore,
              sanctionedAmount: (w.sanctionedAmount ?? 0) * 100000,
              projectName: w.description ?? "Unnamed Project",
              district: selectedDistrict,
              state: selectedState,
              riskBand: "HIGH",
              reasons: (w.reasons ?? []).map((r) => ({ label: r.label, weight: r.weight })),
            }))
          );
          setLoading(false);
        });
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, selectedState]);

  // Compute live district metrics from real data
  const totalWorksCount = districtWorks.length > 0 ? districtWorks.length : 184;
  const completedWorksCount = Math.max(1, Math.round(totalWorksCount * 0.5));
  const ongoingWorksCount = Math.max(1, Math.round(totalWorksCount * 0.37));
  const tenderedWorksCount = Math.max(0, totalWorksCount - completedWorksCount - ongoingWorksCount);
  const delayedWorksCount = districtWorks.filter((w) => w.riskScore >= 60).length || 14;
  const billQueueTotalCr = districtWorks.length > 0
    ? (districtWorks.reduce((acc, w) => acc + (w.sanctionedAmount || 0), 0) / 10000000).toFixed(1)
    : "14.2";

  // Show toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  // Handlers for action triggers
  const handleDispatchInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNo = `INSP/${selectedDistrict.slice(0, 3).toUpperCase()}/2026/${Math.floor(100 + Math.random() * 900)}`;
    setOverdueInspections((prev) => Math.max(0, prev - 1));
    setInspectionModalOpen(false);
    triggerToast(`✓ Field Inspection Order #${orderNo} issued to ${inspectionTeam}. Target: ${inspectionTargetWork || "Selected Site"}`);
  };

  const handleDispatchShowCause = (e: React.FormEvent) => {
    e.preventDefault();
    const scnNo = `DM/${selectedDistrict.slice(0, 3).toUpperCase()}/MPLADS/SCN-2026/${Math.floor(100 + Math.random() * 900)}`;
    if (targetItem) {
      setUrgentItems((prev) =>
        prev.map((item) =>
          item.id === targetItem.id
            ? { ...item, status: "notice_issued", action: "Show Cause" as const }
            : item
        )
      );
    } else {
      // General banner show-cause
      setUrgentItems((prev) =>
        prev.map((item, idx) => (idx === 0 ? { ...item, status: "notice_issued" } : item))
      );
    }
    setShowCauseModalOpen(false);
    triggerToast(`✓ Statutory Show-Cause Notice ${scnNo} dispatched. 7-day statutory clock active.`);
  };

  const handleAuthorizeFund = (e: React.FormEvent) => {
    e.preventDefault();
    const utr = `SBIN00${Math.floor(1000000 + Math.random() * 9000000)}`;
    if (targetItem) {
      setUrgentItems((prev) =>
        prev.map((item) =>
          item.id === targetItem.id ? { ...item, status: "fund_released" } : item
        )
      );
    }
    setReleaseFundModalOpen(false);
    triggerToast(`✓ Milestone Payment Tranche Disbursed (UTR: ${utr}). Advice transmitted to District Treasury.`);
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetItem) {
      setUrgentItems((prev) =>
        prev.map((item) =>
          item.id === targetItem.id ? { ...item, status: "visit_scheduled" } : item
        )
      );
    }
    setSiteVisitModalOpen(false);
    triggerToast(`✓ DM Inspection Visit Scheduled for ${targetItem?.work ?? "Site"} on Friday, 10:00 AM.`);
  };

  return (
    <div className="relative space-y-3.5 animate-dashboard-in text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border border-emerald-300 bg-emerald-900 text-white px-4 py-3 shadow-2xl animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-emerald-300 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================= DISTRICT OPERATIONAL HEADER ================= */}
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <h1
            className="truncate text-[19px] sm:text-[21px] font-bold leading-tight tracking-tight text-slate-900"
            title={`District Collectorate Command — ${selectedDistrict}, ${selectedState}`}
          >
            District Collectorate Command — {selectedDistrict}, {selectedState}
          </h1>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            Operational Imperative: <strong className="text-emerald-900">{delayedWorksCount} works past SLA threshold</strong> · {overdueInspections} field inspections overdue · Next District Coordination Committee in 4 days
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex h-[36px] items-center rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 whitespace-nowrap shadow-2xs">
            Ground Execution Mode
          </span>
          <button
            onClick={() => {
              setInspectionTargetWork(districtWorks[0]?.projectName || "RCC Drain & Road in Ward 14");
              setInspectionModalOpen(true);
            }}
            className="inline-flex h-[36px] items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer transition-all duration-150 active:scale-95 whitespace-nowrap"
          >
            <Camera size={14} />
            <span>Order Field Inspection</span>
          </button>
        </div>
      </header>

      {/* ================= DISTRICT TAILORED KPIS ================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Active Works</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{totalWorksCount} Works</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {ongoingWorksCount} ongoing · {completedWorksCount} completed · {tenderedWorksCount} tendered
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Ground Velocity</div>
          <div className="mt-1 text-lg font-bold text-emerald-700">
            {((completedWorksCount / Math.max(1, totalWorksCount)) * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp size={11} />
            <span>Avg 128 days vs 180 days SLA</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">SLA Breach Sirens</div>
          <div className="mt-1 text-lg font-bold text-red-600">{delayedWorksCount} Delayed</div>
          <div className="mt-0.5 text-[10px] text-red-600 font-semibold">
            &gt;30 days overdue milestone
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Field Inspections Overdue</div>
          <div className="mt-1 text-lg font-bold text-amber-600">{overdueInspections} Sites</div>
          <div className="mt-0.5 text-[10px] text-amber-700 font-medium">
            Geo-tag verification pending
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Contractor Bill Queue</div>
          <div className="mt-1 text-lg font-bold text-slate-900">₹ {billQueueTotalCr} Cr</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {ongoingWorksCount} running bills under audit
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
              Operational Siren: {delayedWorksCount} Works Past Milestone SLA (+42 Days Overdue)
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-red-700">
              Contractors for {districtWorks[0]?.projectName.slice(0, 45) || "Rohania Community Center"} and surrounding culverts have missed 2 consecutive project milestones. Executive Engineer notice required.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setTargetItem(urgentItems[0] || null);
            setShowCauseModalOpen(true);
          }}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-2xs hover:bg-red-50 cursor-pointer transition-all active:scale-95"
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
                  <span className="text-emerald-700">{totalWorksCount} Sanctioned (100%)</span>
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
                  <span className="text-blue-700">{completedWorksCount + ongoingWorksCount} Awarded ({Math.round(((completedWorksCount + ongoingWorksCount) / totalWorksCount) * 100)}%)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{tenderedWorksCount} works currently in technical tender evaluation</p>
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
                  <span className="text-amber-700">{ongoingWorksCount} Underway ({delayedWorksCount} Delayed)</span>
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
                  <span className="text-emerald-700">{completedWorksCount} Fully Completed</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{overdueInspections} works pending completion certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Implementing Agencies Accountability */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Executing Agencies</h2>
            <p className="text-[11px] text-slate-400">Departmental delivery scorecard for {selectedDistrict}</p>
          </div>

          <div className="mt-3 space-y-3">
            {[
              { agency: "Rural Engineering Dept (RED)", active: Math.round(totalWorksCount * 0.28), completed: Math.round(completedWorksCount * 0.35), delayed: 4, score: "92%" },
              { agency: "Public Works Dept (PWD - Provincial)", active: Math.round(totalWorksCount * 0.32), completed: Math.round(completedWorksCount * 0.3), delayed: 6, score: "84%" },
              { agency: "UP Jal Nigam (Rural Water)", active: Math.round(totalWorksCount * 0.22), completed: Math.round(completedWorksCount * 0.2), delayed: 3, score: "78%" },
              { agency: "District Urban Development Agency", active: Math.round(totalWorksCount * 0.18), completed: Math.round(completedWorksCount * 0.15), delayed: 1, score: "88%" },
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
              {urgentItems.filter((x) => x.status === "pending").length} Critical
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {urgentItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-2.5 transition-all ${
                  item.status !== "pending"
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200/70 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.work}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.agency} · Overdue {item.overdue} · ₹{item.amountCr ?? "0.5"} Cr
                    </p>
                  </div>
                  <span
                    className={`rounded text-[9px] font-bold px-1.5 py-0.5 ${
                      item.status === "notice_issued"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : item.status === "fund_released"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : item.status === "visit_scheduled"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {item.status === "notice_issued"
                      ? "Notice Active"
                      : item.status === "fund_released"
                      ? "Disbursed"
                      : item.status === "visit_scheduled"
                      ? "Visit Scheduled"
                      : item.badge}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {item.status === "notice_issued"
                      ? "7-day notice period running"
                      : item.status === "fund_released"
                      ? "Treasury advice confirmed"
                      : item.status === "visit_scheduled"
                      ? "Inspection team notified"
                      : "SLA breach notice ready"}
                  </span>

                  {item.status === "pending" ? (
                    <button
                      onClick={() => {
                        setTargetItem(item);
                        if (item.action === "Show Cause") {
                          setShowCauseModalOpen(true);
                        } else if (item.action === "Release Fund") {
                          setReleaseFundModalOpen(true);
                        } else if (item.action === "Site Visit") {
                          setSiteVisitModalOpen(true);
                        } else {
                          // Tender re-eval
                          triggerToast(`✓ Technical tender re-evaluation ordered for ${item.work}`);
                          setUrgentItems((prev) =>
                            prev.map((it) => (it.id === item.id ? { ...it, status: "tender_revaluated" } : it))
                          );
                        }
                      }}
                      className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 cursor-pointer transition-all active:scale-95 shadow-2xs"
                    >
                      {item.action}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <Check size={12} strokeWidth={2.5} />
                      <span>Action Logged</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MODAL 1: ORDER FIELD INSPECTION ================= */}
      {inspectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Order Field Quality Inspection</h3>
                  <p className="text-[11px] text-slate-500">District Magistrate Quality & Geotag Verification Mandate</p>
                </div>
              </div>
              <button
                onClick={() => setInspectionModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDispatchInspection} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target MPLADS Work / Site
                </label>
                <select
                  value={inspectionTargetWork}
                  onChange={(e) => setInspectionTargetWork(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  {districtWorks.length > 0 ? (
                    districtWorks.slice(0, 10).map((w) => (
                      <option key={w.id} value={w.projectName}>
                        {w.projectName} (Risk: {w.riskScore}%)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="RCC Drain & Road in Ward 14">RCC Drain & Road in Ward 14</option>
                      <option value="Solar High Mast Lights (10 Sites)">Solar High Mast Lights (10 Sites)</option>
                      <option value="Primary Health Sub-Center">Primary Health Sub-Center</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designated Inspection Team
                  </label>
                  <select
                    value={inspectionTeam}
                    onChange={(e) => setInspectionTeam(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="District Technical Vigilance Cell">District Technical Vigilance Cell</option>
                    <option value="Executive Engineer (PWD)">Executive Engineer (PWD)</option>
                    <option value="Third-Party Quality Auditor (IIT)">Third-Party Quality Auditor (IIT)</option>
                    <option value="Sub-Divisional Magistrate (SDM)">Sub-Divisional Magistrate (SDM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Inspection Date
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Audit Objective
                </label>
                <select
                  value={inspectionObjective}
                  onChange={(e) => setInspectionObjective(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Physical Milestone & Quality Verification">Physical Milestone & Quality Verification</option>
                  <option value="Geo-tagging Coordinates & Boundary Audit">Geo-tagging Coordinates & Boundary Audit</option>
                  <option value="Material Grade Testing & Core Sampling">Material Grade Testing & Core Sampling</option>
                  <option value="Measurement Book (MB) Reconciliation">Measurement Book (MB) Reconciliation</option>
                </select>
              </div>

              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Mandatory Inspection Protocols:</div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  <span>Capture 4 time-stamped geotagged photos from cardinal directions</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  <span>Verify biometric attendance of on-site labor force</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectionModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  <Send size={13} />
                  <span>Dispatch Inspection Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ISSUE SHOW-CAUSE NOTICE ================= */}
      {showCauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-100 text-red-700">
                  <FileWarning size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900">Issue Statutory Show-Cause Notice</h3>
                  <p className="text-[11px] text-red-600 font-medium">Under Section 4.2 of MPLADS Operational Guidelines 2023</p>
                </div>
              </div>
              <button
                onClick={() => setShowCauseModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDispatchShowCause} className="mt-4 space-y-3.5">
              <div className="rounded-lg bg-red-50/70 border border-red-200 p-3 text-xs">
                <div className="text-[10px] uppercase font-bold text-red-800 tracking-wider">
                  Office of District Magistrate & District Programme Coordinator
                </div>
                <div className="font-bold text-slate-900 mt-1">
                  Target Work: {targetItem?.work ?? districtWorks[0]?.projectName ?? "RCC Drain & Road in Ward 14"}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Agency: {targetItem?.agency ?? "Public Works Dept (Provincial)"} · Milestone Overdue: {targetItem?.overdue ?? "+48 days"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mandatory Reply Period
                  </label>
                  <select
                    value={noticeDeadline}
                    onChange={(e) => setNoticeDeadline(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none"
                  >
                    <option value="7 Days">7 Calendar Days (Standard)</option>
                    <option value="3 Days">3 Calendar Days (Urgent)</option>
                    <option value="14 Days">14 Calendar Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Statutory Ground
                  </label>
                  <select
                    value={noticeReason}
                    onChange={(e) => setNoticeReason(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Consecutive Milestone SLA Breaches (>42 Days Delay)">Consecutive Milestone Breaches</option>
                    <option value="Unexplained Halting of Physical Works">Unexplained Halting of Works</option>
                    <option value="Quality Non-Compliance in Material Testing">Quality Non-Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statutory Notice Draft (Official Record)
                </label>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700 leading-relaxed font-mono">
                  "Whereas the contractor has failed to achieve Stage-2 physical milestones despite issuance of two written reminders. You are hereby called upon to show cause within {noticeDeadline} why penalty clause under GCC Section 14 shall not be invoked and bank guarantee encashed."
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCauseModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-sm"
                >
                  <FileWarning size={13} />
                  <span>Dispatch Show-Cause Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: RELEASE MILESTONE FUND ================= */}
      {releaseFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FileCheck size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Authorize Milestone Fund Release</h3>
                  <p className="text-[11px] text-slate-500">Public Financial Management System (PFMS) Tranche</p>
                </div>
              </div>
              <button
                onClick={() => setReleaseFundModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAuthorizeFund} className="mt-4 space-y-3.5">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1.5">
                <div className="font-bold text-slate-900">{targetItem?.work}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Executing Agency:</span>
                  <span className="font-semibold text-slate-800">{targetItem?.agency}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Tranche Amount:</span>
                  <span className="font-bold text-emerald-700 text-sm">₹ {targetItem?.amountCr ?? "0.35"} Cr</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Inspection Status:</span>
                  <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[9px] font-bold">
                    Stage-2 Quality Certified
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2.5 text-[11px] text-blue-900">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 rounded text-emerald-600" />
                  <span>
                    I confirm that the physical verification certificate has been countersigned by the Executive Engineer and matches GPS coordinates.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReleaseFundModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  <Check size={13} />
                  <span>Authorize & Disburse</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: SCHEDULE DM SITE VISIT ================= */}
      {siteVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-blue-200 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Schedule DM Site Visit</h3>
                  <p className="text-[11px] text-slate-500">Direct Collectorate Ground Inspection</p>
                </div>
              </div>
              <button
                onClick={() => setSiteVisitModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="mt-4 space-y-3.5">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs">
                <div className="font-bold text-slate-900">{targetItem?.work}</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Agency: {targetItem?.agency} · Status: {targetItem?.overdue}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspection Time Slot
                </label>
                <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none">
                  <option>Friday Morning · 10:00 AM - 11:30 AM</option>
                  <option>Saturday Afternoon · 02:30 PM - 04:00 PM</option>
                  <option>Monday Morning · 09:30 AM - 11:00 AM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSiteVisitModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  <Check size={13} />
                  <span>Confirm Site Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DistrictView;
