"""MAZO letter burr: glyphs, placement, and a single-piece translation solver."""
from functools import lru_cache

GLYPHS = {
 'M': {'M2': ["XX.XX","XXXXX","X.X.X","X...X","X...X"],
       'M6': ["XXXXX","X.X.X","X.X.X","X...X","X...X"],
       'M9': ["X...X","XXXXX","X.X.X","X...X","X...X"],
       'M12':["XX.XX","XXXXX","X...X","X...X","X...X"],
       'M13':["XXXXX","X.X.X","X...X","X...X","X...X"]},
 'A': {'A2': ["XXXXX","X...X","XXXXX","X...X","X...X"],
       'A3': [".XXX.","XX.XX","XXXXX","X...X","X...X"],
       'A4': [".XXX.","XX.XX","X...X","XXXXX","X...X"],
       'A5': ["..X..",".XXX.","XX.XX","XXXXX","X...X"],
       'A6': ["XXXXX","X...X","X...X","XXXXX","X...X"],
       'AS1':[".X.X.","XX.XX","XXXXX","X...X","X...X"]},
 'Z': {'Z1': ["XXXXX","...XX","..XX.",".XX..","XXXXX"],
       'Z3': ["XXXXX","...X.","..XX.",".XX..","XXXXX"],
       'Z6': ["XXXX.","...X.","..XX.",".XX..",".XXXX"]},
 'O': {'O1': ["XXXXX","X...X","X...X","X...X","XXXXX"],
       'OS1':["XXXXX","X...X","X...X","X...X","XX.XX"],
       'OS2':["XXXXX","X...X","X...X","X...X","X.XXX"],
       'O3': ["XXXXX","XX.XX","X...X","XX.XX","XXXXX"]},
}
DIRS = {'+x':(1,0,0),'-x':(-1,0,0),'+y':(0,1,0),'-y':(0,-1,0),'+z':(0,0,1),'-z':(0,0,-1)}

def pix(rows):
    H = len(rows)
    return frozenset((i, H-1-k) for k, row in enumerate(rows) for i, ch in enumerate(row) if ch == 'X')

def connected(p):
    p = set(p); start = next(iter(p)); seen = {start}; q = [start]
    while q:
        i, r = q.pop()
        for n in ((i+1,r),(i-1,r),(i,r+1),(i,r-1)):
            if n in p and n not in seen: seen.add(n); q.append(n)
    return len(seen) == len(p)

def connected3(s):
    s = set(s); start = next(iter(s)); seen = {start}; q = [start]
    while q:
        x, y, z = q.pop()
        for n in ((x+1,y,z),(x-1,y,z),(x,y+1,z),(x,y-1,z),(x,y,z+1),(x,y,z-1)):
            if n in s and n not in seen: seen.add(n); q.append(n)
    return len(seen) == len(s)

def load(glyphs=GLYPHS):
    P = {L: {g: pix(rows) for g, rows in d.items()} for L, d in glyphs.items()}
    for L in P:
        for g in P[L]: assert connected(P[L][g]), (L, g)
    return P
P = load()

@lru_cache(maxsize=None)
def V(L, g, plane, off, dy, flip=False):
    out = set()
    for i, r in P[L][g]:
        if L == 'M':   out.add((off + i, r + dy, plane))
        elif L == 'Z': out.add((off + (i if flip else 4 - i), r + dy, plane))
        elif L == 'A': out.add((plane, r + dy, off + 4 - i))
        elif L == 'O': out.add((plane, r + dy, off + i))
    return frozenset(out)

def shifted(s, d, k):
    return {(x + d[0]*k, y + d[1]*k, z + d[2]*k) for x, y, z in s}

def removable(piece, others, reach=14):
    return [n for n, d in DIRS.items() if all(not (shifted(piece, d, k) & others) for k in range(1, reach))]

def unit_moves(piece, others):
    return [n for n, d in DIRS.items() if not (shifted(piece, d, 1) & others)]

def escapes(piece, others, limit=8):
    """BFS over translations of one piece (others fixed): can it get out by any path, not only a straight line?"""
    ox = [v[0] for v in others]; oy = [v[1] for v in others]; oz = [v[2] for v in others]
    lo = (min(ox), min(oy), min(oz)); hi = (max(ox), max(oy), max(oz))
    start = (0, 0, 0); seen = {start}; q = [start]
    while q:
        t = q.pop()
        moved = shifted(piece, t, 1)
        xs = [v[0] for v in moved]; ys = [v[1] for v in moved]; zs = [v[2] for v in moved]
        if (min(xs) > hi[0] or max(xs) < lo[0] or min(ys) > hi[1] or max(ys) < lo[1]
                or min(zs) > hi[2] or max(zs) < lo[2]):
            return True
        for d in DIRS.values():
            n = (t[0]+d[0], t[1]+d[1], t[2]+d[2])
            if n in seen or max(abs(c) for c in n) > limit: continue
            if shifted(piece, n, 1) & others: continue
            seen.add(n); q.append(n)
    return False

ORDER = ['M', 'A', 'Z', 'O']

def analyse(pcs, order=ORDER):
    stages = []
    for s in range(len(order) - 1):
        rem = order[s:]; free = order[s]
        oth = lambda L: frozenset().union(*[pcs[o] for o in rem if o != L])
        rd = removable(pcs[free], oth(free))
        if not rd: return None
        wig = 0
        if len(rem) > 2:
            for L in rem[1:]:
                if removable(pcs[L], oth(L)): return None
                wig += len(unit_moves(pcs[L], oth(L)))
        stages.append({'free': free, 'dirs': rd, 'wiggle': wig})
    return stages

