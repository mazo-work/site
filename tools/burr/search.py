"""How the MAZO puzzle was found: four flat letters, any of the 24 orientations each, assembled backwards from the end
of the solve. Stage 2: Z escapes O. Stage 1: A escapes; Z and O stay locked. Stage 0: M escapes; A, Z and O stay locked.
Escapes may take up to 3 straight legs; "locked" means no escape by any path with the other letters held still.
Usage: python3 tools/burr/search.py 7 M2,A3,Z1,OS1   (box size, then glyph sets; see burrlib.GLYPHS)
Found on 2026-11-21: 89,430 layouts for M2/A3/Z1 with the stencil O (OS1 or OS2), none with the closed O1."""
import itertools, collections, json, sys, time
from burrlib import P, DIRS, removable, unit_moves, escapes, escape_path, reach, segments

def rotations():
    mats = []
    for perm in itertools.permutations(range(3)):
        for signs in itertools.product((1, -1), repeat=3):
            m = [[0]*3 for _ in range(3)]
            for r in range(3): m[r][perm[r]] = signs[r]
            det = (m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
                   + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]))
            if det == 1: mats.append(m)
    return mats
ROT = rotations(); assert len(ROT) == 24

def orients(pixels):
    pts = [(i, r, 0) for i, r in pixels]
    seen = {}
    for k, m in enumerate(ROT):
        q = [tuple(sum(m[a][b]*p[b] for b in range(3)) for a in range(3)) for p in pts]
        mn = [min(c[a] for c in q) for a in range(3)]
        s = frozenset((c[0]-mn[0], c[1]-mn[1], c[2]-mn[2]) for c in q)
        seen.setdefault(s, k)
    return list(seen.items())   # (normalised voxel set, rotation index)

def placements(pixels, lo, hi):
    out = []
    for s, k in orients(pixels):
        ext = [max(c[a] for c in s) + 1 for a in range(3)]
        rng = [range(lo[a], hi[a] - ext[a] + 2) for a in range(3)]
        for t in itertools.product(*rng):
            out.append((frozenset((c[0]+t[0], c[1]+t[1], c[2]+t[2]) for c in s), k, t))
    return out

def bbox(s):
    return [(min(c[a] for c in s), max(c[a] for c in s)) for a in range(3)]
def sweep(s, d, K):
    out = set()
    for k in range(1, K+1):
        out |= {(c[0]+d[0]*k, c[1]+d[1]*k, c[2]+d[2]*k) for c in s}
    return frozenset(out)


def swept(piece, region):
    return frozenset((p[0]+t[0], p[1]+t[1], p[2]+t[2]) for t in region for p in piece)

def run(gM, gA, gZ, gO, BOX, log, maxseg=3):
    O = frozenset((i, r, 0) for i, r in P['O'][gO])
    lo = (4 - BOX, 4 - BOX, -BOX + 1); hi = (BOX, BOX, BOX - 1)
    within = lambda s: all(b - a + 1 <= BOX for a, b in bbox(s))
    PZ = placements(P['Z'][gZ], lo, hi); PA = placements(P['A'][gA], lo, hi); PM = placements(P['M'][gM], lo, hi)
    c = collections.Counter(); sols = []
    for Z, kz, tz in PZ:
        if Z & O or not within(Z | O): continue
        bz, bo = bbox(Z), bbox(O)
        if not all(bz[a][0] <= bo[a][1] and bo[a][0] <= bz[a][1] for a in range(3)): continue
        pZ = escape_path(Z, O, bound=8)
        if pZ is None or segments(pZ) > maxseg: continue
        if len(removable(Z, O)) > 2: continue            # Z must be properly hooked into O, not loose
        c['Z ok'] += 1
        RZ = reach(Z, O, bound=4)
        sZ = swept(Z, RZ) - Z
        sO = swept(O, {(-t[0], -t[1], -t[2]) for t in RZ}) - O
        ZO = Z | O
        for A, ka, ta in PA:
            if A & ZO or not within(A | ZO): continue
            if not (A & sZ and A & sO): continue
            if removable(Z, A | O) or removable(O, A | Z): continue
            c['A blocks straight'] += 1
            if escape_path(Z, A | O, bound=8) is not None: c['Z escapes s1'] += 1; continue
            if escape_path(O, A | Z, bound=8) is not None: c['O escapes s1'] += 1; continue
            pA = escape_path(A, ZO, bound=8)
            if pA is None: c['A trapped'] += 1; continue
            if segments(pA) > maxseg: c['A path long'] += 1; continue
            c['stage1 ok'] += 1
            RA = reach(A, ZO, bound=4)
            sA = swept(A, RA) - A
            AZO = A | ZO
            for M, km, tm in PM:
                if M & AZO or not within(M | AZO): continue
                if not (M & sA): continue
                if removable(A, M | ZO): continue
                if escape_path(A, M | ZO, bound=8) is not None: continue
                pM = escape_path(M, AZO, bound=8)
                if pM is None or segments(pM) > maxseg: continue
                c['SOLUTION'] += 1
                sols.append(dict(glyphs=dict(M=gM, A=gA, Z=gZ, O=gO), M=sorted(M), A=sorted(A), Z=sorted(Z),
                                 O=sorted(O), pathM=pM, pathA=pA, pathZ=pZ, rot=dict(M=km, A=ka, Z=kz)))
    log(f"{gM} {gA} {gZ} {gO} box{BOX}: {dict(c)}")
    return sols

if __name__ == '__main__':
    BOX = int(sys.argv[1]); t0 = time.time(); allsols = []
    combos = [tuple(x.split(',')) for x in sys.argv[2:]] or list(itertools.product(['M2'], ['A3', 'A2'], ['Z1', 'Z6'], ['O1']))
    for gM, gA, gZ, gO in combos:
        allsols += run(gM, gA, gZ, gO, BOX, lambda s: print(s, f'{time.time()-t0:.0f}s', flush=True))
        json.dump(allsols, open(f'g3sol_box{BOX}.json', 'w'))
    print('total solutions', len(allsols))
