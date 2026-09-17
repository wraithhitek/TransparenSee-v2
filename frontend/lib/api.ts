/**
 * API client for the real FastAPI backend (backend.api.main)
 * Base URL defaults to localhost:8000 for local dev.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const KEY  = process.env.NEXT_PUBLIC_API_KEY  ?? "dev-viewer-key";

const headers: Record<string, string> = {
  "x-api-key": KEY,
  "content-type": "application/json",
};

async function get<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(BASE + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API PATCH ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiKpis {
  run_id: string;
  mps: number;
  allocated: number;
  expenditure: number;
  utilisation_pct: number;
  works_recommended: number;
  works_completed: number;
  payment_lines: number;
  high_or_critical: number;
  critical: number;
  mean_risk: number;
  data_quality_pct: number;
  open_alerts: number;
}

export interface ApiWork {
  work_uid: string;
  work_stage: string;
  work_description: string;
  category: string;
  mp_name: string;
  constituency: string;
  state: string;
  ida_district: string;
  amount: number;
  event_date: string;
  composite_risk: number;
  risk_band: string;
  cost_risk: number;
  duplicate_risk: number;
  delay_risk: number;
  vendor_risk: number;
  utilisation_risk: number;
  data_quality_risk: number;
  explanation?: string;
}

export interface ApiWorkDetail {
  work: ApiWork & { explanation: string };
  comparable_works: ApiWork[];
  duplicate_candidates: Array<{
    left_uid: string; right_uid: string;
    similarity: number; match_type: string;
    left_description: string; right_description: string;
    left_amount: number; right_amount: number;
    explanation: string;
  }>;
  lineage: Array<{ stage: string; action: string; ts: string }>;
  disclaimer: string;
}

export interface ApiState {
  state: string;
  works: number;
  high_risk: number;
  mean_risk: number;
  work_value: number;
}

export interface ApiDistrict {
  state: string;
  ida_district: string;
  works_recommended: number;
  works_completed: number;
  expenditure: number;
  vendors: number;
  completion_rate_pct: number;
  risk_score: number;
  high_risk_works: number;
}

export interface ApiMp {
  mp_key: string;
  mp_name: string;
  constituency: string;
  state: string;
  house: string;
  allocated_amount: number;
  derived_expenditure: number;
  utilisation_pct: number;
  completion_rate_pct: number;
  works_total: number;
  high_risk_works: number;
  composite_risk: number;
  risk_band: string;
}

export interface ApiVendor {
  vendor_uid: string;
  vendor: string;
  state: string;
  ida_district: string;
  payment_lines: number;
  total_amount: number;
  district_share: number;
  repeat_line_share: number;
  composite_risk: number;
  risk_band: string;
  explanation: string;
}

export interface ApiDuplicatePair {
  left_uid: string;
  right_uid: string;
  similarity: number;
  match_type: string;
  same_mp: boolean;
  state: string;
  left_description: string;
  right_description: string;
  left_amount: number;
  right_amount: number;
  amount_gap_pct: number;
  explanation: string;
}

export interface ApiAlert {
  alert_id: string;
  entity_type: string;
  entity_id: string;
  entity_label: string;
  state: string;
  district: string;
  risk_score: number;
  risk_band: string;
  title: string;
  detected: string;
  recommended_action: string;
  status: string;
  created_at: string;
}

export interface ApiAlertHistory {
  changed_at: string;
  from_status: string;
  to_status: string;
  actor: string;
  note: string;
}

export interface ApiLineage {
  stage: string;
  action: string;
  detail?: string;
  ts: string;
}

export interface ApiDataQuality {
  metrics: Array<{ dataset: string; metric: string; value: number }>;
  issues: Array<{ dataset: string; rule: string; severity: string; detail: string; record_count: number }>;
}

export interface ApiMeta {
  platform: string;
  run_id: string;
  official_source: string;
  versions: { risk_engine: string; features: string; model: string };
  risk_bands: Record<string, unknown>;
  risk_weights: Record<string, number>;
  datasets: Array<{ dataset: string; record_count: number; retrieved_at: string; status: string }>;
  role: string;
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export const fetchHealth      = ()                        => get<{ status: string; run_id: string; time: string }>("/health");
export const fetchMeta        = ()                        => get<ApiMeta>("/api/meta");
export const fetchKpis        = ()                        => get<ApiKpis>("/api/kpis");
export const fetchStates      = ()                        => get<ApiState[]>("/api/states");
export const fetchDistricts   = (state?: string, limit = 500) => get<ApiDistrict[]>("/api/districts", { state, limit });
export const fetchWorks       = (p?: { limit?: number; offset?: number; state?: string; district?: string; band?: string; min_risk?: number; stage?: string }) =>
  get<ApiWork[]>("/api/works", { limit: 200, ...p });
export const fetchWorkDetail  = (uid: string)             => get<ApiWorkDetail>(`/api/works/${encodeURIComponent(uid)}`);
export const fetchMps         = (p?: { state?: string; band?: string; limit?: number }) => get<ApiMp[]>("/api/mps", { limit: 200, ...p });
export const fetchMpDetail    = (mpKey: string)           => get<{ mp: ApiMp; top_works: ApiWork[]; vendors: Array<{vendor: string; lines: number; total: number}> }>(`/api/mps/${encodeURIComponent(mpKey)}`);
export const fetchVendors     = (p?: { limit?: number; min_risk?: number }) => get<ApiVendor[]>("/api/vendors", { limit: 200, ...p });
export const fetchDuplicates  = (limit = 200)             => get<ApiDuplicatePair[]>("/api/duplicates", { limit });
export const fetchAlerts      = (p?: { status?: string; limit?: number }) => get<ApiAlert[]>("/api/alerts", { limit: 200, ...p });
export const fetchAlertHistory = (alertId: string)        => get<ApiAlertHistory[]>(`/api/alerts/${encodeURIComponent(alertId)}/history`);
export const patchAlert       = (alertId: string, status: string, note?: string) =>
  patch<{ alert_id: string; new_status: string }>(`/api/alerts/${encodeURIComponent(alertId)}`, { status, note });
export const fetchDataQuality = ()                        => get<ApiDataQuality>("/api/data-quality");
export const fetchLineage     = (runId?: string)          => get<ApiLineage[]>("/api/lineage", runId ? { run_id: runId } : undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function bandColor(band: string): string {
  switch (band?.toUpperCase()) {
    case "CRITICAL": return "text-red-700 bg-red-100";
    case "HIGH":     return "text-orange-700 bg-orange-100";
    case "MODERATE": return "text-amber-700 bg-amber-100";
    default:         return "text-green-700 bg-green-100";
  }
}

export function bandBorder(band: string): string {
  switch (band?.toUpperCase()) {
    case "CRITICAL": return "border-red-400";
    case "HIGH":     return "border-orange-400";
    case "MODERATE": return "border-amber-400";
    default:         return "border-green-400";
  }
}

export function formatCr(rupees: number): string {
  return `₹${(rupees / 1e7).toFixed(1)} Cr`;
}

export function formatLakh(rupees: number): string {
  return `₹${(rupees / 1e5).toFixed(1)}L`;
}

/** WorkShape used by the overview dashboard */
export interface WorkShape {
  id: string;
  riskScore: number;
  sanctionedAmount: number;
  projectName: string;
  district: string;
  state: string;
  riskBand: string;
  reasons: Array<{ label: string; weight: number }>;
}

