import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { unsplashPhoto } from '../../../_shared/photo';

const FETCHED_AT = new Date('2026-05-08T00:00:00Z').toISOString();
const PROVIDER = providerId('mock-italy');

const villaDiGeggiano: Stay = {
  id: stayId('mock-italy:villa-di-geggiano'),
  providerId: PROVIDER,
  name: 'Villa di Geggiano',
  type: 'villa',
  location: {
    country: 'IT',
    region: 'Tuscany',
    locality: 'Castelnuovo Berardenga',
    neighborhood: '8 minutes from Siena',
    coordinates: { lat: 43.355, lng: 11.469 },
  },
  description:
    'A working vineyard since the 1100s, restored as a small family residence. Six rooms in the main house; the gardens are protected by UNESCO.',
  photos: [
    unsplashPhoto({
      id: '1499678329028-101435549a4e',
      alt: 'Tuscan villa with garden and vineyards',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 420, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'pool', label: 'Pool' },
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'gardens', label: 'Historic gardens' },
    { id: 'wine-tasting', label: 'On-site wine tasting' },
  ],
  capacity: { sleeps: 12, bedrooms: 6, bathrooms: 6 },
  rating: { score: 9.4, reviewCount: 127, source: 'curated' },
  signals: {
    walkability: 35,
    familyFit: 88,
    remoteness: 65,
    noise: 18,
    tags: ['luxury', 'family-friendly', 'slow', 'avoid-tourist-traps', 'cultural'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=villa-di-geggiano',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const palazzoRavizza: Stay = {
  id: stayId('mock-italy:palazzo-ravizza'),
  providerId: PROVIDER,
  name: 'Palazzo Ravizza',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Tuscany',
    locality: 'Siena',
    neighborhood: 'Inside the city walls, near Piazza del Campo',
    coordinates: { lat: 43.317, lng: 11.327 },
  },
  description:
    'A 17th-century palazzo turned hotel inside the Siena walls. Eighteen rooms, a quiet garden out back, and breakfast served on linen.',
  photos: [
    unsplashPhoto({
      id: '1523906834658-6e24ef2386f9',
      alt: 'Historic stone hotel courtyard in Siena',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 310, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'garden', label: 'Garden' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'walking-distance', label: 'Walking distance to Duomo' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.1, reviewCount: 412, source: 'curated' },
  signals: {
    walkability: 95,
    familyFit: 65,
    remoteness: 5,
    noise: 35,
    tags: ['mid-range', 'walkable', 'cultural', 'iconic-landmarks', 'romantic'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=palazzo-ravizza',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const borgoSantAmbrogio: Stay = {
  id: stayId('mock-italy:borgo-sant-ambrogio'),
  providerId: PROVIDER,
  name: "Borgo Sant'Ambrogio",
  type: 'agriturismo',
  location: {
    country: 'IT',
    region: 'Tuscany',
    locality: 'Pienza',
    neighborhood: "Val d'Orcia hills",
    coordinates: { lat: 43.078, lng: 11.679 },
  },
  description:
    'A working farm with rooms above the cellars and a long table for shared dinners. Kids welcome; horses on site.',
  photos: [
    unsplashPhoto({
      id: '1473496169904-658ba7c44d8a',
      alt: 'Tuscan farmhouse at golden hour',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 480, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'pool', label: 'Pool' },
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'farm-dinners', label: 'Farm-table dinners' },
    { id: 'horses', label: 'Stables on site' },
  ],
  capacity: { sleeps: 14, bedrooms: 7, bathrooms: 7 },
  rating: { score: 9.5, reviewCount: 89, source: 'curated' },
  signals: {
    walkability: 25,
    familyFit: 95,
    remoteness: 75,
    noise: 12,
    tags: ['mid-range', 'family-friendly', 'slow', 'nature', 'foodie', 'avoid-tourist-traps'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=borgo-sant-ambrogio',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const laBanditaTownhouse: Stay = {
  id: stayId('mock-italy:la-bandita-townhouse'),
  providerId: PROVIDER,
  name: 'La Bandita Townhouse',
  type: 'guesthouse',
  location: {
    country: 'IT',
    region: 'Tuscany',
    locality: 'Pienza',
    neighborhood: 'On the main piazza',
    coordinates: { lat: 43.077, lng: 11.679 },
  },
  description:
    'Twelve rooms in a renovated convent on the main piazza. Coffee under the loggia, dinner at the small bar downstairs.',
  photos: [
    unsplashPhoto({
      id: '1490642914619-7955a3fd483c',
      alt: 'Renovated stone building in a Tuscan village',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 370, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'restaurant', label: 'In-house restaurant' },
    { id: 'breakfast', label: 'Breakfast included' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'walking-distance', label: 'Steps from the piazza' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.2, reviewCount: 256, source: 'curated' },
  signals: {
    walkability: 98,
    familyFit: 55,
    remoteness: 15,
    noise: 28,
    tags: ['mid-range', 'walkable', 'cultural', 'romantic', 'foodie'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=la-bandita-townhouse',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const castelloDiReschio: Stay = {
  id: stayId('mock-italy:castello-di-reschio'),
  providerId: PROVIDER,
  name: 'Castello di Reschio',
  type: 'palazzo',
  location: {
    country: 'IT',
    region: 'Tuscany',
    locality: 'Lisciano Niccone',
    neighborhood: 'Tuscan-Umbrian border',
    coordinates: { lat: 43.236, lng: 12.085 },
  },
  description:
    'A thousand-year-old castle on its own 3,700-acre estate. Thirty-six rooms, a herb-garden spa, riding stables, and a single long lunch table outdoors.',
  photos: [
    unsplashPhoto({
      id: '1568901346375-23c9450c58cd',
      alt: 'Stone castle estate with cypress trees',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1450, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'pool', label: 'Pool' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'riding', label: 'Riding stables' },
    { id: 'estate', label: '3,700-acre estate' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.7, reviewCount: 64, source: 'curated' },
  signals: {
    walkability: 10,
    familyFit: 70,
    remoteness: 90,
    noise: 5,
    tags: ['luxury', 'remote', 'romantic', 'slow', 'wellness', 'nature'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=castello-di-reschio',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

export const TUSCANY_STAYS: Stay[] = [
  villaDiGeggiano,
  palazzoRavizza,
  borgoSantAmbrogio,
  laBanditaTownhouse,
  castelloDiReschio,
];
