"""Check the committed MAZO puzzle data: run with  python3 tools/burr/check.py

For each design in docs/puzzle/mazo-burr.json it rebuilds the four letters from their glyphs, rotations and offsets, then proves:
  1. no two letters overlap;
  2. stage by stage (M, then A, then Z), the named letter escapes along exactly the path recorded, with the others held still;
  3. at stages 0 and 1 no other letter can escape by any path (breadth-first search, one letter moving, others held);
  4. 'leaks': parking the free letter anywhere it can reach within 2 steps, still tangled, frees nothing else.
     The page never leaves a letter part-way (a pull completes or springs back), so leaks are reported, not failed,
     except where the design claims zero.
Exit code 0 only if every hard check passes."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from burrlib import DIRS, escape_path, reach

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
ORDER = ['M', 'A', 'Z', 'O']

def pixels(rows):
    return [(i, len(rows) - 1 - k) for k, row in enumerate(rows) for i, ch in enumerate(row) if ch == 'X']

def build(d):
    pcs = {}
    for L in ORDER:
        p = d['pieces'][L]; R = p['R']; off = p['off']
        vox = set()
        for i, r in pixels(p['glyph']):
            v = [sum(R[a][b] * (i, r, 0)[b] for b in range(3)) + off[a] for a in range(3)]
            assert all(abs(c - round(c)) < 1e-9 for c in v), (L, v)
            vox.add(tuple(int(round(c)) for c in v))
        pcs[L] = frozenset(vox)
    return pcs

def bb(s): return [(min(c[a] for c in s), max(c[a] for c in s)) for a in range(3)]
def engaged(a, b):
    A, B = bb(a), bb(b)
    return all(A[k][0] <= B[k][1] and A[k][1] >= B[k][0] for k in range(3))

def check(d):
    ok = True; pcs = build(d)
    for a in ORDER:
        for b in ORDER:
            if a < b and pcs[a] & pcs[b]:
                print(f"  FAIL {a} and {b} overlap"); ok = False
    rem = list(ORDER); leaks = {}
    for s, L in enumerate(ORDER[:-1]):
        others = frozenset().union(*[pcs[o] for o in rem if o != L])
        path = escape_path(pcs[L], others)
        if path != d['pieces'][L]['path']:
            print(f"  FAIL {L}: escape path {path} differs from the recorded {d['pieces'][L]['path']}"); ok = False
        for o in rem:
            if o == L or len(rem) <= 2: continue
            env = frozenset().union(*[pcs[x] for x in rem if x != o])
            if escape_path(pcs[o], env) is not None:
                print(f"  FAIL stage {s}: {o} can escape before {L}"); ok = False
        if len(rem) > 2:
            n = 0
            for t in reach(pcs[L], others, bound=2):
                if t == (0, 0, 0): continue
                f = frozenset((p[0]+t[0], p[1]+t[1], p[2]+t[2]) for p in pcs[L])
                if not engaged(f, others): continue
                for o in rem:
                    if o == L: continue
                    env = f | frozenset().union(*[pcs[x] for x in rem if x not in (L, o)])
                    if escape_path(pcs[o], env) is not None: n += 1
            leaks[L] = n
        rem.remove(L)
    claimed = d.get('leaks')
    if claimed is not None and claimed != leaks:
        print(f"  FAIL leaks {leaks} differ from the recorded {claimed}"); ok = False
    print(f"  {'PASS' if ok else 'FAIL'}  paths " + '  '.join(f"{L}:{''.join(d['pieces'][L]['path']) or 'free'}" for L in ORDER)
          + f"  leaks {leaks}")
    return ok

if __name__ == '__main__':
    data = json.load(open(os.path.join(ROOT, 'docs', 'puzzle', 'mazo-burr.json')))
    good = True
    for d in data['designs']:
        print(d['name'])
        good &= check(d)
    sys.exit(0 if good else 1)
