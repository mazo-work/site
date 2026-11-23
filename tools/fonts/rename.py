#!/usr/bin/env python3
"""Renames a font whose licence reserves its name, as the SIL Open Font License requires of a Modified Version.

Usage: python3 -I tools/fonts/rename.py IN.woff2 OUT.woff2 "New Family" "Original Name"

v4 BRIEF.md §3: IM FELL English and IM FELL English SC are OFL fonts with Reserved Font Names. The site serves
Fontsource's Latin subsets of them (a subset is a Modified Version), so their primary names change. Only the names
a user is shown change (name IDs 1, 3, 4, 6, 16, 17, 21, 22, and the CFF names if any); the copyright notice (ID 0),
the licence (IDs 13, 14) and every glyph stay as they are, and a description (ID 10) says what was done and to what.
Needs fontTools 4.60.1 and brotli 1.1.0 (pip install fonttools==4.60.1 brotli==1.1.0); WOFF2 in, WOFF2 out.
"""
import sys
from fontTools.ttLib import TTFont

src, dest, family, original = sys.argv[1:5]
font = TTFont(src)
name = font['name']
style = name.getDebugName(2) or 'Regular'
full = family if style == 'Regular' else f'{family} {style}'
ps = (family + ('' if style == 'Regular' else '-' + style)).replace(' ', '')
new = {1: family, 3: f'{ps};mazo-site-v4', 4: full, 6: ps, 16: family, 17: style, 21: family, 22: style}
for rec in name.names:               # only records the font has: none are added
    if rec.nameID in new:
        rec.string = new[rec.nameID]
for plat, enc, lang in {(r.platformID, r.platEncID, r.langID) for r in name.names}:
    name.setName(f'Modified Version of {original} (Latin subset, as published by Fontsource), renamed {family} '
                 'as the SIL Open Font License requires; glyphs unchanged.', 10, plat, enc, lang)
if 'CFF ' in font:
    cff = font['CFF '].cff
    cff.fontNames = [ps]
    top = cff.topDictIndex[0]
    top.FullName, top.FamilyName = full, family
font.flavor = 'woff2'
font.save(dest)
reserved = [r.toUnicode() for r in font['name'].names if r.nameID in (1, 3, 4, 6, 16, 17, 21, 22) and 'FELL' in r.toUnicode().upper()]
if reserved:
    sys.exit(f'{dest}: a reserved name is still shown: {reserved}')
print(f'{dest}: {full}')
