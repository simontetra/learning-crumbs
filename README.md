# Learning Crumbs

True stories, near misses and curious beginnings, passed from parent to child.
Built with [Astro](https://astro.build) as a fast static site.

## Adding an exhibit

1. Copy any file in `src/content/exhibits/` and rename it (the file name becomes the web address, e.g. `quill-pen.md` → `/exhibits/quill-pen/`).
2. Fill in the label at the top (title, gallery, question, dates, sources, related "pebbles").
3. Write the text board underneath in plain Markdown.
4. To add an image, put it in `public/images/` and add an `image:` block with its alt text, credit, licence and source link. Only use public-domain or openly licensed images.

New galleries go in `src/data/galleries.json`.

## Running it

```
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # builds the site into dist/
```

## Hosting on Render

Create a Static Site on Render from this repository:

- Build command: `npm install && npm run build`
- Publish directory: `dist`

Then add the custom domain in Render and point the domain's DNS at it. Update `SITE` in `astro.config.mjs` to the final address so the sitemap and canonical links are correct.
