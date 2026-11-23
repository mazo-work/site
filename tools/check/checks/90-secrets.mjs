// Secrets and personal data. Tokens: every tracked or new file plus dist/. Personal data (§3: no email address,
// phone or street address anywhere): page text, twins, feeds and src/ content. Image metadata in dist/ (EXIF, XMP).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { walk, read, dom, isText, ROOT, DIST } from '../lib/dist.mjs';

const TOKENS = [
  ['a private key', /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ['an AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['a GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})/],
  ['a Slack token', /\bxox[abposr]-[A-Za-z0-9-]{10,}/],
  ['a Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['a Stripe live key', /\b[sr]k_live_[0-9A-Za-z]{20,}/],
  ['an Anthropic key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['an OpenAI-style key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ['an npm token', /\bnpm_[A-Za-z0-9]{36}\b/],
  ['a JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['a Cloudflare beacon token (write it as [CF_BEACON_TOKEN])', /token(?:&quot;|["'])?\s*:\s*(?:&quot;|["'])[0-9a-f]{32}/i],
  ['a secret assigned in code', /\b(?:api[_-]?key|secret|passw(?:or)?d|auth[_-]?token|access[_-]?token)\b["']?\s*[:=]\s*["'][A-Za-z0-9_\-/+=]{16,}["']/i],
];
const PERSONAL = [
  ['an email address', /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/],
  ['a phone number', /(?:\+\d{1,3}[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b|\+\d{1,3}[\s.-]\d{1,4}(?:[\s.-]\d{2,4}){2,4}\b/],
  ['a street address', /\b\d{1,5}\s+(?:[A-Z][a-z]+\s){1,3}(?:Street|St\.|Avenue|Ave\.?|Road|Rd\.|Boulevard|Blvd\.?|Lane|Ln\.|Drive|Dr\.|Court|Ct\.)(?=\W)/],
];

function repoFiles() {
  const out = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8' });
  return out.split('\0').filter(Boolean).map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f) && fs.statSync(f).isFile());
}

export default {
  id: 'secrets',
  title: 'Secret scan, personal data, image metadata',
  async run({ pages }) {
    const tokens = [], personal = [], metadata = [];
    const self = path.join(ROOT, 'tools', 'check');
    for (const f of [...repoFiles(), ...walk(DIST)]) {
      if (f.startsWith(self) || !isText(f)) continue;
      const rel = path.relative(ROOT, f);
      read(f).split('\n').forEach((line, i) => {
        for (const [what, re] of TOKENS) if (re.test(line)) tokens.push(`${rel}:${i + 1}: ${what}`);
      });
    }
    const texts = [];
    for (const p of pages) {
      const d = dom(read(p.file));
      d.querySelectorAll('script:not([type="application/ld+json"]), style').forEach((e) => e.remove());
      texts.push([p.url, d.documentElement.outerHTML.replace(/<[^>]+>/g, ' ') + ' ' +
        [...d.querySelectorAll('[href],[content]')].map((e) => (e.getAttribute('href') || '') + ' ' + (e.getAttribute('content') || '')).join(' ')]);
    }
    for (const f of walk(DIST).filter((f) => /\.(md|txt|xml|json|webmanifest)$/.test(f))) texts.push([path.relative(DIST, f), read(f)]);
    for (const f of walk(path.join(ROOT, 'src')).filter((f) => /\.(md|mdx|astro|ts|json|ya?ml)$/.test(f))) texts.push([path.relative(ROOT, f), read(f)]);
    for (const [where, text] of texts) for (const [what, re] of PERSONAL) {
      const m = text.match(re);
      if (m) personal.push(`${where}: ${what} ("${m[0]}")`);
    }
    for (const f of walk(DIST).filter((f) => /\.(jpe?g|webp|png|avif|gif|tiff?)$/i.test(f))) {
      const b = fs.readFileSync(f), rel = path.relative(DIST, f);
      if (b.includes(Buffer.from('Exif\0\0')) || (/\.webp$/i.test(f) && b.includes(Buffer.from('EXIF'))) || (/\.png$/i.test(f) && b.includes(Buffer.from('eXIf')))) metadata.push(`${rel}: EXIF metadata`);
      if (b.includes(Buffer.from('<x:xmpmeta')) || b.includes(Buffer.from('http://ns.adobe.com/xap/'))) metadata.push(`${rel}: XMP metadata`);
    }
    return [
      { id: 'secrets.tokens', ok: tokens.length === 0, problems: tokens },
      { id: 'secrets.personal', ok: personal.length === 0, problems: personal },
      { id: 'secrets.metadata', ok: metadata.length === 0, problems: metadata },
    ];
  },
};
