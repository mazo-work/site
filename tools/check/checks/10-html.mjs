// HTML validation of every built page (html-validate, its recommended rules, tuned below with reasons).
import path from 'node:path';
import { HtmlValidate } from 'html-validate';
import { read, DIST } from '../lib/dist.mjs';

const validator = new HtmlValidate({
  extends: ['html-validate:recommended'],
  rules: {
    // Astro's compressed output is one long line per page; whitespace and line rules say nothing useful about it.
    'no-trailing-whitespace': 'off',
    // Same-origin files need no Subresource Integrity; a cross-origin script would (U13 states its exception).
    'require-sri': ['error', { target: 'crossorigin' }],
  },
});

export default {
  id: 'html',
  title: 'HTML validation (html-validate, recommended rules)',
  async run({ pages }) {
    const problems = [];
    for (const p of pages) {
      const report = await validator.validateString(read(p.file), path.relative(DIST, p.file));
      for (const r of report.results) for (const m of r.messages) {
        problems.push(`${p.url} ${m.line}:${m.column} ${m.ruleId}: ${m.message}`);
      }
    }
    return [{ id: 'html', ok: problems.length === 0, problems }];
  },
};
