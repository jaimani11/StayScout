import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { unsplashPhoto } from '../../../_shared/photo';

const FETCHED_AT = new Date('2026-05-08T00:00:00Z').toISOString();
const PROVIDER = providerId('mock-italy');

const borgoDeiConti: Stay = {
  id: stayId('mock-italy:borgo-dei-conti'),
  providerId: PROVIDER,
  name: 'Borgo dei Conti Resort',
  type: 'palazzo',
  location: {
    country: 'IT',
    region: 'Umbria',
    locality: 'Monte Petriolo',
    neighborhood: '20 minutes from Perugia',
    coordinates: { lat: 43.022, lng: 12.297 },
  },
  description:
    'A 17th-century country estate set among olive groves. Forty rooms across three restored buildings, with a small chapel and walking trails.',
  photos: [
    unsplashPhoto({
      id: '1546412414-e1885259563a',
      alt: 'Umbrian country estate at dusk',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 360, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'pool', label: 'Pool' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'tennis', label: 'Tennis court' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.0, reviewCount: 198, source: 'curated' },
  signals: {
    walkability: 20,
    familyFit: 80,
    remoteness: 70,
    noise: 15,
    tags: ['luxury', 'family-friendly', 'slow', 'nature', 'wellness'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=borgo-dei-conti',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const hotelVannucci: Stay = {
  id: stayId('mock-italy:hotel-vannucci'),
  providerId: PROVIDER,
  name: 'Hotel Vannucci',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Umbria',
    locality: 'Città della Pieve',
    neighborhood: 'Centro storico',
    coordinates: { lat: 42.957, lng: 12.001 },
  },
  description:
    'A small palazzo hotel inside the medieval center. Stone arches, a vaulted dining room, and a roof terrace looking out at the Val di Chiana.',
  photos: [
    unsplashPhoto({
      id: '1502602898657-3e91760cbb34',
      alt: 'Italian medieval town square at sunset',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 195, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'roof-terrace', label: 'Roof terrace' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 8.9, reviewCount: 312, source: 'curated' },
  signals: {
    walkability: 95,
    familyFit: 60,
    remoteness: 10,
    noise: 30,
    tags: ['mid-range', 'walkable', 'cultural', 'foodie'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=hotel-vannucci',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const locandaDelCapitano: Stay = {
  id: stayId('mock-italy:locanda-del-capitano'),
  providerId: PROVIDER,
  name: 'Locanda del Capitano',
  type: 'guesthouse',
  location: {
    country: 'IT',
    region: 'Umbria',
    locality: 'Montone',
    neighborhood: 'Inside the village walls',
    coordinates: { lat: 43.358, lng: 12.327 },
  },
  description:
    'Ten rooms above one of Umbria’s quieter trattorias. Roberto cooks, the family runs the front of house, and there is no faster way to learn the village.',
  photos: [
    unsplashPhoto({
      id: '1531572753322-ad063cecc140',
      alt: 'Stone village street in Umbria',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 175, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'restaurant', label: 'Trattoria downstairs' },
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'wifi', label: 'Wi-Fi' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.3, reviewCount: 142, source: 'curated' },
  signals: {
    walkability: 92,
    familyFit: 75,
    remoteness: 30,
    noise: 22,
    tags: ['mid-range', 'walkable', 'foodie', 'slow', 'avoid-tourist-traps'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=locanda-del-capitano',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const leTreVaselle: Stay = {
  id: stayId('mock-italy:le-tre-vaselle'),
  providerId: PROVIDER,
  name: 'Le Tre Vaselle',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Umbria',
    locality: 'Torgiano',
    neighborhood: 'Wine country, 15 minutes from Perugia',
    coordinates: { lat: 43.018, lng: 12.434 },
  },
  description:
    'A wine-estate hotel in a town built around its cellars. Cooking school in the kitchen, vintages from 1962 in the cantina, no rush at any meal.',
  photos: [
    unsplashPhoto({
      id: '1567880905822-56f8e06fe630',
      alt: 'Umbrian wine cellar with stone walls',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 240, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'pool', label: 'Pool' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'cooking-school', label: 'Cooking school' },
    { id: 'wine-cellar', label: 'Historic wine cellar' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.1, reviewCount: 274, source: 'curated' },
  signals: {
    walkability: 70,
    familyFit: 70,
    remoteness: 40,
    noise: 18,
    tags: ['mid-range', 'foodie', 'walkable', 'cultural', 'slow'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=le-tre-vaselle',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

export const UMBRIA_STAYS: Stay[] = [
  borgoDeiConti,
  hotelVannucci,
  locandaDelCapitano,
  leTreVaselle,
];
