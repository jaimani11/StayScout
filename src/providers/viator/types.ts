import { z } from 'zod';

/**
 * Codified subsets of the Viator Partner API v2.0 shapes we actually
 * read. Full spec is at https://docs.viator.com/partner-api/technical/.
 *
 * We don't replicate the entire schema - Viator returns dozens of
 * fields per product and we only need ~10. Zod `.passthrough()` keeps
 * unknown fields visible during debugging while not failing parsing
 * when Viator adds new optional fields.
 *
 * If a field below is OPTIONAL in the spec, it's optional + nullable
 * here. The mapper handles missing data; the schema only fails if a
 * REQUIRED field is missing or wrong type, which would indicate a
 * breaking API change worth knowing about loudly.
 */

// ============== Request shapes ==============

/**
 * POST /search/freetext body. searchTypes is constrained to PRODUCTS
 * for the experience rails (we don't currently surface destinations
 * or attractions from this endpoint).
 */
export interface ViatorFreetextSearchRequest {
  searchTerm: string;
  currency: string;
  searchTypes: ReadonlyArray<{
    searchType: 'PRODUCTS' | 'DESTINATIONS' | 'ATTRACTIONS';
    pagination?: { start: number; count: number };
  }>;
  productFiltering?: {
    flags?: ReadonlyArray<
      | 'NEW_ON_VIATOR'
      | 'FREE_CANCELLATION'
      | 'SKIP_THE_LINE'
      | 'PRIVATE_TOUR'
      | 'SPECIAL_OFFER'
      | 'LIKELY_TO_SELL_OUT'
    >;
    rating?: { from?: number; to?: number };
    durationInMinutes?: { from?: number; to?: number };
    price?: { from?: number; to?: number };
  };
  productSorting?: {
    sort?: 'DEFAULT' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'RATING' | 'REVIEW_AVG_RATING_REVERSED';
  };
}

// ============== Response shapes ==============

const ViatorImageVariantSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  url: z.string(),
});

const ViatorImageSchema = z
  .object({
    isCover: z.boolean(),
    caption: z.string().nullish(),
    variants: z.array(ViatorImageVariantSchema),
  })
  .passthrough();

const ViatorPricingSchema = z
  .object({
    currency: z.string().min(3).max(3),
    summary: z
      .object({
        fromPrice: z.number().nonnegative().nullish(),
        fromPriceBeforeDiscount: z.number().nonnegative().nullish(),
      })
      .passthrough()
      .nullish(),
  })
  .passthrough();

const ViatorReviewsSchema = z
  .object({
    totalReviews: z.number().int().nonnegative().nullish(),
    combinedAverageRating: z.number().nullish(),
  })
  .passthrough();

const ViatorDurationSchema = z
  .object({
    fixedDurationInMinutes: z.number().int().positive().nullish(),
    variableDurationFromMinutes: z.number().int().positive().nullish(),
    variableDurationToMinutes: z.number().int().positive().nullish(),
    unstructuredDuration: z.string().nullish(),
  })
  .passthrough();

const ViatorDestinationSchema = z
  .object({
    // OpenAPI spec types this as `integer` but the live API returns
    // it as a numeric string (e.g. `"23271"`). Accept either so a
    // future spec correction doesn't break us either way.
    ref: z.union([z.number().int(), z.string()]).nullish(),
    primary: z.boolean().nullish(),
  })
  .passthrough();

export const ViatorProductSummarySchema = z
  .object({
    productCode: z.string(),
    title: z.string().nullish(),
    description: z.string().nullish(),
    productUrl: z.string().nullish(),
    images: z.array(ViatorImageSchema).nullish(),
    pricing: ViatorPricingSchema.nullish(),
    reviews: ViatorReviewsSchema.nullish(),
    duration: ViatorDurationSchema.nullish(),
    destinations: z.array(ViatorDestinationSchema).nullish(),
    tags: z.array(z.number().int()).nullish(),
    flags: z.array(z.string()).nullish(),
    confirmationType: z.string().nullish(),
    itineraryType: z.string().nullish(),
  })
  .passthrough();
export type ViatorProductSummary = z.infer<typeof ViatorProductSummarySchema>;

export const ViatorFreetextSearchResponseSchema = z
  .object({
    products: z
      .object({
        totalCount: z.number().int().nonnegative().nullish(),
        results: z.array(ViatorProductSummarySchema).nullish(),
      })
      .nullish(),
    destinations: z
      .object({
        totalCount: z.number().int().nonnegative().nullish(),
        results: z.array(z.unknown()).nullish(),
      })
      .nullish(),
    attractions: z
      .object({
        totalCount: z.number().int().nonnegative().nullish(),
        results: z.array(z.unknown()).nullish(),
      })
      .nullish(),
  })
  .passthrough();
export type ViatorFreetextSearchResponse = z.infer<typeof ViatorFreetextSearchResponseSchema>;
