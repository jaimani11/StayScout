import type { PhotoCategory } from './llm-stay';

// Hand-picked Unsplash photo IDs per category. One per category for Slice A;
// Slice B's UnsplashSearchClient picks per-stay via keywords.
const PHOTO_BY_CATEGORY: Record<PhotoCategory, string> = {
  cityscape: '1502602898657-3e91760cbb34',
  beach: '1533104816931-20fa691ff6ca',
  mountains: '1568901346375-23c9450c58cd',
  countryside: '1490642914619-7955a3fd483c',
  forest: '1473496169904-658ba7c44d8a',
  lakeside: '1546412414-e1885259563a',
  island: '1499678329028-101435549a4e',
  'historic-architecture': '1531572753322-ad063cecc140',
  desert: '1567880905822-56f8e06fe630',
};

export function resolvePhotoId(category: PhotoCategory): string {
  return PHOTO_BY_CATEGORY[category];
}
