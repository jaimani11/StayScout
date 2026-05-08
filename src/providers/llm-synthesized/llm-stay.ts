import { z } from 'zod';
import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { VibeTagSchema } from '@core/trip-intent';
import { unsplashPhoto } from '../_shared/photo';
import { resolvePhotoId } from './photo-resolver';

// The slim shape we ask Claude to emit.
export const PhotoCategorySchema = z.enum([
  'cityscape',
  'beach',
  'mountains',
  'countryside',
  'forest',
  'lakeside',
  'island',
  'historic-architecture',
  'desert',
]);
export type PhotoCategory = z.infer<typeof PhotoCategorySchema>;

export const LLMStaySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(80),
  type: z.enum([
    'hotel',
    'villa',
    'apartment',
    'farmhouse',
    'agriturismo',
    'palazzo',
    'guesthouse',
  ]),
  location: z.object({
    country: z.string().length(2),
    region: z.string().optional(),
    locality: z.string().optional(),
    neighborhood: z.string().optional(),
  }),
  description: z.string().min(40).max(280),
  pricePerNight: z.number().int().min(40).max(3000),
  currency: z.string().length(3),
  amenities: z.array(z.string().min(2)).min(1).max(8),
  capacity: z.object({
    sleeps: z.number().int().min(1).max(16),
    bedrooms: z.number().int().min(1).max(8).optional(),
    bathrooms: z.number().int().min(1).max(8).optional(),
  }),
  vibe: z.array(VibeTagSchema).min(1).max(6),
  walkability: z.number().int().min(0).max(100).optional(),
  familyFit: z.number().int().min(0).max(100).optional(),
  remoteness: z.number().int().min(0).max(100).optional(),
  noise: z.number().int().min(0).max(100).optional(),
  photoCategory: PhotoCategorySchema,
});
export type LLMStay = z.infer<typeof LLMStaySchema>;

export const LLMStayBatchSchema = z.object({
  stays: z.array(LLMStaySchema).min(2).max(6),
});

/**
 * Map a slim LLMStay to a fully canonical Stay. We mint the namespaced id,
 * attach a category-matched Unsplash photo, set a placeholder booking
 * redirect, and timestamp the record.
 */
export function mapLLMStayToStay(llm: LLMStay): Stay {
  const ns = `llm-synthesized:${llm.slug}`;
  const photoId = resolvePhotoId(llm.photoCategory);
  return {
    id: stayId(ns),
    providerId: providerId('llm-synthesized'),
    name: llm.name,
    type: llm.type,
    location: llm.location,
    description: llm.description,
    photos: [
      unsplashPhoto({
        id: photoId,
        alt: `${llm.name} — ${llm.photoCategory}`,
        credit: 'Unsplash',
      }),
    ],
    pricing: {
      pricePerNight: { amount: llm.pricePerNight, currency: llm.currency },
      cancellation: 'free',
    },
    amenities: llm.amenities.map((label, i) => ({
      id: `${llm.slug}-amenity-${i}`,
      label,
    })),
    capacity: {
      sleeps: llm.capacity.sleeps,
      ...(llm.capacity.bedrooms !== undefined ? { bedrooms: llm.capacity.bedrooms } : {}),
      ...(llm.capacity.bathrooms !== undefined ? { bathrooms: llm.capacity.bathrooms } : {}),
    },
    signals: {
      ...(llm.walkability !== undefined ? { walkability: llm.walkability } : {}),
      ...(llm.familyFit !== undefined ? { familyFit: llm.familyFit } : {}),
      ...(llm.remoteness !== undefined ? { remoteness: llm.remoteness } : {}),
      ...(llm.noise !== undefined ? { noise: llm.noise } : {}),
      tags: llm.vibe,
    },
    bookingLink: {
      url: `https://example.com/redirect?provider=llm-synthesized&id=${llm.slug}`,
      type: 'redirect',
    },
    fetchedAt: new Date().toISOString(),
  };
}
