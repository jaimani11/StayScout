import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { unsplashPhoto } from '../../../_shared/photo';

const FETCHED_AT = new Date('2026-05-08T00:00:00Z').toISOString();
const PROVIDER = providerId('mock-italy');

const leSirenuse: Stay = {
  id: stayId('mock-italy:le-sirenuse'),
  providerId: PROVIDER,
  name: 'Le Sirenuse',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Campania',
    locality: 'Positano',
    neighborhood: 'Cliffside, three minutes to the beach',
    coordinates: { lat: 40.628, lng: 14.486 },
  },
  description:
    'A converted 18th-century summer house on the Positano cliffs. Fifty-eight rooms, terraces lined with majolica, a pool that overlooks the bay.',
  photos: [
    unsplashPhoto({
      id: '1533104816931-20fa691ff6ca',
      alt: 'Positano cliffside hotel with sea view',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 950, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'pool', label: 'Sea-view pool' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Michelin restaurant' },
    { id: 'bar', label: 'Champagne bar' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.6, reviewCount: 421, source: 'curated' },
  signals: {
    walkability: 75,
    familyFit: 50,
    remoteness: 15,
    noise: 35,
    tags: ['luxury', 'romantic', 'beach', 'iconic-landmarks', 'foodie'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=le-sirenuse',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const ilSanPietro: Stay = {
  id: stayId('mock-italy:il-san-pietro'),
  providerId: PROVIDER,
  name: 'Il San Pietro di Positano',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Campania',
    locality: 'Positano',
    neighborhood: 'Private cove, 5 minutes by boat to town',
    coordinates: { lat: 40.617, lng: 14.494 },
  },
  description:
    'Cut into the cliff above its own beach. Forty-eight rooms, a private elevator down to the sea, dinner at sunset on the terrace.',
  photos: [
    unsplashPhoto({
      id: '1502602898657-3e91760cbb34',
      alt: 'Cliffside hotel with private beach',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1250, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'private-beach', label: 'Private beach' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Michelin restaurant' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'boat', label: 'Boat shuttle to Positano' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.7, reviewCount: 318, source: 'curated' },
  signals: {
    walkability: 30,
    familyFit: 60,
    remoteness: 50,
    noise: 12,
    tags: ['luxury', 'romantic', 'beach', 'remote', 'wellness'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=il-san-pietro',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const hotelSantaCaterina: Stay = {
  id: stayId('mock-italy:hotel-santa-caterina'),
  providerId: PROVIDER,
  name: 'Hotel Santa Caterina',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Campania',
    locality: 'Amalfi',
    neighborhood: 'Cliff above the Amalfi harbor',
    coordinates: { lat: 40.633, lng: 14.595 },
  },
  description:
    'Family-run since 1880. A glass elevator drops to the sea pool at the foot of the cliff; lunch is grilled on the rocks.',
  photos: [
    unsplashPhoto({
      id: '1514890547357-a9ee288728e0',
      alt: 'Amalfi coast hotel with sea pool',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 880, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'sea-pool', label: 'Salt-water pool' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'gardens', label: 'Citrus gardens' },
    { id: 'beach-club', label: 'Beach club' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.4, reviewCount: 387, source: 'curated' },
  signals: {
    walkability: 55,
    familyFit: 75,
    remoteness: 30,
    noise: 22,
    tags: ['luxury', 'family-friendly', 'beach', 'romantic'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=hotel-santa-caterina',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const monasteroSantaRosa: Stay = {
  id: stayId('mock-italy:monastero-santa-rosa'),
  providerId: PROVIDER,
  name: 'Monastero Santa Rosa',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Campania',
    locality: 'Conca dei Marini',
    neighborhood: 'Between Amalfi and Positano',
    coordinates: { lat: 40.612, lng: 14.566 },
  },
  description:
    'A 17th-century monastery turned twenty-room hotel. The cloister garden grows herbs for the kitchen; the infinity pool sits at the edge of the cliff.',
  photos: [
    unsplashPhoto({
      // Replaced - original Unsplash ID 1568901346375-23c9450c58cd
      // was repurposed and now serves a non-travel image (burger).
      id: '1464822759023-fed622ff2c3b',
      alt: 'Cliffside monastery with infinity pool',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1100, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'infinity-pool', label: 'Infinity pool' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'cloister', label: 'Historic cloister' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.5, reviewCount: 215, source: 'curated' },
  signals: {
    walkability: 25,
    familyFit: 40,
    remoteness: 60,
    noise: 8,
    tags: ['luxury', 'romantic', 'wellness', 'slow', 'remote'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=monastero-santa-rosa',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const casaPrivata: Stay = {
  id: stayId('mock-italy:casa-privata'),
  providerId: PROVIDER,
  name: 'Casa Privata',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Campania',
    locality: 'Praiano',
    neighborhood: 'Quiet cliff between Amalfi and Positano',
    coordinates: { lat: 40.611, lng: 14.531 },
  },
  description:
    'Nine rooms in a private home on the cliffs of Praiano. Breakfast on the terrace, an honesty bar, dinners cooked by the family on request.',
  photos: [
    unsplashPhoto({
      id: '1499678329028-101435549a4e',
      alt: 'Praiano coastal home with terrace',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 420, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'pool', label: 'Pool' },
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'sea-access', label: 'Direct sea access' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.3, reviewCount: 168, source: 'curated' },
  signals: {
    walkability: 50,
    familyFit: 65,
    remoteness: 55,
    noise: 14,
    tags: ['mid-range', 'romantic', 'beach', 'avoid-tourist-traps', 'slow'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=casa-privata',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

export const AMALFI_STAYS: Stay[] = [
  leSirenuse,
  ilSanPietro,
  hotelSantaCaterina,
  monasteroSantaRosa,
  casaPrivata,
];
