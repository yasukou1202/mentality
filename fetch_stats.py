import urllib.request
import json

def fetch(url):
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    req.add_header('Referer', 'https://www.nba.com/')
    req.add_header('Accept', 'application/json, text/plain, */*')
    req.add_header('Accept-Language', 'en-US,en;q=0.9')
    req.add_header('Origin', 'https://www.nba.com')
    req.add_header('x-nba-stats-origin', 'stats')
    req.add_header('x-nba-stats-token', 'true')
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

BASE = "https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2025-26"
data = {}

for stat, key in [('PTS','pts'),('AST','ast'),('REB','reb'),('STL','stl'),('BLK','blk')]:
    try:
        data[key] = fetch(f"{BASE}&SeasonType=Regular+Season&StatCategory={stat}")
        print(f"OK: {key}")
    except Exception as e:
        print(f"NG: {key} - {e}")

try:
    data['po_pts'] = fetch(f"{BASE}&SeasonType=Playoffs&StatCategory=PTS")
    print("OK: po_pts")
except Exception as e:
    print(f"NG: po_pts - {e}")

# FG%/3P%/FT%はPTSデータから生成
if 'pts' in data:
    for pct_key, col in [('fg','FG_PCT'),('fg3','FG3_PCT'),('ft','FT_PCT')]:
        rs = data['pts']['resultSet']
        headers = rs['headers']
        col_idx = headers.index(col)
        sorted_rows = sorted(rs['rowSet'], key=lambda r: r[col_idx], reverse=True)
        data[pct_key] = {'resultSet': {'headers': headers, 'rowSet': sorted_rows}}
        print(f"OK: {pct_key} (from pts)")

with open('data.json', 'w') as f:
    json.dump(data, f)
print("done")
