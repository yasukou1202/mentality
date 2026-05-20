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

# FG%/3P%/FT%はPTSデータから生成（NBA公式条件）
if 'pts' in data:
    rs = data['pts']['resultSet']
    headers = rs['headers']
    conditions = [
        ('fg',  'FG_PCT', 'FGA',  300),
        ('fg3', 'FG3_PCT','FG3A',  82),
        ('ft',  'FT_PCT', 'FTA',  125),
    ]
    for pct_key, col, att_col, min_att in conditions:
        col_idx = headers.index(col)
        att_idx = headers.index(att_col)
        filtered_rows = [r for r in rs['rowSet'] if r[att_idx] >= min_att]
        sorted_rows = sorted(filtered_rows, key=lambda r: r[col_idx], reverse=True)
        data[pct_key] = {'resultSet': {'headers': headers, 'rowSet': sorted_rows}}
        print(f"OK: {pct_key} (from pts, {len(sorted_rows)}人)")

with open('data.json', 'w') as f:
    json.dump(data, f)
print("done")

# 全30チームの選手IDを取得してESPNID_MAPを作成
import time
import unicodedata

def normalize_name(s):
    return unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode('ascii')

espnid_map = {}
team_ids = list(range(1, 31))
for tid in team_ids:
    try:
        url = f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{tid}/roster"
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(req, timeout=10) as r:
            d = json.loads(r.read())
            for a in d.get('athletes', []):
                name = f"{a.get('firstName','')} {a.get('lastName','')}".strip()
                if name and a.get('id'):
                    espnid_map[name] = a['id']
        time.sleep(0.2)
        print(f"Team {tid}: OK")
    except Exception as e:
        print(f"Team {tid}: NG - {e}")

# data.jsonに追加
with open('data.json', 'r') as f:
    existing = json.load(f)
existing['espnid_map'] = espnid_map
with open('data.json', 'w') as f:
    json.dump(existing, f)
print(f"ESPNID_MAP: {len(espnid_map)}人")