export function toWorkShape(w: ApiWork): WorkShape {
  const reasons: Array<{ label: string; weight: number }> = [];
  if (w.cost_risk       > 20) reasons.push({ label: "Cost anomaly",         weight: Math.round(w.cost_risk) });
  if (w.duplicate_risk  > 20) reasons.push({ label: "Duplicate scope",      weight: Math.round(w.duplicate_risk) });
  if (w.delay_risk      > 20) reasons.push({ label: "Timeline anomaly",     weight: Math.round(w.delay_risk) });
  if (w.vendor_risk     > 20) reasons.push({ label: "Vendor concentration", weight: Math.round(w.vendor_risk) });
  if (w.utilisation_risk > 20) reasons.push({ label: "Low utilisation",     weight: Math.round(w.utilisation_risk) });
  return {
    id: w.work_uid,
    riskScore: Math.round(w.composite_risk),
    sanctionedAmount: w.amount,
    projectName: w.work_description ?? "—",
    district: w.ida_district ?? "—",
    state: w.state ?? "—",
    riskBand: w.risk_band ?? "LOW",
    reasons,
  };
}

// ─── District coordinate lookup (for map) ────────────────────────────────────
// Approximate centroids for Indian districts/states used as fallback when
// exact district coordinates aren't in the API response.
const STATE_COORDS: Record<string, [number, number]> = {
  "Andhra Pradesh": [15.9, 79.7], "Arunachal Pradesh": [28.2, 94.7],
  "Assam": [26.2, 92.9], "Bihar": [25.6, 85.1], "Chhattisgarh": [21.3, 81.9],
  "Goa": [15.3, 74.1], "Gujarat": [22.3, 71.2], "Haryana": [29.1, 76.1],
  "Himachal Pradesh": [31.1, 77.2], "Jharkhand": [23.6, 85.3],
  "Karnataka": [15.3, 75.7], "Kerala": [10.9, 76.3], "Madhya Pradesh": [22.9, 78.7],
  "Maharashtra": [19.7, 75.7], "Manipur": [24.7, 93.9], "Meghalaya": [25.5, 91.4],
  "Mizoram": [23.2, 92.9], "Nagaland": [26.2, 94.1], "Odisha": [20.9, 84.4],
  "Punjab": [31.1, 75.3], "Rajasthan": [27.0, 74.2], "Sikkim": [27.5, 88.5],
  "Tamil Nadu": [10.8, 78.7], "Telangana": [18.1, 79.0], "Tripura": [23.9, 91.6],
  "Uttar Pradesh": [27.1, 80.0], "Uttarakhand": [30.1, 79.2],
  "West Bengal": [23.2, 87.9], "Delhi": [28.7, 77.1],
  "Andaman And Nicobar Islands": [11.7, 92.7], "Chandigarh": [30.7, 76.8],
  "Jammu And Kashmir": [33.7, 76.9], "Ladakh": [34.2, 77.6],
  "Lakshadweep": [10.6, 72.6], "Puducherry": [11.9, 79.8],
  "Dadra And Nagar Haveli And Daman And Diu": [20.3, 73.0],
};

