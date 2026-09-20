"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  MessageSquareWarning,
  PieChart,
  PlusCircle,
  Search,
  Send,
  Share2,
  Smile,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Vote,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { fetchWorks, toWorkShape, type WorkShape } from "@/lib/api";

interface RecommendedProject {
  id: string;
  title: string;
  cost: string;
  costNumCr: number;
  status: string;
  statusColor: string;
  date: string;
  sector: string;
}

interface GrievanceItem {
  id: string;
  from: string;
  topic: string;
  time: string;
  status: "Actionable" | "Proposal Inquiry" | "Review Pending" | "Forwarded to DM";
}

export function MpView() {
  const { selectedMp, selectedState, selectedDistrict } = useRole();

  // Real data state
  const [works, setWorks] = useState<WorkShape[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Nudge banner state
  const [inquiryDispatched, setInquiryDispatched] = useState(false);

  // New recommendation form state
  const [newTitle, setNewTitle] = useState("");
  const [newSector, setNewSector] = useState("Clean Water & Solar RO Plants");
  const [newBlock, setNewBlock] = useState("Rohania Block");
  const [newCostCr, setNewCostCr] = useState("0.85");
  const [newPriority, setNewPriority] = useState("Priority 1 (Urgent Public Need)");
  const [newNote, setNewNote] = useState("");

  // Inquiry form state
  const [inquiryUrgency, setInquiryUrgency] = useState("Urgent (72 Hours)");
  const [inquirySubject, setInquirySubject] = useState("Delay in Solar RO Drinking Water Scheme (Rohania Block)");

  // Citizen grievances state
  const [grievances, setGrievances] = useState<GrievanceItem[]>([
    {
      id: "grv-1",
      from: "Residents Welfare Assn, Block C",
      topic: "Solar streetlight battery replacement needed",
      time: "Yesterday",
      status: "Actionable",
    },
    {
      id: "grv-2",
      from: "Gram Pradhan, Koirajpur",
      topic: "Request for culvert extension near primary school",
      time: "3 days ago",
      status: "Proposal Inquiry",
    },
    {
      id: "grv-3",
      from: "Mahila Self-Help Group",
      topic: "Community hall furniture and solar fan request",
      time: "5 days ago",
      status: "Review Pending",
    },
  ]);

  // Projects list state
  const [recommendedProjects, setRecommendedProjects] = useState<RecommendedProject[]>([
    {
      id: "rec-1",
      title: "Solar High-Mast Lighting across 12 Ghats",
      cost: "₹ 1.2 Cr",
      costNumCr: 1.2,
      status: "Completed & Handed Over",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      date: "Completed Aug 2026",
      sector: "Rural Roads & Solar Streetlights",
    },
    {
      id: "rec-2",
      title: "Piped Drinking Water Scheme for Kashi Ward",
      cost: "₹ 2.4 Cr",
      costNumCr: 2.4,
      status: "Under Ground Execution (62%)",
      statusColor: "text-blue-700 bg-blue-50 border-blue-200",
      date: "Target Dec 2026",
      sector: "Clean Water & Solar RO Plants",
    },
    {
      id: "rec-3",
      title: "Upgradation of Primary Health Center, Shivpur",
      cost: "₹ 1.8 Cr",
      costNumCr: 1.8,
      status: "Tender Awarded",
      statusColor: "text-purple-700 bg-purple-50 border-purple-200",
      date: "DM Sanctioned",
      sector: "Health & Mobile Dispensaries",
    },
    {
      id: "rec-4",
      title: "Smart Anganwadi Learning Center, Rohania",
      cost: "₹ 0.8 Cr",
      costNumCr: 0.8,
      status: "Pending DM Sanction (18 days)",
      statusColor: "text-amber-700 bg-amber-50 border-amber-200",
      date: "Submitted to Collector",
      sector: "Anganwadi & School Infrastructure",
    },
  ]);

  // Search filter for view all modal
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSector, setFilterSector] = useState("All");

  // Fetch real data when MP / State changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchWorks({ state: selectedState, district: selectedDistrict, limit: 200 })
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          const shaped = data.map(toWorkShape);
          setWorks(shaped);

          // Populate recommended projects with real project titles if available
          const realProjects: RecommendedProject[] = shaped.slice(0, 8).map((w, idx) => {
            const costCr = Number((w.sanctionedAmount / 10000000).toFixed(2));
            const isCompleted = idx % 3 === 0;
            const isUnderway = idx % 3 === 1;
            return {
              id: w.id,
              title: w.projectName,
              cost: `₹ ${costCr > 0 ? costCr : "0.75"} Cr`,
              costNumCr: costCr > 0 ? costCr : 0.75,
              status: isCompleted
                ? "Completed & Handed Over"
                : isUnderway
                ? "Under Ground Execution"
                : "Tender Awarded",
              statusColor: isCompleted
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : isUnderway
                ? "text-blue-700 bg-blue-50 border-blue-200"
                : "text-purple-700 bg-purple-50 border-purple-200",
              date: isCompleted ? "Completed 2026" : "Target Nov 2026",
              sector:
                idx % 4 === 0
                  ? "Clean Water & Solar RO Plants"
                  : idx % 4 === 1
                  ? "Rural Roads & Solar Streetlights"
                  : idx % 4 === 2
                  ? "Anganwadi & School Infrastructure"
                  : "Health & Mobile Dispensaries",
            };
          });
          setRecommendedProjects(realProjects);
        } else {
          // Fallback static works
          import("@/data/works").then(({ works: staticWorks }) => {
            if (!isMounted) return;
            const mapped = staticWorks.slice(0, 15).map((w) => ({
              id: w.id,
              riskScore: w.riskScore,
              sanctionedAmount: (w.sanctionedAmount ?? 0) * 100000,
              projectName: w.description ?? "Unnamed Work",
              district: selectedDistrict,
              state: selectedState,
              riskBand: "LOW",
              reasons: [],
            }));
            setWorks(mapped);
          });
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        import("@/data/works").then(({ works: staticWorks }) => {
          if (!isMounted) return;
          setWorks(
            staticWorks.slice(0, 15).map((w) => ({
              id: w.id,
              riskScore: w.riskScore,
              sanctionedAmount: (w.sanctionedAmount ?? 0) * 100000,
              projectName: w.description ?? "Unnamed Work",
              district: selectedDistrict,
              state: selectedState,
              riskBand: "LOW",
              reasons: [],
            }))
          );
          setLoading(false);
        });
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMp, selectedState, selectedDistrict]);

  // Derived metrics
  const totalRecommendedCount = Math.max(recommendedProjects.length, works.length > 0 ? works.length : 42);
  const totalCostCr = recommendedProjects.reduce((acc, p) => acc + p.costNumCr, 0);
  const entitlementUsedCr = Math.min(25, Number((totalCostCr > 0 ? totalCostCr : 19.4).toFixed(1)));
  const entitlementPct = ((entitlementUsedCr / 25) * 100).toFixed(1);
  const completedCount = recommendedProjects.filter((p) => p.status.includes("Completed")).length || 28;

  // Toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 4500);
  };

  // Submit Recommend Work
  const handleRecommendWork = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(newCostCr) || 0.5;
    const trackingId = `MPL/REC/2026/${Math.floor(100 + Math.random() * 900)}`;

    const newProject: RecommendedProject = {
      id: `rec-${Date.now()}`,
      title: newTitle || `Solar RO Drinking Water Facility in ${newBlock}`,
      cost: `₹ ${cost.toFixed(2)} Cr`,
      costNumCr: cost,
      status: "Submitted to Collector (Pending Sanction)",
      statusColor: "text-amber-800 bg-amber-50 border-amber-200",
      date: "Submitted Today",
      sector: newSector,
    };

    setRecommendedProjects([newProject, ...recommendedProjects]);
    setRecommendModalOpen(false);
    setNewTitle("");
    triggerToast(`✓ Work Recommendation "${newProject.title}" transmitted to District Collectorate. Tracking ID: ${trackingId}`);
  };

  // Submit Inquiry to Collector
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const inqRef = `MP/LOKSABHA/${selectedMp.split(" ")[0].toUpperCase()}/2026/${Math.floor(10 + Math.random() * 90)}`;
    setInquiryDispatched(true);
    setInquiryModalOpen(false);
    triggerToast(`✓ Parliamentary Inquiry Note (${inqRef}) transmitted to District Magistrate. Expected reply within 72h.`);
  };

  // Forward Grievance
  const handleForwardGrievance = (id: string, topic: string) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "Forwarded to DM" } : g))
    );
    triggerToast(`✓ Citizen query "${topic}" forwarded to Collectorate with Priority Nudge.`);
  };

  return (
    <div className="relative space-y-3.5 animate-dashboard-in text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border border-amber-300 bg-slate-900 text-white px-4 py-3 shadow-2xl animate-fade-in">
          <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================= MP FIRST-PERSON ACCOUNTABILITY HEADER ================= */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight tracking-tight text-slate-900">
              Constituency Dashboard — {selectedMp} ({selectedDistrict}, {selectedState})
            </h1>
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
              18th Lok Sabha
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            First-person accountability: <strong className="text-amber-900">₹{entitlementUsedCr} Cr deployed across {totalRecommendedCount} works</strong> in your constituency ({selectedDistrict}) · Serving an estimated 4.2 Lakh citizen beneficiaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRecommendModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-amber-400 bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle size={13} />
            <span>Recommend New Work</span>
          </button>
        </div>
      </header>

      {/* ================= MP TAILORED KPIS ================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Your Recommended Works</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{totalRecommendedCount} Works</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {totalRecommendedCount - 6} sanctioned · {completedCount} completed · 6 in progress
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">MPLADS Entitlement</div>
          <div className="mt-1 text-lg font-bold text-amber-800">₹ {entitlementUsedCr} / 25 Cr</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp size={11} />
            <span>{entitlementPct}% 5-year quota utilised</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Citizen Impact</div>
          <div className="mt-1 text-lg font-bold text-emerald-700">~4.2 Lakhs</div>
          <div className="mt-0.5 text-[10px] text-emerald-600 font-semibold">
            Estimated direct beneficiaries
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Completed & Handed Over</div>
          <div className="mt-1 text-lg font-bold text-blue-700">{completedCount} Projects</div>
          <div className="mt-0.5 text-[10px] text-blue-600 font-medium">
            100% geo-verified on ground
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Citizen Inquiries Pending</div>
          <div className="mt-1 text-lg font-bold text-amber-600">
            {grievances.filter((g) => g.status !== "Forwarded to DM").length} Inquiries
          </div>
          <div className="mt-0.5 text-[10px] text-amber-700 font-medium">
            3 feedback tickets logged this week
          </div>
        </div>
      </section>

      {/* ================= GRIEVANCE-DRIVEN NUDGE ALERT ================= */}
      <section className="flex flex-col gap-2.5 rounded-lg border border-amber-300 bg-amber-50/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
            <MessageSquareWarning className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-amber-900">
              {inquiryDispatched
                ? "✓ Official Inquiry Dispatched to DM · Status note requested within 72 hours"
                : "Constituency Nudge: 5 Citizen Queries on Drinking Water Scheme (Rohania Block)"}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-amber-800">
              {inquiryDispatched
                ? "Collectorate has acknowledged receipt. Executive Engineer, Rural Water has been instructed to file a compliance report."
                : "Citizens have requested an update on the Solar RO plant sanctioned in March. Work order was issued 45 days ago by DM; ground progress is currently 35%."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInquiryModalOpen(true)}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-50 cursor-pointer transition-all active:scale-95"
        >
          <span>{inquiryDispatched ? "Send Follow-up Note" : "Send Inquiry to Collector"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* ================= MAIN MP GRID ================= */}
      <section className="grid min-w-0 items-start gap-3 lg:grid-cols-[1.15fr_1.1fr_1fr]">
        {/* COLUMN 1: Community Impact & Sectoral Outlay */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Your Community Impact Index</h2>
            <p className="text-[11px] text-slate-400">Where your constituency funds have made a difference</p>
          </div>

          <div className="mt-4 space-y-3.5">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Clean Water & Solar RO Plants</span>
                <span className="font-bold text-slate-900">14 works · ₹6.2 Cr</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-cyan-500" style={{ width: "32%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">18,500 households provided safe drinking water</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Rural Roads & Solar Streetlights</span>
                <span className="font-bold text-slate-900">12 works · ₹5.4 Cr</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: "28%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">42 km village roads connecting 12 hamlets</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Anganwadi & School Infrastructure</span>
                <span className="font-bold text-slate-900">9 works · ₹4.6 Cr</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-purple-600" style={{ width: "24%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">22 government schools upgraded with digital labs</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Health & Mobile Dispensaries</span>
                <span className="font-bold text-slate-900">7 works · ₹3.2 Cr</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: "16%" }} />
              </div>
              <div className="mt-1 text-[10px] text-slate-400">3 emergency ambulances deployed to remote blocks</div>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-amber-50/70 p-3 border border-amber-100 text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-700" />
              <span>Trust Architecture: MP Recommends & Represents</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
              As MP, your proposals originate from direct grassroots citizen interaction. District Administration is bound by MPLADS guidelines to sanction eligible works within 45 days.
            </p>
          </div>
        </div>

        {/* COLUMN 2: Your Recommended Works Lifecycle Feed */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Recommended Projects</h2>
              <p className="text-[11px] text-slate-400">Status of proposals submitted to Collectorate</p>
            </div>
            <button
              onClick={() => setViewAllModalOpen(true)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer underline"
            >
              View All {totalRecommendedCount}
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {recommendedProjects.slice(0, 4).map((p) => (
              <div key={p.id} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold border ${p.statusColor}`}>
                        {p.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{p.date}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 shrink-0">{p.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: Citizen Grievance & Constituency Feed */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Citizen Inquiries & Voice</h2>
              <p className="text-[11px] text-slate-400">Direct feedback from your electors</p>
            </div>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {grievances.filter((g) => g.status !== "Forwarded to DM").length} Open
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {grievances.map((g) => (
              <div
                key={g.id}
                className={`rounded-lg border p-2.5 transition-all ${
                  g.status === "Forwarded to DM"
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-100 bg-slate-50/70 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">{g.from}</span>
                  <span className="text-slate-400">{g.time}</span>
                </div>
                <p className="mt-1 text-xs text-slate-800 font-medium">{g.topic}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold border ${
                      g.status === "Forwarded to DM"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {g.status}
                  </span>

                  {g.status !== "Forwarded to DM" ? (
                    <button
                      onClick={() => handleForwardGrievance(g.id, g.topic)}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <span>Forward to DM</span>
                      <ArrowRight size={11} />
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <Check size={12} strokeWidth={2.5} />
                      <span>Escalated</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MODAL 1: RECOMMEND NEW WORK ================= */}
      {recommendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-amber-200 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-800">
                  <PlusCircle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recommend New MPLADS Work</h3>
                  <p className="text-[11px] text-slate-500">Formal Proposal Submission to District Magistrate</p>
                </div>
              </div>
              <button
                onClick={() => setRecommendModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecommendWork} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Title & Scope of Work
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Construction of Solar RO Drinking Water Plant & Storage Tank"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Development Sector
                  </label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Clean Water & Solar RO Plants">Drinking Water & Sanitation</option>
                    <option value="Rural Roads & Solar Streetlights">Rural Roads & Solar Lighting</option>
                    <option value="Anganwadi & School Infrastructure">Education & School Labs</option>
                    <option value="Health & Mobile Dispensaries">Healthcare & Dispensaries</option>
                    <option value="Community Infrastructure">Community Center & Library</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Panchayat / Block / Ward
                  </label>
                  <input
                    type="text"
                    required
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    placeholder="e.g. Rohania Block, Ward 12"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Cost (₹ in Crores)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="5.0"
                    required
                    value={newCostCr}
                    onChange={(e) => setNewCostCr(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Constituency Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Priority 1 (Urgent Public Need)">Priority 1 (Urgent Public Need)</option>
                    <option value="Priority 2 (Standard Work)">Priority 2 (Standard Work)</option>
                  </select>
                </div>
              </div>

              {/* Live Quota Bar */}
              <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                  <span>MPLADS Entitlement Quota Check:</span>
                  <span>
                    ₹ {(entitlementUsedCr + (parseFloat(newCostCr) || 0)).toFixed(1)} / 25.0 Cr
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-amber-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((entitlementUsedCr + (parseFloat(newCostCr) || 0)) / 25) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-amber-800 mt-1">
                  Remaining available balance: ₹ {(Math.max(0, 25 - entitlementUsedCr - (parseFloat(newCostCr) || 0))).toFixed(1)} Cr
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Electors Justification Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Recommended pursuant to mass representation received during public darbar on 14th Sept."
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecommendModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer shadow-sm"
                >
                  <Send size={13} />
                  <span>Transmit Recommendation to DM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SEND INQUIRY TO COLLECTOR ================= */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-amber-300 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-800">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transmit Parliamentary Inquiry Note</h3>
                  <p className="text-[11px] text-slate-500">Official Communication to District Magistrate</p>
                </div>
              </div>
              <button
                onClick={() => setInquiryModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="mt-4 space-y-3.5">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Recipient:</span>
                  <span className="font-bold text-slate-900">District Magistrate & Collector, {selectedDistrict}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Sender:</span>
                  <span className="font-bold text-slate-900">{selectedMp} (MP Lok Sabha)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={inquiryUrgency}
                  onChange={(e) => setInquiryUrgency(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Urgent (72 Hours)">Urgent — Request action-taken report within 72 hours</option>
                  <option value="Standard (7 Days)">Standard — Reply within 7 days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Parliamentary Letter Text
                </label>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700 leading-relaxed font-mono">
                  "Dear District Magistrate, Repeated representations have been received from local residents regarding the stalled implementation of the sanctioned Solar RO plant. Kindly submit an urgent status report indicating reasons for delay and revised milestone completion date."
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer shadow-sm"
                >
                  <Send size={13} />
                  <span>Dispatch Inquiry to DM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: VIEW ALL PROJECTS ================= */}
      {viewAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  All Recommended Projects — {selectedMp}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total {recommendedProjects.length} proposals under active lifecycle
                </p>
              </div>
              <button
                onClick={() => setViewAllModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filters */}
            <div className="mt-3 flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none"
                />
              </div>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
              >
                <option value="All">All Sectors</option>
                <option value="Clean Water & Solar RO Plants">Clean Water</option>
                <option value="Rural Roads & Solar Streetlights">Roads & Lighting</option>
                <option value="Anganwadi & School Infrastructure">Education</option>
                <option value="Health & Mobile Dispensaries">Healthcare</option>
              </select>
            </div>

            {/* List */}
            <div className="mt-3 flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {recommendedProjects
                .filter(
                  (p) =>
                    (filterSector === "All" || p.sector === filterSector) &&
                    p.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${p.statusColor}`}>
                          {p.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.sector}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 block">{p.cost}</span>
                      <span className="text-[10px] text-slate-400">{p.date}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-2 flex justify-end shrink-0">
              <button
                onClick={() => setViewAllModalOpen(false)}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MpView;
