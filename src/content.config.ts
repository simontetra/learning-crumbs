import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each exhibit is one Markdown file in src/content/exhibits/.
// The front matter is the museum label; the body is the text board.
const exhibits = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/exhibits' }),
  schema: z.object({
    title: z.string(),
    gallery: z.string(),            // gallery slug, see src/data/galleries.json
    order: z.number(),              // position in the gallery walk
    accession: z.string(),          // e.g. LB-NAM-001
    question: z.string(),           // the child's question that opens the trail
    summary: z.string(),            // one line, used for cards and search engines
    when: z.string(),               // the label's date line
    where: z.string(),              // the label's place line
    plate: z.string(),              // glyph shown until a real image is added
    plateNote: z.string(),          // caption under the plate
    image: z
      .object({ src: z.string(), alt: z.string(), credit: z.string(), licence: z.string(), url: z.string(), licenceUrl: z.string().optional(), fit: z.enum(["cover", "contain"]).optional() })
      .optional(),
    fromHome: z
      .object({ src: z.string(), alt: z.string(), caption: z.string() })
      .optional(),         // now and then: a photo of the real thing, from our own house
    imageToFind: z.string().optional(), // note for the curator: where a free image might be found
    pebbles: z.array(z.string()),   // slugs of related exhibits
    tags: z.array(z.string()),
    hidden: z.boolean().optional(),  // true = kept in the repo but not published
    sources: z.array(z.object({ title: z.string(), url: z.string() })),
  }),
});

export const collections = { exhibits };
