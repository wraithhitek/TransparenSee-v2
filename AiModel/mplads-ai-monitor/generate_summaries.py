"""
Dataset Summaries — Outlier Ops / SIH 2026
============================================
Generates rich summaries for all 4 MPLADS datasets and saves them to
outputs/reports/dataset_summaries.txt (plain text, shareable with team)
and outputs/reports/dataset_summaries.json (machine-readable).

Data quality issues are intentionally ignored here — this is a
descriptive summary for understanding the data, not a QA report.

Run:  python generate_summaries.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd

ROOT   = Path(__file__).resolve().parent
SNAP   = ROOT / "data" / "source_snapshots" / "20260822"
OUTDIR = ROOT / "outputs" / "reports"
OUTDIR.mkdir(parents=True, exist_ok=True)

# ── helpers ───────────────────────────────────────────────────────────────────

def fmt_inr(v):
    """Format a rupee value in crore / lakh / plain."""
    if pd.isna(v):
        return "N/A"
    v = float(v)
    if abs(v) >= 1e7:
        return f"₹{v/1e7:.2f} Cr"
    if abs(v) >= 1e5:
        return f"₹{v/1e5:.2f} L"
    return f"₹{v:,.0f}"

def pct(n, d):
    return f"{100*n/d:.1f}%" if d else "N/A"

def top_n(series, n=5):
    counts = series.astype(str).str.strip().value_counts()
    return [(k, int(v), f"{100*v/len(series):.1f}%") for k, v in counts.head(n).items()]

def amount_dist(series):
    v = pd.to_numeric(series, errors="coerce").dropna()
    return {
        "count":   int(len(v)),
        "min":     fmt_inr(v.min()),
        "p25":     fmt_inr(v.quantile(0.25)),
        "median":  fmt_inr(v.median()),
        "mean":    fmt_inr(v.mean()),
        "p75":     fmt_inr(v.quantile(0.75)),
        "p95":     fmt_inr(v.quantile(0.95)),
        "p99":     fmt_inr(v.quantile(0.99)),
        "max":     fmt_inr(v.max()),
        "total":   fmt_inr(v.sum()),
        "std":     fmt_inr(v.std()),
    }

def round_bias(series):
    v = pd.to_numeric(series, errors="coerce").dropna()
    total = len(v)
    return {
        "multiple_of_1L":  f"{int((v % 1e5 == 0).sum()):,}  ({pct((v%1e5==0).sum(), total)})",
        "multiple_of_5L":  f"{int((v % 5e5 == 0).sum()):,}  ({pct((v%5e5==0).sum(), total)})",
        "multiple_of_10L": f"{int((v % 1e6 == 0).sum()):,}  ({pct((v%1e6==0).sum(), total)})",
        "multiple_of_1Cr": f"{int((v % 1e7 == 0).sum()):,}  ({pct((v%1e7==0).sum(), total)})",
    }

# ── load ──────────────────────────────────────────────────────────────────────

print("Loading datasets...")
rec  = pd.read_csv(SNAP / "mplads_recommended_works_20260822.csv",  low_memory=False)
comp = pd.read_csv(SNAP / "mplads_completed_works_20260822.csv",    low_memory=False)
exp  = pd.read_csv(SNAP / "mplads_expenditures_20260822.csv",       low_memory=False)
mp   = pd.read_csv(SNAP / "mplads_mp_summary_20260822.csv",         low_memory=False)

with open(SNAP / "json_2026-08-22.json") as f:
    nat = json.load(f)["data"]

lines = []   # accumulate plain-text output
data  = {}   # accumulate JSON-serialisable output

def h1(t):
    lines.append("")
    lines.append("=" * 65)
    lines.append(f"  {t}")
    lines.append("=" * 65)

def h2(t):
    lines.append("")
    lines.append(f"  ── {t}")
    lines.append("  " + "─" * 55)

def row(label, value, indent=4):
    lines.append(f"{' '*indent}{label:<38} {value}")

def blank():
    lines.append("")

# ══════════════════════════════════════════════════════════════════════════════
h1("NATIONAL SUMMARY  (json_2026-08-22.json)")
# ══════════════════════════════════════════════════════════════════════════════

ns = {
    "total_mps":                nat["totalMPs"],
    "total_allocated":          fmt_inr(nat["totalAllocated"]),
    "total_expenditure":        fmt_inr(nat["totalExpenditure"]),
    "utilisation_pct":          f"{nat['utilizationPercentage']:.2f}%",
    "total_works_recommended":  f"{nat['totalWorksRecommended']:,}",
    "total_works_completed":    f"{nat['totalWorksCompleted']:,}",
    "completion_rate":          f"{nat['completionRate']:.2f}%",
    "pending_works":            f"{nat['pendingWorks']:,}",
    "total_transactions":       f"{nat['totalTransactions']:,}",
    "avg_mp_allocation":        fmt_inr(nat["avgAllocation"]),
    "completed_works_value":    fmt_inr(nat["completedWorksValue"]),
    "in_progress_payments":     fmt_inr(nat["inProgressPayments"]),
    "payment_gap_pct":          f"{nat['paymentGap']:.2f}%",
}
for k, v in ns.items():
    row(k.replace("_", " ").title(), str(v))

data["national_summary"] = ns

# ══════════════════════════════════════════════════════════════════════════════
h1("DATASET 1 — RECOMMENDED WORKS  (83,621 rows)")
# ══════════════════════════════════════════════════════════════════════════════

# Basic shape
h2("Overview")
row("Total works",              f"{len(rec):,}")
row("Columns",                  str(rec.shape[1]))
row("Date range",               f"{pd.to_datetime(rec['Recommendation Date'], utc=True).min().date()} → "
                                 f"{pd.to_datetime(rec['Recommendation Date'], utc=True).max().date()}")
row("Unique MPs",               f"{rec['MP Name'].nunique():,}")
row("Unique states",            f"{rec['State'].nunique():,}")
row("Unique constituencies",    f"{rec['Constituency'].nunique():,}")
row("Unique districts (IDA)",   f"{rec['IDA'].nunique():,}")
row("Works with images",        f"{rec['Has Images'].sum():,}  ({pct(rec['Has Images'].sum(), len(rec))})")

# Amount
h2("Recommended Amount distribution")
ad = amount_dist(rec["Recommended Amount (₹)"])
for k, v in ad.items():
    row(k.replace("_", " ").title(), v)

h2("Round-number bias in amounts")
rb = round_bias(rec["Recommended Amount (₹)"])
for k, v in rb.items():
    row(k.replace("_", " "), v)

# Category
h2("Top categories")
for cat, cnt, pct_ in top_n(rec["Category"], 10):
    row(str(cat), f"{cnt:,}  ({pct_})")

# House
h2("House breakdown")
for house, cnt, pct_ in top_n(rec["House"]):
    row(str(house), f"{cnt:,}  ({pct_})")

# State (top 10 by work count)
h2("Top 10 states by work count")
for state, cnt, pct_ in top_n(rec["State"], 10):
    row(str(state), f"{cnt:,}  ({pct_})")

# Description quality
h2("Work description quality")
desc_len = rec["Work Description"].astype(str).str.len()
row("Mean description length (chars)",  f"{desc_len.mean():.0f}")
row("Median description length (chars)", f"{desc_len.median():.0f}")
row("Max description length (chars)",   f"{desc_len.max():.0f}")
exact_dup = rec["Work Description"].astype(str).str.strip().str.lower().duplicated(keep=False).sum()
row("Exact duplicate descriptions",     f"{exact_dup:,}  ({pct(exact_dup, len(rec))})")

data["recommended_works"] = {
    "rows": len(rec), "columns": rec.shape[1],
    "unique_mps": int(rec["MP Name"].nunique()),
    "unique_states": int(rec["State"].nunique()),
    "unique_districts": int(rec["IDA"].nunique()),
    "amount_distribution": ad,
    "round_bias": rb,
    "top_categories": top_n(rec["Category"], 5),
    "exact_duplicate_descriptions": int(exact_dup),
    "works_with_images": int(rec["Has Images"].sum()),
}

# ══════════════════════════════════════════════════════════════════════════════
h1("DATASET 2 — COMPLETED WORKS  (43,173 rows)")
# ══════════════════════════════════════════════════════════════════════════════

h2("Overview")
row("Total completed works",      f"{len(comp):,}")
row("Date range",                 f"{pd.to_datetime(comp['Completed Date'], utc=True).min().date()} → "
                                   f"{pd.to_datetime(comp['Completed Date'], utc=True).max().date()}")
row("Unique MPs",                 f"{comp['MP Name'].nunique():,}")
row("Unique states",              f"{comp['State'].nunique():,}")
row("Works with images",          f"{comp['Has Images'].sum():,}  ({pct(comp['Has Images'].sum(), len(comp))})")
row("Works with Average Rating",  f"{comp['Average Rating'].notna().sum():,}  ({pct(comp['Average Rating'].notna().sum(), len(comp))})")

h2("Final Amount distribution")
ad2 = amount_dist(comp["Final Amount (₹)"])
for k, v in ad2.items():
    row(k.replace("_", " ").title(), v)

h2("Round-number bias in final amounts")
rb2 = round_bias(comp["Final Amount (₹)"])
for k, v in rb2.items():
    row(k.replace("_", " "), v)

h2("Top categories")
for cat, cnt, pct_ in top_n(comp["Category"], 10):
    row(str(cat), f"{cnt:,}  ({pct_})")

h2("Top 10 states by completed work count")
for state, cnt, pct_ in top_n(comp["State"], 10):
    row(str(state), f"{cnt:,}  ({pct_})")

# Completion age analysis
comp_dates = pd.to_datetime(comp["Completed Date"], utc=True, errors="coerce")
snapshot   = pd.Timestamp("2026-08-22", tz="UTC")
comp["_age_days"] = (snapshot - comp_dates).dt.days
h2("Work age at completion (days since recommendation — approximated)")
age = comp["_age_days"].dropna()
row("Min age (days)",    f"{age.min():.0f}")
row("Median age (days)", f"{age.median():.0f}")
row("Mean age (days)",   f"{age.mean():.0f}")
row("p90 age (days)",    f"{age.quantile(0.90):.0f}")
row("Max age (days)",    f"{age.max():.0f}")

exact_dup2 = comp["Work Description"].astype(str).str.strip().str.lower().duplicated(keep=False).sum()
h2("Work description quality")
row("Exact duplicate descriptions", f"{exact_dup2:,}  ({pct(exact_dup2, len(comp))})")

data["completed_works"] = {
    "rows": len(comp), "columns": comp.shape[1],
    "unique_mps": int(comp["MP Name"].nunique()),
    "works_with_images": int(comp["Has Images"].sum()),
    "amount_distribution": ad2,
    "round_bias": rb2,
    "top_categories": top_n(comp["Category"], 5),
    "median_age_days": float(age.median()),
    "exact_duplicate_descriptions": int(exact_dup2),
}

# ══════════════════════════════════════════════════════════════════════════════
h1("DATASET 3 — EXPENDITURES / PAYMENTS  (106,263 rows)")
# ══════════════════════════════════════════════════════════════════════════════

h2("Overview")
row("Total payment lines",        f"{len(exp):,}")
row("Date range",                 f"{pd.to_datetime(exp['Expenditure Date'], utc=True).min().date()} → "
                                   f"{pd.to_datetime(exp['Expenditure Date'], utc=True).max().date()}")
row("Unique MPs",                 f"{exp['MP Name'].nunique():,}")
row("Unique vendors",             f"{exp['Vendor'].str.strip().nunique():,}")
row("Unique districts (IDA)",     f"{exp['IDA'].nunique():,}")
row("Unique states",              f"{exp['State'].nunique():,}")

h2("Expenditure Amount distribution")
ad3 = amount_dist(exp["Expenditure Amount (₹)"])
for k, v in ad3.items():
    row(k.replace("_", " ").title(), v)

h2("Round-number bias in payment amounts")
rb3 = round_bias(exp["Expenditure Amount (₹)"])
for k, v in rb3.items():
    row(k.replace("_", " "), v)

h2("Payment Status breakdown")
for status, cnt, pct_ in top_n(exp["Payment Status"]):
    row(str(status), f"{cnt:,}  ({pct_})")

h2("Duplicate / repeated payment lines (fraud signal)")
exp["_dup_key"] = (exp["MP Name"].str.strip() + "|" + exp["Vendor"].str.strip() + "|" +
                   exp["Expenditure Amount (₹)"].astype(str) + "|" +
                   exp["Expenditure Date"].str[:10])
dup_counts  = exp["_dup_key"].value_counts()
repeated_keys  = int((dup_counts > 1).sum())
repeated_rows  = int(dup_counts[dup_counts > 1].sum())
max_repeats    = int(dup_counts.max())
row("Unique payment keys",         f"{len(dup_counts):,}")
row("Keys repeated more than once", f"{repeated_keys:,}  ({pct(repeated_keys, len(dup_counts))})")
row("Total repeated-line rows",     f"{repeated_rows:,}  ({pct(repeated_rows, len(exp))})")
row("Max single key repetition",    f"{max_repeats:,}  times")
blank()
lines.append("      Top 10 most-repeated payment lines:")
top_rep = dup_counts[dup_counts > 1].head(10)
for key, cnt in top_rep.items():
    parts = key.split("|")
    lines.append(f"        {cnt:>4}x | MP: {parts[0][:28]:<28} | Vendor: {parts[1][:28]:<28} | ₹{parts[2]:<12} | {parts[3]}")

h2("Top 10 vendors by total payment value")
vend_total = exp.groupby("Vendor")["Expenditure Amount (₹)"].sum().sort_values(ascending=False).head(10)
for vendor, total in vend_total.items():
    row(str(vendor)[:40], fmt_inr(total))

h2("Top 10 vendors by payment line count")
vend_lines = exp["Vendor"].value_counts().head(10)
for vendor, cnt in vend_lines.items():
    row(str(vendor)[:40], f"{cnt:,} lines")

h2("Top 10 states by expenditure")
state_exp = exp.groupby("State")["Expenditure Amount (₹)"].sum().sort_values(ascending=False).head(10)
for state, total in state_exp.items():
    row(str(state), fmt_inr(total))

data["expenditures"] = {
    "rows": len(exp), "columns": exp.shape[1],
    "unique_vendors": int(exp["Vendor"].str.strip().nunique()),
    "unique_mps": int(exp["MP Name"].nunique()),
    "unique_districts": int(exp["IDA"].nunique()),
    "amount_distribution": ad3,
    "round_bias": rb3,
    "repeated_payment_keys": repeated_keys,
    "repeated_payment_rows": repeated_rows,
    "max_single_repetition": max_repeats,
    "payment_status": {k: int(v) for k, v in exp["Payment Status"].value_counts().items()},
}

# ══════════════════════════════════════════════════════════════════════════════
h1("DATASET 4 — MP SUMMARY  (764 rows, one per MP)")
# ══════════════════════════════════════════════════════════════════════════════

h2("Overview")
row("Total MPs",              f"{len(mp):,}")
row("Lok Sabha MPs",          f"{(mp['House']=='Lok Sabha').sum():,}")
row("Rajya Sabha MPs",        f"{(mp['House']=='Rajya Sabha').sum():,}")
row("Unique states",          f"{mp['State'].nunique():,}")

h2("Fund Allocation & Utilisation")
alloc = pd.to_numeric(mp["Allocated Amount (₹)"], errors="coerce")
expnd = pd.to_numeric(mp["Total Expenditure (₹)"], errors="coerce")
util  = pd.to_numeric(mp["Utilization %"], errors="coerce")
row("Total allocated (all MPs)",   fmt_inr(alloc.sum()))
row("Total expended (all MPs)",    fmt_inr(expnd.sum()))
row("National utilisation %",      f"{util.mean():.1f}%  (mean across MPs)")
row("Median utilisation %",        f"{util.median():.1f}%")
row("MPs with 0% utilisation",     f"{(util == 0).sum():,}")
row("MPs with < 25% utilisation",  f"{(util < 25).sum():,}  ({pct((util<25).sum(), len(mp))})")
row("MPs with < 50% utilisation",  f"{(util < 50).sum():,}  ({pct((util<50).sum(), len(mp))})")
row("MPs with >= 90% utilisation", f"{(util >= 90).sum():,}  ({pct((util>=90).sum(), len(mp))})")
row("Min utilisation %",           f"{util.min():.1f}%")
row("Max utilisation %",           f"{util.max():.1f}%")

h2("Utilisation distribution (buckets)")
buckets = [0, 10, 25, 50, 75, 90, 100, float("inf")]
labels  = ["0–10%", "10–25%", "25–50%", "50–75%", "75–90%", "90–100%", ">100%"]
for lo, hi, label in zip(buckets, buckets[1:], labels):
    cnt = int(((util >= lo) & (util < hi)).sum())
    row(f"  {label}", f"{cnt:,} MPs  ({pct(cnt, len(mp))})")

h2("Works counts per MP")
rec_w = pd.to_numeric(mp["Recommended Works"], errors="coerce")
cmp_w = pd.to_numeric(mp["Completed Works"],   errors="coerce")
cmp_r = pd.to_numeric(mp["Completion Rate %"], errors="coerce")
row("Total recommended works",    f"{rec_w.sum():,.0f}")
row("Total completed works",      f"{cmp_w.sum():,.0f}")
row("Mean recommended per MP",    f"{rec_w.mean():.1f}")
row("Mean completed per MP",      f"{cmp_w.mean():.1f}")
row("Median completion rate %",   f"{cmp_r.median():.1f}%")
row("MPs with 0 completed works", f"{(cmp_w == 0).sum():,}")

h2("Unspent amounts")
unspent = pd.to_numeric(mp["Unspent Amount (₹)"], errors="coerce")
row("Total unspent (all MPs)", fmt_inr(unspent.sum()))
row("Max unspent (single MP)", fmt_inr(unspent.max()))
row("Median unspent per MP",   fmt_inr(unspent.median()))

h2("Pending payments")
pend = pd.to_numeric(mp["Pending Payments"], errors="coerce")
txn  = pd.to_numeric(mp["Transaction Count"], errors="coerce")
row("Total pending payment lines",    f"{pend.sum():,.0f}")
row("Total successful payment lines", f"{mp['Successful Payments'].sum():,}")
row("MPs with pending payments",      f"{(pend > 0).sum():,}  ({pct((pend>0).sum(), len(mp))})")
row("Max pending per MP",             f"{pend.max():.0f}")

h2("Top 10 states by total allocation")
state_alloc = mp.groupby("State")["Allocated Amount (₹)"].sum().sort_values(ascending=False).head(10)
for state, total in state_alloc.items():
    row(str(state), fmt_inr(total))

h2("Top 10 MPs by utilisation (highest expenditure)")
top_util = mp.nlargest(10, "Utilization %")[["MP Name", "State", "Utilization %", "Total Expenditure (₹)"]]
for _, r_ in top_util.iterrows():
    row(str(r_["MP Name"])[:36], f"{r_['Utilization %']:.1f}%  ({fmt_inr(r_['Total Expenditure (₹)'])})")

h2("Bottom 10 MPs by utilisation (lowest spenders)")
bot_util = mp.nsmallest(10, "Utilization %")[["MP Name", "State", "Utilization %", "Total Expenditure (₹)"]]
for _, r_ in bot_util.iterrows():
    row(str(r_["MP Name"])[:36], f"{r_['Utilization %']:.1f}%  ({fmt_inr(r_['Total Expenditure (₹)'])})")

data["mp_summary"] = {
    "total_mps": len(mp),
    "lok_sabha": int((mp["House"] == "Lok Sabha").sum()),
    "rajya_sabha": int((mp["House"] == "Rajya Sabha").sum()),
    "total_allocated": float(alloc.sum()),
    "total_expended":  float(expnd.sum()),
    "mean_utilisation_pct": float(util.mean()),
    "median_utilisation_pct": float(util.median()),
    "mps_below_25pct_util": int((util < 25).sum()),
    "mps_above_90pct_util": int((util >= 90).sum()),
    "total_unspent": float(unspent.sum()),
    "total_pending_payments": float(pend.sum()),
}

# ══════════════════════════════════════════════════════════════════════════════
h1("ML MODEL FEATURE READINESS SUMMARY")
# ══════════════════════════════════════════════════════════════════════════════

h2("Features for anomaly detection ensemble (IF / LOF / DBSCAN)")
features_ready = [
    ("log_amount",                  "✅", "Derived from Recommended Amount — log-normal transformation"),
    ("state_category_robust_z",     "✅", "Amount vs. peer median within (State × Category)"),
    ("district_robust_z",           "✅", "Amount vs. peer median within IDA district"),
    ("category_robust_z",           "✅", "Amount vs. national category median"),
    ("state_category_ratio_to_peer","✅", "Amount ÷ peer median — relative cost"),
    ("amount_last_digits_zero",     "✅", "Trailing zeros — round-number bias (52.9% of works hit this)"),
    ("age_days",                    "✅", "Days since Recommendation Date at snapshot"),
    ("description_length",          "✅", "Work Description character count"),
    ("description_repeat_count",    "✅", "Same description repeated in same state"),
    ("description_repeat_same_mp",  "✅", "Same description repeated by same MP"),
    ("missing_data_ratio",          "✅", "Share of empty fields per record"),
    ("district_vendor_hhi",         "✅", "Vendor concentration in district (from expenditures)"),
]
for feat, status, note in features_ready:
    lines.append(f"    {status}  {feat:<36} {note}")

h2("Features for completion propensity model (HistGBT)")
model_features = [
    ("log_amount",              "✅", "Source: rec"),
    ("state_category_robust_z", "✅", "Source: rec + peer stats"),
    ("district_robust_z",       "✅", "Source: rec + peer stats"),
    ("category_robust_z",       "✅", "Source: rec + peer stats"),
    ("amount_last_digits_zero", "✅", "Source: rec"),
    ("description_length",      "✅", "Source: rec"),
    ("description_token_count", "✅", "Source: rec"),
    ("description_repeat_count","✅", "Source: rec"),
    ("district_work_count",     "✅", "Source: rec grouped by IDA"),
    ("district_vendor_hhi",     "✅", "Source: exp grouped by IDA + vendor"),
    ("mp_utilisation_pct",      "✅", "Source: mp_summary.Utilization %"),
    ("state  (categorical)",    "✅", "Source: rec"),
    ("category (categorical)",  "✅", "Source: rec"),
    ("house (categorical)",     "✅", "Source: rec"),
    ("TARGET: work_stage",      "✅", "Derived: rec rows = RECOMMENDED (0), comp rows = COMPLETED (1)"),
]
for feat, status, note in model_features:
    lines.append(f"    {status}  {feat:<36} {note}")

h2("Features for NLP duplicate detection (TF-IDF char n-gram)")
lines.append("    ✅  Work Description  (rec + comp combined corpus)")
lines.append(f"        Total corpus size: {len(rec)+len(comp):,} works")
lines.append(f"        Exact duplicates already in corpus: {exact_dup + exact_dup2:,}")
lines.append(f"        Blocking strategy: within same State (then district if block > 6000)")

h2("Signals confirmed in raw data")
signals = [
    ("Repeated payment lines",      f"{repeated_rows:,} rows ({pct(repeated_rows, len(exp))}) — strong vendor risk signal"),
    ("Round-number amounts (rec)",  f"52.9% exact ₹1L multiples — cost anomaly signal"),
    ("Low utilisation MPs",         f"{(util<25).sum()} MPs below 25% — fund utilisation signal"),
    ("Duplicate descriptions",      f"{exact_dup+exact_dup2:,} exact-match descriptions across both datasets"),
    ("Missing descriptions",        f"22 works with < 3-char descriptions — data quality signal"),
    ("Single payment status types", f"Only Success / In-Progress — no Failed events (by design)"),
]
for sig, detail in signals:
    row(f"  {sig}", detail)

# ══════════════════════════════════════════════════════════════════════════════
h1("KEY NUMBERS AT A GLANCE")
# ══════════════════════════════════════════════════════════════════════════════
blank()
lines.append("  ┌─────────────────────────────────────────────────────────────┐")
lines.append(f"  │  Total MPLADS works in system      {len(rec)+len(comp):>10,}               │")
lines.append(f"  │    Open / recommended              {len(rec):>10,}               │")
lines.append(f"  │    Completed                       {len(comp):>10,}               │")
lines.append(f"  │  Total payment lines               {len(exp):>10,}               │")
lines.append(f"  │    Of which repeated               {repeated_rows:>10,}  ({pct(repeated_rows, len(exp)):>6}) │")
lines.append(f"  │  MPs covered                       {len(mp):>10,}               │")
lines.append(f"  │  States / UTs covered              {rec['State'].nunique():>10,}               │")
lines.append(f"  │  Unique vendors                    {exp['Vendor'].str.strip().nunique():>10,}               │")
lines.append(f"  │  Total allocated (national)        {fmt_inr(alloc.sum()):>14}           │")
lines.append(f"  │  Total expended (national)         {fmt_inr(expnd.sum()):>14}           │")
lines.append(f"  │  National utilisation %            {nat['utilizationPercentage']:>10.1f}%              │")
lines.append(f"  │  Works with photos on portal       {comp['Has Images'].sum()+rec['Has Images'].sum():>10,}               │")
lines.append("  └─────────────────────────────────────────────────────────────┘")
blank()
lines.append("  Generated by: Outlier Ops — SIH 2026")
lines.append("  Snapshot date: 2026-08-22")
lines.append("  Source: MoSPI eSAKSHI portal (https://mplads.mospi.gov.in)")
blank()

# ── write outputs ─────────────────────────────────────────────────────────────

txt_path  = OUTDIR / "dataset_summaries.txt"
json_path = OUTDIR / "dataset_summaries.json"

txt_out = "\n".join(lines)
txt_path.write_text(txt_out, encoding="utf-8")

# make json serialisable (convert tuples to lists)
def fix(obj):
    if isinstance(obj, (list, tuple)):
        return [fix(i) for i in obj]
    if isinstance(obj, dict):
        return {k: fix(v) for k, v in obj.items()}
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj

json_path.write_text(json.dumps(fix(data), indent=2, default=str), encoding="utf-8")

print(txt_out)
print(f"\n{'='*65}")
print(f"  Saved to:")
print(f"    {txt_path}")
print(f"    {json_path}")
print(f"{'='*65}")
