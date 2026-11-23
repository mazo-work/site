# Resume PDF (U14)

`public/Profile.pdf`, the resume v2 linked and For recruiters links. Checked on 2026-11-23 with `tools/pdf/strip.py`
(pypdf 7.1.1) and `pdftotext`. Values are deliberately not reproduced here: this repository is public.

## What the original carried

**Document metadata (identifying, now removed):**

- Document info: an author field and a creator field, both naming software (a document library and a word
  processor), not a person; a creation and a modification timestamp (29 September 2025), both with a UTC−7 offset,
  which tells the time zone the file was made in.
- An XMP metadata stream with the same creator, tool and dates, plus a unique document ID and instance ID, which can
  link copies of the file to each other and to its source document.
- A file ID in the PDF trailer.
- One embedded image (299 × 299 JPEG): no EXIF and no XMP inside it.

**Page content (one page; Jon's to change, not touched):**

| Kind | Found | Against the brief |
| --- | --- | --- |
| Email address | 1, in the contact block | **Conflicts**: §3 says no email address anywhere. Must change before launch. |
| Phone number | none | fine |
| Street address | none | fine |
| Location | a metropolitan region, twice | fine: a region, not a city |
| Web address | 1, a LinkedIn profile | fine; it could also serve as the site's `[JON: contact]` |

## What ships

`public/Profile.pdf` is now the stripped copy: no document info, no XMP stream, no file ID. The pages are unchanged:
the extracted text is byte-for-byte identical, and both files render to identical pixels at 72 dpi (`pdftoppm`,
compared value by value). The file's header now says PDF 1.3, pypdf's writer default; it opened and rendered with
poppler. The original is in git history (and was already public on `v2`).

## For Jon

1. Remove the email address from the resume, or replace the PDF with a LinkedIn link (an idea already in the brief's
   backlog). Until then the site links a file that breaks its own rule.
2. After any edit, strip the new file again:

   ```bash
   pip install pypdf
   python3 tools/pdf/strip.py path/to/new-resume.pdf public/Profile.pdf
   ```

   It prints what it finds (values redacted; add `--show` to see them) and writes the stripped copy.