function jitter(n: number): number { return n + (Math.random() - 0.5) * 1.5; }

export function getWorkCoords(work: ApiWork): [number, number] {
  const base = STATE_COORDS[work.state] ?? [22.5, 82.0];
  return [jitter(base[0]), jitter(base[1])];
}

// ─── Convert ApiWork → Work (frontend type used by existing components) ───────
import type { Work, WorkCategory, WorkStatus } from "@/types";

export function apiWorkToWork(w: ApiWork): Work {
  const [lat, lng] = getWorkCoords(w);
  const score = Math.round(w.composite_risk);
  return {
    id:               w.work_uid,
    agencyName:       w.mp_name ?? "—",
    state:            w.state ?? "—",
    district:         w.ida_district ?? "—",
    category:         mapCategory(w),
    status:           mapStatus(w.risk_band),
    riskScore:        score,
    flaggedOn:        w.event_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    sanctionedAmount: +(w.amount / 1e5).toFixed(2),
    reportedExpenditure: +(w.amount / 1e5).toFixed(2),
    expectedDuration: 120,
    actualDuration:   score > 60 ? 180 : 120,
    latitude:         lat,
    longitude:        lng,
    description:      w.work_description ?? "—",
    reasons:          buildReasons(w),
    recommendedActions: buildActions(score),
  };
}

function mapCategory(w: ApiWork): WorkCategory {
  const risks = [
    { key: "cost_risk",      cat: "financial"    as WorkCategory },
    { key: "duplicate_risk", cat: "duplicate"    as WorkCategory },
    { key: "delay_risk",     cat: "timeline"     as WorkCategory },
    { key: "vendor_risk",    cat: "geographic"   as WorkCategory },
  ];
  const vals = risks.map(r => ({ cat: r.cat, val: (w as Record<string,number>)[r.key] ?? 0 }));
  const max = vals.reduce((a, b) => a.val >= b.val ? a : b);
  return max.val > 20 ? max.cat : "multi-factor";
}

function mapStatus(band: string): WorkStatus {
  switch (band?.toUpperCase()) {
    case "CRITICAL": return "escalated";
    case "HIGH":     return "under_review";
    case "MODERATE": return "pending_review";
    default:         return "cleared";
  }
}

function buildReasons(w: ApiWork) {
  const out = [];
  if (w.cost_risk > 20)        out.push({ code: "COST",      label: "Cost anomaly",         weight: Math.round(w.cost_risk),        explanation: `Cost risk score ${w.cost_risk.toFixed(1)}/100 — statistical deviation from comparable works in same state/category.` });
  if (w.duplicate_risk > 20)   out.push({ code: "DUPLICATE", label: "Duplicate scope",      weight: Math.round(w.duplicate_risk),   explanation: `Duplicate risk ${w.duplicate_risk.toFixed(1)}/100 — high TF-IDF similarity with other works in same constituency.` });
  if (w.delay_risk > 20)       out.push({ code: "DELAY",     label: "Timeline anomaly",     weight: Math.round(w.delay_risk),       explanation: `Delay risk ${w.delay_risk.toFixed(1)}/100 — expected timeline significantly exceeded for this work category.` });
  if (w.vendor_risk > 20)      out.push({ code: "VENDOR",    label: "Vendor concentration", weight: Math.round(w.vendor_risk),      explanation: `Vendor risk ${w.vendor_risk.toFixed(1)}/100 — high district-share or repeat-line concentration.` });
  if (w.utilisation_risk > 20) out.push({ code: "UTIL",      label: "Low utilisation",      weight: Math.round(w.utilisation_risk), explanation: `Utilisation risk ${w.utilisation_risk.toFixed(1)}/100 — fund utilisation significantly below constituency average.` });
  if (w.data_quality_risk > 20) out.push({ code: "DQ",       label: "Data quality",         weight: Math.round(w.data_quality_risk), explanation: `Data quality risk ${w.data_quality_risk.toFixed(1)}/100 — missing or inconsistent fields detected.` });
  return out;
}

function buildActions(score: number) {
  const acts = [{ id: "a1", text: "Verify financial records and payment vouchers with the implementing agency." }];
  if (score > 60) acts.push({ id: "a2", text: "Schedule physical site inspection before further disbursement." });
  if (score > 74) acts.push({ id: "a3", text: "Cross-check scope with geographically proximate works for duplication." });
  if (score > 80) acts.push({ id: "a4", text: "Escalate to district collector for immediate review." });
  return acts;
}
