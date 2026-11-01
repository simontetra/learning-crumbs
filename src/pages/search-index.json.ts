import { allExhibits, galleryOf } from '../lib/site';

// A small index the search page loads. Fine for hundreds of exhibits;
// swap for Pagefind if the site grows into the thousands.
export async function GET() {
  const all = await allExhibits();
  const data = all.map((e) => ({
    id: e.id,
    title: e.data.title,
    summary: e.data.summary,
    question: e.data.question,
    gallery: galleryOf(e.data.gallery).title,
    room: e.data.gallery,
    plate: e.data.plate,
    accession: e.data.accession,
    tags: e.data.tags,
    text: (e.body ?? '').replace(/[#>*_\-\[\]()]/g, ' ').replace(/\s+/g, ' '),
  }));
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
