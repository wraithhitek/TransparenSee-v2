"use client";

import { useState, useEffect } from "react";
import { fetchDuplicates, formatLakh, type ApiDuplicatePair } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Copy, AlertTriangle } from "lucide-react";

export default function FraudDetectionPage() {
  const [pairs, setPairs]     = useState<ApiDuplicatePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"all" | "exact" | "near">("all");
  const router = useRouter();

  useEffect(() => {
    fetchDuplicates(500)
      .then((p) => { setPairs(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const exact    = pairs.filter((p) => p.match_type === "exact" || p.similarity >= 0.995);
  const near     = pairs.filter((p) => p.match_type !== "exact" && p.similarity < 0.995);
  const sameMP   = pairs.filter((p) => p.same_mp);
  const crossMP  = pairs.filter((p) => !p.same_mp);

  const visible = filter === "exact" ? exact : filter === "near" ? near : pairs;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fraud Detection — Duplicate Works</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Near-duplicate work pairs detected by NLP (TF-IDF cosine similarity ≥ 85%)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Duplicate Pairs", val: pairs.length.toLocaleString("en-IN"), color: "text-slate-800" },
          { label: "Exact Text Matches", val: exact.length.toLocaleString("en-IN"), color: "text-red-700" },
          { label: "Near Duplicates", val: near.length.toLocaleString("en-IN"), color: "text-orange-700" },
          { label: "Cross-MP Duplication", val: crossMP.length.toLocaleString("en-IN"), color: "text-purple-700" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? "…" : val}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>How duplicate detection works:</strong> TF-IDF vectorisation on work descriptions with char n-gram (3–5) features, blocked by state to limit comparison space. Pairs with cosine similarity ≥ 0.85 are flagged. Exact matches (≥ 0.995) indicate potential copy-paste fraud. Same-MP duplicates suggest double-billing; cross-MP duplicates may indicate data errors or coordinated fraud.
      </div>

      <div className="flex gap-2">
        {(["all", "exact", "near"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${filter === f ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"}`}>
            {f === "all" ? `All (${pairs.length})` : f === "exact" ? `Exact (${exact.length})` : `Near (${near.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading duplicate pairs…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.slice(0, 200).map((pair, i) => (
            <div key={i} className={`bg-white rounded-xl border shadow-sm p-5 ${pair.match_type === "exact" || pair.similarity >= 0.995 ? "border-red-200" : "border-orange-200"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Copy size={14} className={pair.similarity >= 0.995 ? "text-red-500" : "text-orange-500"} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${pair.similarity >= 0.995 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                    {(pair.similarity * 100).toFixed(1)}% similar · {pair.match_type}
                  </span>
                  {pair.same_mp && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold">Same MP</span>}
                  <span className="text-xs text-slate-500">{pair.state}</span>
                </div>
                {pair.amount_gap_pct !== null && pair.amount_gap_pct !== undefined && (
                  <span className="text-xs text-slate-500">Amount gap: {pair.amount_gap_pct?.toFixed(1)}%</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <button onClick={() => router.push(`/work/${pair.left_uid}`)} className="font-mono text-xs font-semibold text-sky-600 hover:underline block mb-1">{pair.left_uid}</button>
                  <p className="text-xs text-slate-700 leading-snug">{pair.left_description}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatLakh(pair.left_amount)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <button onClick={() => router.push(`/work/${pair.right_uid}`)} className="font-mono text-xs font-semibold text-sky-600 hover:underline block mb-1">{pair.right_uid}</button>
                  <p className="text-xs text-slate-700 leading-snug">{pair.right_description}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatLakh(pair.right_amount)}</p>
                </div>
              </div>
              {pair.explanation && <p className="text-xs text-slate-500 mt-2 italic">{pair.explanation}</p>}
            </div>
          ))}
          <p className="text-xs text-slate-400 text-center">Showing {Math.min(200, visible.length)} of {visible.length} pairs</p>
        </div>
      )}
    </div>
  );
}
