"""Build the P0 preview: copies three.js from node_modules into lib/ and embeds the puzzle data from
docs/puzzle/mazo-burr.json (the same file tools/burr/check.py verifies) into index.html.
Usage (from prototype/p0):  npm ci && python3 build.py && python3 -m http.server 8765"""
import json, os, shutil
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..', '..')
data = json.load(open(os.path.join(root, 'docs', 'puzzle', 'mazo-burr.json')))
slim = []
for d in data['designs']:
    c = d['center']
    slim.append({'name': d['name'], 'note': d['note'], 'dims': d['dims'],
                 'core': [d['core'][a] - c[a] for a in range(3)],
                 'pieces': {L: {'glyph': p['glyph'], 'R': p['R'], 'path': p['path'],
                                'off': [p['off'][a] - c[a] for a in range(3)]} for L, p in d['pieces'].items()}})
src = open(os.path.join(here, 'index.src.html')).read()
assert src.count('__DESIGNS__') == 1
open(os.path.join(here, 'index.html'), 'w').write(src.replace('__DESIGNS__', json.dumps(slim, separators=(',', ':'))))
nm = os.path.join(here, 'node_modules', 'three')
os.makedirs(os.path.join(here, 'lib', 'addons'), exist_ok=True)
shutil.copy(os.path.join(nm, 'build', 'three.module.min.js'), os.path.join(here, 'lib'))
for f in ('geometries/RoundedBoxGeometry.js', 'environments/RoomEnvironment.js'):
    shutil.copy(os.path.join(nm, 'examples', 'jsm', f), os.path.join(here, 'lib', 'addons'))
print('built index.html and lib/')
