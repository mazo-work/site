/**
 * Jon's words from the v2 site (React), extracted verbatim from `src/sections/*.jsx`,
 * `src/components/Sidebar.jsx` and `index.html` on the `v2` branch (BRIEF §0.4, U0).
 *
 * Rules (BRIEF §3, Words): reuse these as they stand; do not reword them here. Any new line
 * on the site is a `[JON: …]` slot, not an addition to this file.
 *
 * Not carried over, on purpose (see STATE.md's log and the handoff):
 * - Hero.jsx's tagline: it opens with a phrase on BRIEF §4's banned list. Home has a
 *   `[JON: …]` slot in its place.
 * - Hero.jsx's "Let’s Connect" button and Contact.jsx's form: the form posted to a third party
 *   (BRIEF §5.3: no forms that submit anywhere; §3: no email address on the site).
 */

export const name = 'Jonathan Mazo';

/** index.html <title> */
export const documentTitle = 'Jonathan Mazo';

/** Hero.jsx */
export const hero = {
  heading: "Hi, I'm Jonathan Mazo",
};

/** About.jsx */
export const about = {
  heading: 'About Me',
  paragraphs: [
    'With a foundation in data analytics and over 5 years of experience in customer success, technical consulting, and programmatic advertising, I specialize in bridging the gap between complex technology and business outcomes. I am fully bilingual in English and Spanish, which allows me to support and collaborate effectively with diverse client and internal teams.',
    'I’ve led cross-functional initiatives, managed high-value client portfolios, and acted as a strategic advisor across a range of verticals. Whether solving implementation challenges, optimizing campaigns, or improving internal workflows — I bring structure, clarity, and focus to every stage of execution.',
  ],
};

export interface Skill {
  title: string;
  description: string;
  tags: string[];
}

/** Skills.jsx */
export const skills: { heading: string; items: Skill[] } = {
  heading: 'Skills',
  items: [
    {
      title: 'Strategic Account Management',
      description:
        'Developed and maintained strong relationships with high-value clients by providing proactive support, campaign performance reviews, and optimization strategies aligned with business goals.',
      tags: ['Client Success', 'Retention', 'Strategic Partnerships'],
    },
    {
      title: 'Cross-Functional Collaboration',
      description:
        'Worked closely with product, engineering, and sales teams to deliver solutions tailored to client objectives, including new feature rollout support and feedback loops into product development.',
      tags: ['Internal Alignment', 'CS-to-Product', 'Agile Teams'],
    },
    {
      title: 'Platform & Data Enablement',
      description:
        'Educated clients on advanced platform features, implemented custom reporting dashboards, and translated data insights into actionable recommendations to drive measurable results.',
      tags: ['AdTech Tools', 'Data Fluency', 'Client Enablement'],
    },
    {
      title: 'Onboarding & Adoption Programs',
      description:
        'Designed onboarding journeys that accelerated time-to-value and improved adoption rates by standardizing best practices, QBRs, and support materials across verticals.',
      tags: ['Onboarding', 'Playbooks', 'Training'],
    },
    {
      title: 'Escalation & Issue Resolution',
      description:
        'Managed complex client issues with urgency and transparency, aligning cross-functional resources and clear communication to ensure retention and satisfaction.',
      tags: ['Client Advocacy', 'Resolution Management', 'CX'],
    },
  ],
};

/** Resume.jsx */
export const resume = {
  heading: 'Resume',
  summary:
    'Over 5 years of experience driving results in customer success, technical consulting, and digital strategy. Proven track record managing campaigns, solving complex implementation challenges, and leading cross-functional collaboration.',
  linkText: 'View Full Resume (PDF)',
  file: 'Profile.pdf',
};

/** Sidebar.jsx */
export const sidebar = {
  headshotAlt: 'A parrot, standing in for Jon', // Jon's review, 2026-11-23: v2's alt text named him, under a parrot
  strengths: {
    heading: 'Key Strengths',
    items: [
      'Customer Success Management',
      'Strategic Growth & Retention',
      'Cross-Functional Collaboration',
      'Data-Driven Strategy',
      'AdTech & Programmatic Expertise',
      'Bilingual: English & Spanish',
    ],
  },
  technologies: {
    heading: 'Technologies',
    items: [
      'SQL / Excel/ JavaScript',
      'Microsoft 365 / Google Workspace',
      'Slack / Zendesk / AI Tools (ChatGPT, Gemini, NotebookLM)',
    ],
  },
};
