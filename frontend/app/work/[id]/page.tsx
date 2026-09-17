"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWorkDetail, apiWorkToWork, formatLakh, bandColor, type ApiWorkDetail } from "@/lib/api";
import { Work } from "@/types";
import WorkHeader from "@/components/work/WorkHeader";
import WhyFlaggedSection from "@/components/work/WhyFlaggedSection";
import ActionChecklist from "@/components/work/ActionChecklist";
import Link from "next/link";
import { ArrowLeft, GitBranch, Copy, AlertTriangle } from "lucide-react";

export default function WorkDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);

  const [detail, setDetail]   = useState<ApiWorkDetail | null>(null);
  const [work, setWork]       = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchWorkDetail(id)
      .then((d) => {
        setDetail(d);
        setWork(apiWorkToWork(d.work));
        setLoading(false);
      })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading investigation detail…</p>
      </div>
    </div>
  );

  if (error || !work || !detail) return (
    <div className="space-y-4 max-w-5xl">
      <Link href="/queue" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> Back to Investigation Queue
      </Link>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
        <strong>Work not found:</strong> {id}<br />
        <span className="text-xs text-red-500 mt-1 block">{error}</span>
      </div>
    </div>
  );

  const amountLakh = +(detail.work.amount / 1e5).toFixed(2);

  return (
    <div className="space-y-4 max-w-5xl">
      <WorkHeader work={work} />

      {/* Key Facts — Financial + Risk Components */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Key Facts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial */}
          <div className="lg:col-span-1">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">Financial</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sanctioned Amount</span>
                <span className="font-semibold text-slate-800">{formatLakh(detail.work.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">MP / Constituency</span>
                <span className="font-medium text-slate-700 text-right max-w-[160px] truncate">{detail.work.mp_name}, {detail.work.constituency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Stage</span>
                <span className="font-medium text-slate-700">{detail.work.work_stage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">State / District</span>
                <span className="font-medium text-slate-700">{detail.work.state}, {detail.work.ida_district}</span>
              </div>
            </div>
          </div>

          {/* Risk Components */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">AI Risk Components</p>
            <div className="space-y-2">
              {[
                { label: "Cost Risk",        val: detail.work.cost_risk },
                { label: "Duplicate Risk",   val: detail.work.duplicate_risk },
                { label: "Delay Risk",       val: detail.work.delay_risk },
                { label: "Vendor Risk",      val: detail.work.vendor_risk },
                { label: "Utilisation Risk", val: detail.work.utilisation_risk },
                { label: "Data Quality",     val: detail.work.data_quality_risk },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${val > 74 ? "bg-red-500" : val > 49 ? "bg-orange-400" : val > 24 ? "bg-amber-400" : "bg-green-400"}`}
                      style={{ width: `${Math.min(val, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums w-8 text-right text-slate-700">{val.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explanation */}
        {detail.work.explanation && (
          <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs font-semibold text-slate-600 mb-1">AI Explanation</p>
            <p className="text-sm text-slate-700 leading-relaxed">{detail.work.explanation}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WhyFlaggedSection reasons={work.reasons} />
        <ActionChecklist actions={work.recommendedActions} />
      </div>

      {/* Duplicate Candidates */}
      {detail.duplicate_candidates.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Copy size={15} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-slate-700">Duplicate Candidates ({detail.duplicate_candidates.length})</h2>
          </div>
          <div className="space-y-3">
            {detail.duplicate_candidates.slice(0, 5).map((d, i) => (
              <div key={i} className="p-3 border border-orange-100 bg-orange-50 rounded-lg text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex gap-2">
                    <Link href={`/work/${d.left_uid === id ? d.right_uid : d.left_uid}`} className="font-mono font-semibold text-orange-700 hover:underline">
                      {d.left_uid === id ? d.right_uid : d.left_uid}
                    </Link>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${d.match_type === "exact" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                      {d.match_type}
                    </span>
                  </div>
                  <span className="font-bold text-orange-800">{(d.similarity * 100).toFixed(0)}% similar</span>
                </div>
                <p className="text-slate-600 leading-snug">{d.left_uid === id ? d.right_description : d.left_description}</p>
                {d.explanation && <p className="text-slate-500 mt-1 italic">{d.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparable Works */}
      {detail.comparable_works.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Comparable Works (same state/category)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200">
                <tr className="text-slate-500">
                  <th className="text-left pb-2 font-medium">Work ID</th>
                  <th className="text-left pb-2 font-medium">Description</th>
                  <th className="text-right pb-2 font-medium">Amount</th>
                  <th className="text-right pb-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.comparable_works.slice(0, 8).map((cw) => (
                  <tr key={cw.work_uid} className="hover:bg-slate-50">
                    <td className="py-2 font-mono">
                      <Link href={`/work/${cw.work_uid}`} className="text-sky-600 hover:underline">{cw.work_uid}</Link>
                    </td>
                    <td className="py-2 max-w-[260px] truncate text-slate-600">{cw.work_description}</td>
                    <td className="py-2 text-right tabular-nums">{formatLakh(cw.amount)}</td>
                    <td className="py-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${bandColor(cw.risk_band)}`}>
                        {Math.round(cw.composite_risk)} {cw.risk_band}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lineage */}
      {detail.lineage.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={15} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">Pipeline Lineage</h2>
          </div>
          <ol className="space-y-2">
            {detail.lineage.map((l, i) => (
              <li key={i} className="flex items-start gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <span className="font-semibold text-slate-700">{l.stage}</span>
                  <span className="text-slate-400 mx-1">·</span>
                  <span className="text-slate-600">{l.action}</span>
                  <span className="text-slate-400 ml-2">{new Date(l.ts).toLocaleTimeString("en-IN")}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="text-xs text-slate-400 italic text-center pb-4">
        {detail.disclaimer}
      </p>
    </div>
  );
}
