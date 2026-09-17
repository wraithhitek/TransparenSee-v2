"""
FastAPI endpoint verification — Outlier Ops / SIH 2026
Run: python test_api.py
Tests every key endpoint and prints PASS/FAIL with real data samples.
"""
import json, sys
import urllib.request
import urllib.error

BASE   = "http://localhost:8000"
VIEWER = "dev-viewer-key"
ANALYST = "dev-analyst-key"

GREEN  = "\033[92m"; RED = "\033[91m"; CYAN = "\033[96m"
BOLD   = "\033[1m";  RESET = "\033[0m"; YELLOW = "\033[93m"

results = []

def get(path, key=VIEWER, expect_keys=None, label=None):
    url = BASE + path
    name = label or path
    req = urllib.request.Request(url, headers={"x-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
        # validate expected keys
        if expect_keys:
            top = data if isinstance(data, dict) else (data[0] if data else {})
            missing = [k for k in expect_keys if k not in top]
            if missing:
                print(f"  {RED}FAIL{RESET} {name} — missing keys: {missing}")
                results.append((name, False))
                return None
        print(f"  {GREEN}PASS{RESET} {name}")
        results.append((name, True))
        return data
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200]
        print(f"  {RED}FAIL{RESET} {name} — HTTP {e.code}: {body}")
        results.append((name, False))
        return None
    except Exception as ex:
        print(f"  {RED}FAIL{RESET} {name} — {ex}")
        results.append((name, False))
        return None

print(f"\n{BOLD}{'='*60}")
print("  FastAPI Endpoint Verification — Outlier Ops SIH 2026")
print(f"{'='*60}{RESET}\n")

# ── 1. Health ──────────────────────────────────────────────────
print(f"{BOLD}[1] Health{RESET}")
h = get("/health", expect_keys=["status","run_id"])
if h:
    print(f"       run_id : {h['run_id']}")
    print(f"       status : {h['status']}")

# ── 2. KPIs ────────────────────────────────────────────────────
print(f"\n{BOLD}[2] KPIs{RESET}")
kpi = get("/api/kpis", expect_keys=["mps","allocated","works_recommended","open_alerts"])
if kpi:
    print(f"       MPs:              {int(kpi['mps']):,}")
    print(f"       Allocated:        Rs {float(kpi['allocated'])/1e7:.1f} Cr")
    print(f"       Utilisation:      {kpi['utilisation_pct']}%")
    print(f"       Works scored:     {int(kpi['works_recommended']):,}")
    print(f"       High/Critical:    {int(kpi['high_or_critical']):,}")
    print(f"       Open alerts:      {int(kpi['open_alerts']):,}")
    print(f"       Data quality:     {kpi['data_quality_pct']}%")

# ── 3. States ──────────────────────────────────────────────────
print(f"\n{BOLD}[3] States rollup{RESET}")
states = get("/api/states", expect_keys=["state","works","high_risk","mean_risk"])
if states:
    print(f"       {len(states)} states returned. Top 3 by high-risk:")
    for s in states[:3]:
        print(f"         {s['state']:<30} works={int(s['works']):,}  high_risk={int(s['high_risk']):,}  mean_risk={s['mean_risk']}")

# ── 4. Districts ───────────────────────────────────────────────
print(f"\n{BOLD}[4] Districts{RESET}")
districts = get("/api/districts?limit=5", expect_keys=["state","ida_district"])
if districts:
    print(f"       {len(districts)} districts returned (limit=5). Sample:")
    for d in districts[:2]:
        print(f"         {d['state']:<20} {d['ida_district']}")

# ── 5. Works list ──────────────────────────────────────────────
print(f"\n{BOLD}[5] Works list (top 5 by risk){RESET}")
works = get("/api/works?limit=5", expect_keys=["work_uid","composite_risk","risk_band","state"])
if works:
    print(f"       {len(works)} works returned. Scores:")
    for w in works[:5]:
        print(f"         {w['work_uid']}  {w['state']:<25}  risk={float(w['composite_risk']):.1f}  {w['risk_band']}")

# ── 6. Work detail ─────────────────────────────────────────────
print(f"\n{BOLD}[6] Work detail (top CRITICAL work){RESET}")
if works:
    uid = works[0]["work_uid"]
    detail = get(f"/api/works/{uid}", expect_keys=["work","comparable_works","disclaimer"])
    if detail:
        w = detail["work"]
        print(f"       UID:        {w['work_uid']}")
        print(f"       MP:         {w['mp_name']}")
        print(f"       Risk:       {float(w['composite_risk']):.1f} ({w['risk_band']})")
        print(f"       Comparable: {len(detail['comparable_works'])} similar works found")
        print(f"       Duplicates: {len(detail['duplicate_candidates'])} duplicate candidates")
        exp = str(w.get('explanation',''))
        print(f"       Explain:    {exp[:180]}...")

# ── 7. Works filtered by HIGH band ────────────────────────────
print(f"\n{BOLD}[7] Works filter — HIGH band, Uttar Pradesh{RESET}")
high_up = get("/api/works?band=HIGH&state=Uttar+Pradesh&limit=5",
              expect_keys=["work_uid","risk_band"])
if high_up:
    print(f"       {len(high_up)} HIGH-risk works in UP returned")

# ── 8. MPs list ────────────────────────────────────────────────
print(f"\n{BOLD}[8] MPs list{RESET}")
mps = get("/api/mps?limit=5", expect_keys=["mp_name","composite_risk","utilisation_pct"])
if mps:
    print(f"       {len(mps)} MPs returned. Top:")
    for m in mps[:3]:
        print(f"         {m['mp_name']:<35} risk={float(m['composite_risk']):.1f}  works={m.get('works_total','?')}")

# ── 9. Vendors ─────────────────────────────────────────────────
print(f"\n{BOLD}[9] Vendors{RESET}")
vendors = get("/api/vendors?limit=5", expect_keys=["vendor"])
if vendors:
    print(f"       {len(vendors)} vendors returned. Sample: {vendors[0]['vendor']}")

# ── 10. Alerts ─────────────────────────────────────────────────
print(f"\n{BOLD}[10] Alerts queue{RESET}")
alerts = get("/api/alerts?limit=5", expect_keys=["alert_id","entity_type","status"])
if alerts:
    print(f"       {len(alerts)} alerts returned. Statuses: {set(a['status'] for a in alerts)}")
    print(f"       Sample: {alerts[0]['alert_id']}  entity={alerts[0]['entity_type']}  severity={alerts[0].get('severity','?')}")

# ── 11. Duplicates ─────────────────────────────────────────────
print(f"\n{BOLD}[11] Duplicate pairs{RESET}")
dups = get("/api/duplicates?limit=3", expect_keys=["left_uid","similarity"])
if dups:
    print(f"       {len(dups)} pairs returned. Top similarity: {float(dups[0]['similarity']):.3f}  type: {dups[0]['match_type']}")

# ── 12. Data quality ───────────────────────────────────────────
print(f"\n{BOLD}[12] Data quality report{RESET}")
dq = get("/api/data-quality", expect_keys=["metrics","issues"])
if dq:
    scores = {m["metric"]: m["value"] for m in dq.get("metrics", []) if m["dataset"] == "ALL"}
    print(f"       Overall quality: {scores.get('overall_data_quality_pct','?')}%")
    print(f"       Validity:        {scores.get('validity_pct','?')}%")
    print(f"       Reconciliation:  {scores.get('reconciliation_pct','?')}%")

# ── 13. Score a proposed work (live scoring) ───────────────────
print(f"\n{BOLD}[13] Live scoring — POST /api/score{RESET}")
payload = json.dumps({
    "mp_name": "RAHUL GANDHI",
    "state": "Uttar Pradesh",
    "category": "Normal/Others",
    "amount": 9500000,
    "work_description": "Construction of road",
    "ida_district": "Rae Bareli",
    "house": "Lok Sabha"
}).encode()
req = urllib.request.Request(
    f"{BASE}/api/score",
    data=payload,
    headers={"x-api-key": ANALYST, "content-type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        score_data = json.loads(r.read())
    print(f"  {GREEN}PASS{RESET} POST /api/score")
    results.append(("POST /api/score", True))
    print(f"       Composite risk:  {score_data.get('composite_risk','?')}")
    print(f"       Risk band:       {score_data.get('risk_band','?')}")
    print(f"       Would alert:     {score_data.get('would_raise_alert','?')}")
    exp = str(score_data.get('explanation',''))
    print(f"       Explanation:     {exp[:150]}...")
except Exception as ex:
    print(f"  {RED}FAIL{RESET} POST /api/score — {ex}")
    results.append(("POST /api/score", False))

# ── 14. Meta ───────────────────────────────────────────────────
print(f"\n{BOLD}[14] API meta{RESET}")
meta = get("/api/meta", expect_keys=["platform","run_id","risk_weights"])
if meta:
    print(f"       Platform: {meta['platform']}")
    print(f"       Run ID:   {meta['run_id']}")
    print(f"       Weights:  {meta['risk_weights']}")

# ── Summary ────────────────────────────────────────────────────
passed = [r for r in results if r[1]]
failed = [r for r in results if not r[1]]

print(f"\n{BOLD}{'='*60}{RESET}")
print(f"  {GREEN}{BOLD}{len(passed)} PASSED{RESET}  "
      + (f"{RED}{BOLD}{len(failed)} FAILED{RESET}" if failed else f"{GREEN}0 FAILED{RESET}"))
if failed:
    print(f"\n  {RED}Failed:{RESET}")
    for name, _ in failed:
        print(f"    ✗ {name}")
print()
sys.exit(0 if not failed else 1)
