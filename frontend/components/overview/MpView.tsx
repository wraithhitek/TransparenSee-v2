"use client";

import { useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  MessageSquareWarning,
  PieChart,
  PlusCircle,
  Share2,
  Smile,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Vote,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";

export function MpView() {
  const { selectedMp, selectedState, selectedDistrict } = useRole();

  const [activeTab, setActiveTab] = useState<"works" | "grievances">("works");

  return (
    <div className="space-y-3.5 animate-dashboard-in text-slate-800">
      {/* ================= MP FIRST-PERSON ACCOUNTABILITY HEADER ================= */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight tracking-tight text-slate-900">
              Constituency Dashboard — {selectedMp}
            </h1>
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
              18th Lok Sabha
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            First-person accountability: <strong className="text-amber-900">₹19.4 Cr deployed across 42 works</strong> in your constituency · Serving an estimated 4.2 Lakh citizen beneficiaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700">
            <PlusCircle size={13} />
            <span>Recommend New Work</span>
          </button>
        </div>
      </header>

      {/* ================= MP TAILORED KPIS ================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Your Recommended Works</div>
          <div className="mt-1 text-lg font-bold text-slate-900">42 Works</div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            36 sanctioned · 28 completed · 6 in progress
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">MPLADS Entitlement</div>
          <div className="mt-1 text-lg font-bold text-amber-800">₹ 19.4 / 25 Cr</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp size={11} />
            <span>77.6% 5-year quota utilised</span>
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
          <div className="mt-1 text-lg font-bold text-blue-700">28 Projects</div>
          <div className="mt-0.5 text-[10px] text-blue-600 font-medium">
            100% geo-verified on ground
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Citizen Inquiries Pending</div>
          <div className="mt-1 text-lg font-bold text-amber-600">5 Inquiries</div>
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
              Constituency Nudge: 5 Citizen Queries on Drinking Water Scheme (Rohania Block)
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-amber-800">
              Citizens have requested an update on the Solar RO plant sanctioned in March. Work order was issued 45 days ago by DM Varanasi; ground progress is currently 35%.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-50 cursor-pointer"
        >
          <span>Send Inquiry to Collector</span>
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
            <Link href="/works" className="text-xs font-semibold text-amber-700 hover:text-amber-900">
              View All 42
            </Link>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {[
              {
                title: "Solar High-Mast Lighting across 12 Ghats",
                cost: "₹ 1.2 Cr",
                status: "Completed & Inaugurated",
                statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
                date: "Completed Aug 2026",
              },
              {
                title: "Piped Drinking Water Scheme for Kashi Ward",
                cost: "₹ 2.4 Cr",
                status: "Under Ground Execution (62%)",
                statusColor: "text-blue-700 bg-blue-50 border-blue-200",
                date: "Target Dec 2026",
              },
              {
                title: "Upgradation of Primary Health Center, Shivpur",
                cost: "₹ 1.8 Cr",
                status: "Tender Awarded",
                statusColor: "text-purple-700 bg-purple-50 border-purple-200",
                date: "DM Sanctioned",
              },
              {
                title: "Smart Anganwadi Learning Center, Rohania",
                cost: "₹ 0.8 Cr",
                status: "Pending DM Sanction (18 days)",
                statusColor: "text-amber-700 bg-amber-50 border-amber-200",
                date: "Submitted to Collector",
              },
            ].map((p, idx) => (
              <div key={idx} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{p.title}</h3>
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
              5 Open
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {[
              {
                from: "Residents Welfare Assn, Block C",
                topic: "Solar streetlight battery replacement needed",
                time: "Yesterday",
                status: "Actionable",
              },
              {
                from: "Gram Pradhan, Koirajpur",
                topic: "Request for culvert extension near primary school",
                time: "3 days ago",
                status: "Proposal Inquiry",
              },
              {
                from: "Mahila Self-Help Group",
                topic: "Community hall furniture and solar fan request",
                time: "5 days ago",
                status: "Review Pending",
              },
            ].map((g, i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 hover:bg-slate-50 transition-all">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">{g.from}</span>
                  <span className="text-slate-400">{g.time}</span>
                </div>
                <p className="mt-1 text-xs text-slate-800 font-medium">{g.topic}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200">
                    {g.status}
                  </span>
                  <button className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer">
                    <span>Forward to DM</span>
                    <ArrowRight size={11} />
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

export default MpView;
