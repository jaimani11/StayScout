import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { unsplashPhoto } from '../../../_shared/photo';

const FETCHED_AT = new Date('2026-05-08T00:00:00Z').toISOString();
const PROVIDER = providerId('mock-italy');

const hotelPortoRoca: Stay = {
  id: stayId('mock-italy:hotel-porto-roca'),
  providerId: PROVIDER,
  name: 'Hotel Porto Roca',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Liguria',
    locality: 'Monterosso al Mare',
    neighborhood: 'Cliffside, ten minutes from the train',
    coordinates: { lat: 44.146, lng: 9.659 },
  },
  description:
    'The only proper hotel in Monterosso, perched on the rocks above the bay. The cliffside terrace is reason enough; the breakfast comes with a view.',
  photos: [
    unsplashPhoto({
      id: '1533104816931-20fa691ff6ca',
      alt: 'Cinque Terre cliffside hotel above the sea',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 320, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'sea-view', label: 'Sea-view rooms' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'beach-access', label: 'Beach access' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 8.9, reviewCount: 412, source: 'curated' },
  signals: {
    walkability: 78,
    familyFit: 70,
    remoteness: 35,
    noise: 22,
    tags: ['mid-range', 'beach', 'walkable', 'romantic', 'iconic-landmarks'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=hotel-porto-roca',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const laMala: Stay = {
  id: stayId('mock-italy:la-mala'),
  providerId: PROVIDER,
  name: 'La Malà',
  type: 'guesthouse',
  location: {
    country: 'IT',
    region: 'Liguria',
    locality: 'Vernazza',
    neighborhood: 'Above the harbor',
    coordinates: { lat: 44.135, lng: 9.685 },
  },
  description:
    'Four rooms in a 17th-century building above the harbor of Vernazza. The terrace is shared; sunset coffee comes free with the view.',
  photos: [
    unsplashPhoto({
      id: '1502602898657-3e91760cbb34',
      alt: 'Vernazza harbor and pastel buildings',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 175, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'terrace', label: 'Shared terrace' },
    { id: 'wifi', label: 'Wi-Fi' },
  ],
  capacity: { sleeps: 2, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.4, reviewCount: 612, source: 'curated' },
  signals: {
    walkability: 96,
    familyFit: 35,
    remoteness: 25,
    noise: 32,
    tags: ['mid-range', 'walkable', 'romantic', 'beach', 'avoid-tourist-traps'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=la-mala',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const aCaDuGigante: Stay = {
  id: stayId('mock-italy:a-ca-du-gigante'),
  providerId: PROVIDER,
  name: 'A Cà du Gigante',
  type: 'guesthouse',
  location: {
    country: 'IT',
    region: 'Liguria',
    locality: 'Monterosso al Mare',
    neighborhood: '50 meters from the beach',
    coordinates: { lat: 44.146, lng: 9.654 },
  },
  description:
    'Six rooms in a small house on the edge of Monterosso’s old town. Quiet at night, the beach a short walk away.',
  photos: [
    unsplashPhoto({
      id: '1490642914619-7955a3fd483c',
      alt: 'Cinque Terre village house',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 220, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'beach-walk', label: '50m to the beach' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.2, reviewCount: 348, source: 'curated' },
  signals: {
    walkability: 92,
    familyFit: 60,
    remoteness: 20,
    noise: 18,
    tags: ['mid-range', 'walkable', 'beach', 'family-friendly'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=a-ca-du-gigante',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

export const CINQUE_TERRE_STAYS: Stay[] = [hotelPortoRoca, laMala, aCaDuGigante];
