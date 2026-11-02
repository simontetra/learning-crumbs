import galleries from '../data/galleries.json';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Exhibit = CollectionEntry<'exhibits'>;
export type Gallery = (typeof galleries)[number];

export const SITE_NAME = 'Learning Crumbs';
export const TAGLINE = 'True stories, near misses and curious beginnings, passed from parent to child.';

export { galleries };

export const exhibitUrl = (id: string) => `/exhibits/${id}/`;
export const galleryUrl = (slug: string) => `/galleries/${slug}/`;
export const tagSlug = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const tagUrl = (tag: string) => `/topics/${tagSlug(tag)}/`;

export async function allExhibits() {
  const list = await getCollection('exhibits', (e) => !e.data.hidden);
  return list.sort((a, b) => a.data.gallery.localeCompare(b.data.gallery) || a.data.order - b.data.order);
}

export function galleryOf(slug: string) {
  return galleries.find((g) => g.slug === slug)!;
}
