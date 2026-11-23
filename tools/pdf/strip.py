"""Report what a PDF carries, and write a copy without its metadata (BRIEF.md U14).

    python3 tools/pdf/strip.py IN.pdf [OUT.pdf] [--show]

Report: the document info and XMP metadata, page count, and every email address, phone number, street address and
web address in the text, by page and kind. Values are redacted unless --show is given (the report is meant to be
pasted into a public repository). With OUT, writes a copy with the info dictionary, the XMP stream and the file ID
removed; the pages and their text are untouched (content changes are Jon's). Needs pypdf (pip install pypdf)."""
import re, sys
from pypdf import PdfReader, PdfWriter

PATTERNS = {
    'email address': re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}'),
    'phone number': re.compile(r'(?:\+\d{1,3}[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b|\+\d{1,3}[\s.-]\d{1,4}(?:[\s.-]\d{2,4}){2,4}\b'),
    'street address': re.compile(r'\b\d{1,5}\s+(?:[A-Z][a-z]+\s){1,3}(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Calle|Carrera|Cra\.?)\b'),
    'web address': re.compile(r'\b(?:https?://|www\.)[^\s)]+|\b[a-z0-9-]+\.(?:com|net|org|io|co|me|dev)/[^\s)]*', re.I),
}


def redact(v, show):
    return v if show else f'[{len(v)} characters, redacted]'


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    show = '--show' in sys.argv
    src = args[0]
    r = PdfReader(src)
    print(f'{src}: {len(r.pages)} page(s), PDF {r.pdf_header}')
    info = r.metadata or {}
    print('document info:', 'none' if not info else '')
    for k, v in info.items():
        print(f'  {k}: {redact(str(v), show)}')
    xmp = r.trailer['/Root'].get('/Metadata')
    print('XMP metadata stream:', 'present' if xmp is not None else 'none')
    print('file ID in trailer:', 'present' if '/ID' in r.trailer else 'none')
    for i, page in enumerate(r.pages, 1):
        text = page.extract_text() or ''
        for kind, rx in PATTERNS.items():
            for m in rx.findall(text):
                print(f'  page {i}: {kind}: {redact(m, show)}')
    if len(args) > 1:
        w = PdfWriter(clone_from=r)
        w.metadata = None
        root = w._root_object
        if '/Metadata' in root:
            del root['/Metadata']
        for page in w.pages:
            if '/Metadata' in page:
                del page['/Metadata']
        w._ID = None
        with open(args[1], 'wb') as f:
            w.write(f)
        check = PdfReader(args[1])
        print(f'wrote {args[1]}: info {"none" if not check.metadata else dict(check.metadata)}, '
              f'XMP {"none" if check.trailer["/Root"].get("/Metadata") is None else "present"}, {len(check.pages)} page(s)')


if __name__ == '__main__':
    main()
