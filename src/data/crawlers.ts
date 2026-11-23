// The crawler policy (BRIEF.md §3): search and answer-engine crawlers, and fetches a person asks for, are allowed;
// crawlers that only gather AI training data are disallowed, per crawler. Names and purposes come from each vendor's
// own documentation, checked 2026-11-23 (U9): Anthropic's page read directly; the others through search results that
// quote the official pages (this environment could not reach those hosts). robots.txt and the colophon both read this.

export type Kind = 'search' | 'user' | 'training' | 'mixed';
export interface Source { vendor: string; url: string; read: 'fetched' | 'search'; }
export interface Crawler { token: string; source: keyof typeof SOURCES; kind: Kind; purpose: string; }

export const SOURCES = {
  openai: { vendor: 'OpenAI', url: 'https://developers.openai.com/api/docs/bots', read: 'search' },
  anthropic: { vendor: 'Anthropic', url: 'https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler', read: 'fetched' },
  google: { vendor: 'Google', url: 'https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers', read: 'search' },
  apple: { vendor: 'Apple', url: 'https://support.apple.com/en-us/119829', read: 'search' },
  perplexity: { vendor: 'Perplexity', url: 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers', read: 'search' },
  commoncrawl: { vendor: 'Common Crawl', url: 'https://commoncrawl.org/ccbot', read: 'search' },
  meta: { vendor: 'Meta', url: 'https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers', read: 'search' },
  amazon: { vendor: 'Amazon', url: 'https://developer.amazon.com/amazonbot', read: 'search' },
  bing: { vendor: 'Microsoft', url: 'https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0', read: 'search' },
  duckduckgo: { vendor: 'DuckDuckGo', url: 'https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot', read: 'search' },
  mistral: { vendor: 'Mistral', url: 'https://docs.mistral.ai/robots', read: 'search' },
  cohere: { vendor: 'Cohere', url: 'https://docs.cohere.com/docs/cohere-web-crawlers', read: 'search' },
} satisfies Record<string, Source>;

export const CRAWLERS: Crawler[] = [
  // search and answer engines
  { token: 'Googlebot', source: 'google', kind: 'search', purpose: 'Google Search, Discover, Images, Video and News' },
  { token: 'Bingbot', source: 'bing', kind: 'search', purpose: "Bing's standard crawler" },
  { token: 'Applebot', source: 'apple', kind: 'search', purpose: "Apple's search crawler" },
  { token: 'DuckAssistBot', source: 'duckduckgo', kind: 'search', purpose: 'AI-assisted answers that cite their sources' },
  { token: 'OAI-SearchBot', source: 'openai', kind: 'search', purpose: 'which sites ChatGPT search answers can show' },
  { token: 'Claude-SearchBot', source: 'anthropic', kind: 'search', purpose: 'search result quality for Claude users' },
  { token: 'PerplexityBot', source: 'perplexity', kind: 'search', purpose: 'Perplexity search results; not used for model training' },
  { token: 'Amzn-SearchBot', source: 'amazon', kind: 'search', purpose: 'search features such as Alexa' },
  // a person asked for the page
  { token: 'ChatGPT-User', source: 'openai', kind: 'user', purpose: 'a visit a ChatGPT user asks for; not automatic crawling' },
  { token: 'Claude-User', source: 'anthropic', kind: 'user', purpose: 'a visit a Claude user asks for' },
  { token: 'Perplexity-User', source: 'perplexity', kind: 'user', purpose: 'a fetch a Perplexity user asks for; not training' },
  { token: 'MistralAI-User', source: 'mistral', kind: 'user', purpose: 'a visit a Vibe user asks for; not training' },
  { token: 'Amzn-User', source: 'amazon', kind: 'user', purpose: 'live fetches for user requests; not training' },
  { token: 'Meta-ExternalFetcher', source: 'meta', kind: 'user', purpose: 'links a user asks for' },
  // training only: disallowed
  { token: 'GPTBot', source: 'openai', kind: 'training', purpose: 'training generative AI foundation models' },
  { token: 'ClaudeBot', source: 'anthropic', kind: 'training', purpose: 'content that may contribute to model training' },
  { token: 'Applebot-Extended', source: 'apple', kind: 'training', purpose: "a control: training Apple's generative models (search is unaffected)" },
  { token: 'MistralAI-Training', source: 'mistral', kind: 'training', purpose: 'training' },
  // mixed: training as well as search or answers; allowed, because the brief disallows training-only crawlers
  { token: 'Google-Extended', source: 'google', kind: 'mixed', purpose: 'a control: Gemini training, and grounding in Gemini Apps and Vertex AI (not Search)' },
  { token: 'CCBot', source: 'commoncrawl', kind: 'mixed', purpose: 'the Common Crawl archive, used for training and for search indexes' },
  { token: 'Meta-ExternalAgent', source: 'meta', kind: 'mixed', purpose: 'training foundation models or improving products by indexing content' },
  { token: 'Amazonbot', source: 'amazon', kind: 'mixed', purpose: "improving Amazon's products and services; may train Amazon AI models" },
];

export const CHECKED = '2026-11-23';
export const allowed = (c: Crawler) => c.kind !== 'training';
