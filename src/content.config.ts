// Content collections: Lab notes and case studies, as Markdown files.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    status: z.enum(['published', 'coming-soon']),
    date: z.coerce.date().optional(),
    voice: z.string().optional(),          // a marker shown above the body, e.g. [DRAFT: Jon to voice]
  }),
});

export const collections = { notes, projects };
