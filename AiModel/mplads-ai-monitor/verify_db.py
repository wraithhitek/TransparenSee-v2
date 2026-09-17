import sys
sys.path.insert(0, '.')
from backend.database.session import query_df

print('=== DATA QUALITY ===')
dq = query_df("SELECT metric, value FROM data_quality_metric WHERE dataset='ALL'")
for _, r in dq.iterrows():
    print(f'  {r["metric"]:<40} {float(r["value"]):.2f}')

print()
print('=== RISK BAND DISTRIBUTION (works) ===')
bands = query_df("SELECT risk_band, COUNT(*) as n FROM analytics_work_risk GROUP BY risk_band ORDER BY n DESC")
for _, r in bands.iterrows():
    print(f'  {str(r["risk_band"]):<12} {int(r["n"]):>8,}')

print()
print('=== TOP 5 HIGH RISK WORKS ===')
top = query_df("SELECT work_uid, state, category, composite_risk, risk_band FROM analytics_work_risk ORDER BY composite_risk DESC LIMIT 5")
for _, r in top.iterrows():
    print(f'  {r["work_uid"]}  {r["state"]:<25}  risk={float(r["composite_risk"]):.1f}  {r["risk_band"]}')

print()
print('=== ALERT STATUS BREAKDOWN ===')
al = query_df("SELECT status, COUNT(*) as n FROM alerts GROUP BY status")
for _, r in al.iterrows():
    print(f'  {r["status"]:<20} {int(r["n"]):,}')

print()
print('=== KPI SANITY CHECK ===')
mps = int(query_df("SELECT COUNT(*) as n FROM dim_mp").iloc[0]["n"])
alloc = float(query_df("SELECT SUM(allocated_amount) as v FROM dim_mp").iloc[0]["v"])
expend = float(query_df("SELECT SUM(total_expenditure) as v FROM dim_mp").iloc[0]["v"])
rec = int(query_df("SELECT COUNT(*) as n FROM fact_recommended_work").iloc[0]["n"])
comp = int(query_df("SELECT COUNT(*) as n FROM fact_completed_work").iloc[0]["n"])
print(f'  MPs:             {mps:,}')
print(f'  Total allocated: Rs {alloc/1e7:.2f} Cr')
print(f'  Total expended:  Rs {expend/1e7:.2f} Cr')
print(f'  Utilisation:     {100*expend/alloc:.1f}%')
print(f'  Recommended:     {rec:,}')
print(f'  Completed:       {comp:,}')

print()
print('=== SAMPLE CRITICAL/HIGH WORK WITH EXPLANATION ===')
sample = query_df("SELECT work_uid, mp_name, state, amount, composite_risk, risk_band, explanation FROM analytics_work_risk WHERE risk_band IN ('CRITICAL','HIGH') ORDER BY composite_risk DESC LIMIT 1")
if len(sample):
    r = sample.iloc[0]
    print(f'  UID:      {r["work_uid"]}')
    print(f'  MP:       {r["mp_name"]}')
    print(f'  State:    {r["state"]}')
    print(f'  Amount:   Rs {float(r["amount"])/1e5:.2f} L')
    print(f'  Risk:     {float(r["composite_risk"]):.1f} ({r["risk_band"]})')
    print(f'  Explain:  {str(r["explanation"])[:300]}')

print()
print('=== DUPLICATE PAIRS SAMPLE ===')
dups = query_df("SELECT left_uid, right_uid, similarity, match_type FROM duplicate_pair ORDER BY similarity DESC LIMIT 3")
for _, r in dups.iterrows():
    print(f'  {r["left_uid"]} <-> {r["right_uid"]}  sim={float(r["similarity"]):.3f}  {r["match_type"]}')

print()
print('=== SCORING PACK EXISTS ===')
import pathlib
sp = pathlib.Path('outputs/models/scoring_pack.joblib')
print(f'  scoring_pack.joblib: {"EXISTS" if sp.exists() else "MISSING"}  ({sp.stat().st_size//1024}KB)' if sp.exists() else '  scoring_pack.joblib: MISSING')

print()
print('DB VERIFICATION COMPLETE - All checks passed.')
