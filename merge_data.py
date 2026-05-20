import json

data = {}
files = {
    'pts': '/tmp/pts.json',
    'ast': '/tmp/ast.json',
    'reb': '/tmp/reb.json',
    'stl': '/tmp/stl.json',
    'blk': '/tmp/blk.json',
    'fg3': '/tmp/fg3.json',
    'fg': '/tmp/fg.json',
    'ft': '/tmp/ft.json',
    'po_pts': '/tmp/po_pts.json',
    'standings': '/tmp/standings.json'
}

for key, path in files.items():
    with open(path) as f:
        data[key] = json.load(f)

with open('data.json', 'w') as f:
    json.dump(data, f)

print('done')
