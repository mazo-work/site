"""Build the P0 preview.

    python3 build.py              index.html and lib/ beside this file (the private claude.ai preview)
    python3 build.py --site DIR   a public copy in DIR, with a strict Content-Security-Policy
                                  (if DIR/site/index.html exists, the current site, it becomes the page
                                   the curtain reveals; it gets its own noindex tag and policy)

Both embed the puzzle data from docs/puzzle/mazo-burr.json (the file tools/burr/check.py verifies)
and copy three.js from node_modules (run `npm ci` first). Every build carries a robots noindex tag.
The public copy's policy allows only this page's own files and its three inline blocks, by hash."""
import argparse, base64, hashlib, json, os, re, shutil

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..', '..')


def designs():
    data = json.load(open(os.path.join(root, 'docs', 'puzzle', 'mazo-burr.json')))
    slim = []
    for d in data['designs']:
        c = d['center']
        slim.append({'name': d['name'], 'note': d['note'], 'dims': d['dims'],
                     'core': [d['core'][a] - c[a] for a in range(3)],
                     'pieces': {L: {'glyph': p['glyph'], 'R': p['R'], 'path': p['path'],
                                    'off': [p['off'][a] - c[a] for a in range(3)]} for L, p in d['pieces'].items()}})
    return json.dumps(slim, separators=(',', ':'))


def sha(text):
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode('utf-8')).digest()).decode() + "'"


def csp_for(html):
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
    styles = re.findall(r'<style[^>]*>(.*?)</style>', html, re.S)
    assert len(scripts) == 2 and len(styles) == 1, (len(scripts), len(styles))
    return ("default-src 'none'; script-src 'self' " + ' '.join(sha(s) for s in scripts) +
            "; style-src " + ' '.join(sha(s) for s in styles) +
            "; img-src 'self' data: blob:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none';"
            " worker-src 'none'; manifest-src 'none'; frame-src 'self'; base-uri 'none'; form-action 'none'")

SITE_CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none';"
            " object-src 'none'; frame-src 'none'; base-uri 'none'; form-action https://formspree.io")


def patch_site(path):
    """The current site, built by Vite: add the noindex tag and its own policy (no inline code in that build)."""
    html = open(path).read()
    assert '<script>' not in html and '<style' not in html, 'the site build has inline code; extend its policy first'
    if 'Content-Security-Policy' not in html:
        html = html.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex, nofollow">\n'
                            '    <meta http-equiv="Content-Security-Policy" content="' + SITE_CSP + '">', 1)
        open(path, 'w').write(html)


def copy_lib(out):
    nm = os.path.join(here, 'node_modules', 'three')
    os.makedirs(os.path.join(out, 'lib', 'addons'), exist_ok=True)
    shutil.copy(os.path.join(nm, 'build', 'three.module.min.js'), os.path.join(out, 'lib'))
    for f in ('geometries/RoundedBoxGeometry.js', 'environments/RoomEnvironment.js'):
        shutil.copy(os.path.join(nm, 'examples', 'jsm', f), os.path.join(out, 'lib', 'addons'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', metavar='DIR', help='write a public copy with a Content-Security-Policy to DIR')
    a = ap.parse_args()
    src = open(os.path.join(here, 'index.src.html')).read()
    assert src.count('__DESIGNS__') == 1 and src.count('<!--CSP-->') == 1
    assert src.count('__SITE__') == 1
    html = src.replace('__DESIGNS__', designs())
    if a.site:
        out = os.path.abspath(a.site)
        os.makedirs(out, exist_ok=True)
        site_page = os.path.join(out, 'site', 'index.html')
        has_site = os.path.exists(site_page)
        if has_site: patch_site(site_page)
        html = html.replace('__SITE__', "'site/index.html'" if has_site else 'null')
        page = html.replace('<!--CSP-->', '<meta http-equiv="Content-Security-Policy" content="' + csp_for(html.replace('<!--CSP-->', '')) + '">')
        open(os.path.join(out, 'index.html'), 'w').write(page)
        copy_lib(out)
        print('built the public copy in', out, '(with the site behind the curtain)' if has_site else '(no site found: ends on the card)')
    else:
        open(os.path.join(here, 'index.html'), 'w').write(html.replace('__SITE__', 'null').replace('<!--CSP-->\n', ''))
        copy_lib(here)
        print('built index.html and lib/')


if __name__ == '__main__':
    main()