def why(pcs, order=ORDER):
    for s in range(len(order) - 1):
        rem = order[s:]; free = order[s]
        oth = lambda L: frozenset().union(*[pcs[o] for o in rem if o != L])
        r = removable(pcs[free], oth(free))
        bad = [L for L in rem[1:] if len(rem) > 2 and removable(pcs[L], oth(L))]
        if not r and bad: return f"s{s}: {free} stuck, {''.join(bad)} free"
        if not r: return f"s{s}: {free} stuck"
        if bad: return f"s{s}: {free} free, also {''.join(bad)}"
    return "ok"

# --- generalised placement: any letter in any slot of the '#' ---
# slots: F (plane z=zm, read from +z), B (plane z=zz, read from -z), R (plane x=xa, read from +x), L (plane x=xo, read from -x)
@lru_cache(maxsize=None)
def VS(L, g, slot, plane, off, dy, flip=False):
    out = set()
    for i, r in P[L][g]:
        j = (4 - i) if flip else i
        if slot == 'F':   out.add((off + j, r + dy, plane))
        elif slot == 'B': out.add((off + 4 - j, r + dy, plane))
        elif slot == 'R': out.add((plane, r + dy, off + 4 - j))
        elif slot == 'L': out.add((plane, r + dy, off + j))
    return frozenset(out)

def escape_path(piece, others, bound=9):
    """Shortest escape of one piece (others fixed) as a list of unit moves; None if it cannot get out."""
    ox = [v[0] for v in others]; oy = [v[1] for v in others]; oz = [v[2] for v in others]
    lo = (min(ox), min(oy), min(oz)); hi = (max(ox), max(oy), max(oz))
    pts = list(piece)
    def out(t):
        xs = [p[0]+t[0] for p in pts]; ys = [p[1]+t[1] for p in pts]; zs = [p[2]+t[2] for p in pts]
        return (min(xs) > hi[0] or max(xs) < lo[0] or min(ys) > hi[1] or max(ys) < lo[1]
                or min(zs) > hi[2] or max(zs) < lo[2])
    def free(t):
        return not any((p[0]+t[0], p[1]+t[1], p[2]+t[2]) in others for p in pts)
    start = (0, 0, 0); prev = {start: None}; q = [start]; qi = 0
    while qi < len(q):
        t = q[qi]; qi += 1
        if out(t):
            path = []
            while prev[t] is not None:
                t0, d = prev[t]; path.append(d); t = t0
            return path[::-1]
        for name, d in DIRS.items():
            n = (t[0]+d[0], t[1]+d[1], t[2]+d[2])
            if n in prev or max(abs(c) for c in n) > bound: continue
            if not free(n): continue
            prev[n] = (t, name); q.append(n)
    return None

def reach(piece, others, bound=9):
    """All offsets one piece can reach (others fixed), stopping once it is out."""
    pts = list(piece); start = (0, 0, 0); seen = {start}; q = [start]
    while q:
        t = q.pop()
        for d in DIRS.values():
            n = (t[0]+d[0], t[1]+d[1], t[2]+d[2])
            if n in seen or max(abs(c) for c in n) > bound: continue
            if any((p[0]+n[0], p[1]+n[1], p[2]+n[2]) in others for p in pts): continue
            seen.add(n); q.append(n)
    return seen

def segments(path):
    if not path: return 0
    return 1 + sum(1 for a, b in zip(path, path[1:]) if a != b)

def joint_first_out(pieces, bound=7, cap=400000):
    """Full disassembly check (BurrTools-style): every piece may move by unit steps, one piece at a time,
    from the assembled state. Returns ({names that can come out first}, states explored).
    A state in which some piece has come out is terminal: it is recorded, never expanded."""
    names = list(pieces); vox = {n: list(pieces[n]) for n in names}
    def separated(st, k):
        o = st[k]
        mine = [(p[0]+o[0], p[1]+o[1], p[2]+o[2]) for p in vox[names[k]]]
        others = [(p[0]+st[j][0], p[1]+st[j][1], p[2]+st[j][2]) for j in range(len(names)) if j != k for p in vox[names[j]]]
        lo = [min(c[a] for c in others) for a in range(3)]; hi = [max(c[a] for c in others) for a in range(3)]
        mlo = [min(c[a] for c in mine) for a in range(3)]; mhi = [max(c[a] for c in mine) for a in range(3)]
        return any(mlo[a] > hi[a] or mhi[a] < lo[a] for a in range(3))
    start = tuple((0, 0, 0) for _ in names)
    out = {names[k] for k in range(len(names)) if separated(start, k)}
    if out: return out, 1
    seen = {start}; q = [start]; qi = 0
    while qi < len(q):
        st = q[qi]; qi += 1
        occ = {}
        for n, o in zip(names, st):
            for p in vox[n]: occ[(p[0]+o[0], p[1]+o[1], p[2]+o[2])] = n
        for k, n in enumerate(names):
            o = st[k]
            mine = [(p[0]+o[0], p[1]+o[1], p[2]+o[2]) for p in vox[n]]
            for d in DIRS.values():
                no = (o[0]+d[0], o[1]+d[1], o[2]+d[2])
                if max(abs(c) for c in no) > bound: continue
                if any(occ.get((c[0]+d[0], c[1]+d[1], c[2]+d[2]), n) != n for c in mine): continue
                ns = st[:k] + (no,) + st[k+1:]
                if ns in seen: continue
                seen.add(ns)
                if separated(ns, k):
                    out.add(n); continue
                q.append(ns)
                if len(seen) > cap: return out, len(seen)
    return out, len(seen)

def verify_order(pcs, order=('M', 'A', 'Z', 'O')):
    report = []
    for s in range(len(order) - 2):
        rem = {L: pcs[L] for L in order[s:]}
        first, n = joint_first_out(rem)
        report.append((order[s], sorted(first), n))
    return report
