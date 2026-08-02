import urllib.request
import json

print("=== PASS 1: BACKEND API DRY RUN & GEOFENCE VERIFICATION ===")

# 1. Wards API
r = urllib.request.urlopen("http://127.0.0.1:8099/api/wards")
wards = json.loads(r.read())
print(f"1. Wards Count: {len(wards)} | First Ward MLA: {wards[0].get('mla_en')}")

# 2. Reports API
r = urllib.request.urlopen("http://127.0.0.1:8099/api/reports")
reports = json.loads(r.read())
print(f"2. Reports Count: {len(reports)} | First Report Category: {reports[0].get('category')}")

# 3. Geofence In-City Test (Ahmedabad coords)
req = urllib.request.Request(
    "http://127.0.0.1:8099/api/wards/resolve",
    data=json.dumps({"lat": 23.0225, "lng": 72.5714}).encode(),
    headers={"Content-Type": "application/json"}
)
r = urllib.request.urlopen(req)
data = json.loads(r.read())
print(f"3. In-City Resolve: Matched ward \"{data['ward']['name_en']}\" ({data['distance_m']} m)")

# 4. Geofence Out-of-City Test (Bengaluru coords)
try:
    req = urllib.request.Request(
        "http://127.0.0.1:8099/api/wards/resolve",
        data=json.dumps({"lat": 12.9716, "lng": 77.5946}).encode(),
        headers={"Content-Type": "application/json"}
    )
    r = urllib.request.urlopen(req)
    print("4. Out-of-City Resolve: ERROR (Should have been rejected)")
except urllib.error.HTTPError as e:
    err_body = json.loads(e.read())
    print(f"4. Out-of-City Resolve Geofence Check: SUCCESS! Rejection HTTP {e.code} -> \"{err_body['detail']}\"")

# 5. Upvote Endpoint
req = urllib.request.Request(
    "http://127.0.0.1:8099/api/reports/rpt_001/upvote",
    data=b"",
    headers={"Content-Type": "application/json"}
)
r = urllib.request.urlopen(req)
print(f"5. Upvote Test: {r.read().decode()}")

# 6. Verify Cleanup Endpoint
req = urllib.request.Request(
    "http://127.0.0.1:8099/api/reports/rpt_001/verify",
    data=json.dumps({"notes": "Verified clean"}).encode(),
    headers={"Content-Type": "application/json"}
)
r = urllib.request.urlopen(req)
print(f"6. Verify Cleanup Test: Status = {json.loads(r.read())['status']}")

# 7. Flag Report Endpoint
req = urllib.request.Request(
    "http://127.0.0.1:8099/api/reports/rpt_001/flag",
    data=json.dumps({"reason": "Invalid location"}).encode(),
    headers={"Content-Type": "application/json"}
)
r = urllib.request.urlopen(req)
print(f"7. Flag Report Test: Flagged = {json.loads(r.read())['flagged']}")

# 8. Stats Leaderboard Endpoint
r = urllib.request.urlopen("http://127.0.0.1:8099/api/stats")
stats = json.loads(r.read())
lb_len = len(stats.get("ward_leaderboard", []))
print(f"8. Stats API Leaderboard: SUCCESS! {lb_len} wards ranked. Top ward: \"{stats['ward_leaderboard'][0]['name_en']}\" ({stats['ward_leaderboard'][0]['resolution_rate_pct']}% resolution rate)")
