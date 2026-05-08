import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { unsplashPhoto } from '../../../_shared/photo';

const FETCHED_AT = new Date('2026-05-08T00:00:00Z').toISOString();
const PROVIDER = providerId('mock-italy');

const amanVenice: Stay = {
  id: stayId('mock-italy:aman-venice'),
  providerId: PROVIDER,
  name: 'Aman Venice',
  type: 'palazzo',
  location: {
    country: 'IT',
    region: 'Veneto',
    locality: 'Venice',
    neighborhood: 'San Polo, on the Grand Canal',
    coordinates: { lat: 45.438, lng: 12.328 },
  },
  description:
    'A 16th-century palazzo on the Grand Canal restored as 24 suites. Tiepolo frescoes in the dining room; private gardens in a city that has almost none.',
  photos: [
    unsplashPhoto({
      id: '1514890547357-a9ee288728e0',
      alt: 'Venetian palazzo on the Grand Canal',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1850, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'gardens', label: 'Private gardens' },
    { id: 'boat', label: 'Private boat' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.7, reviewCount: 187, source: 'curated' },
  signals: {
    walkability: 90,
    familyFit: 50,
    remoteness: 10,
    noise: 18,
    tags: ['luxury', 'romantic', 'iconic-landmarks', 'walkable', 'cultural'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=aman-venice',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const cipriani: Stay = {
  id: stayId('mock-italy:cipriani'),
  providerId: PROVIDER,
  name: 'Belmond Hotel Cipriani',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Veneto',
    locality: 'Venice',
    neighborhood: 'Giudecca, 5-minute boat from San Marco',
    coordinates: { lat: 45.426, lng: 12.347 },
  },
  description:
    "A garden hotel on Giudecca with the only Olympic-size saltwater pool in Venice. The hotel's launch leaves for San Marco every 15 minutes.",
  photos: [
    unsplashPhoto({
      id: '1567880905822-56f8e06fe630',
      alt: 'Venetian garden hotel with saltwater pool',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1450, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'pool', label: 'Saltwater pool' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'boat-shuttle', label: 'Boat shuttle to San Marco' },
    { id: 'tennis', label: 'Tennis' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.5, reviewCount: 342, source: 'curated' },
  signals: {
    walkability: 50,
    familyFit: 80,
    remoteness: 25,
    noise: 12,
    tags: ['luxury', 'family-friendly', 'romantic', 'beach', 'wellness'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=cipriani',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const grittiPalace: Stay = {
  id: stayId('mock-italy:gritti-palace'),
  providerId: PROVIDER,
  name: 'The Gritti Palace',
  type: 'palazzo',
  location: {
    country: 'IT',
    region: 'Veneto',
    locality: 'Venice',
    neighborhood: 'Campo Santa Maria del Giglio, on the Grand Canal',
    coordinates: { lat: 45.432, lng: 12.331 },
  },
  description:
    'The 1525 residence of Doge Andrea Gritti, restored as 82 rooms. The Gritti Terrace is one of the few places to drink directly on the Grand Canal at sunset.',
  photos: [
    unsplashPhoto({
      id: '1531572753322-ad063cecc140',
      alt: 'Venetian palace terrace on the Grand Canal',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1180, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'spa', label: 'Spa' },
    { id: 'terrace', label: 'Grand Canal terrace' },
    { id: 'concierge', label: 'Concierge' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.3, reviewCount: 487, source: 'curated' },
  signals: {
    walkability: 95,
    familyFit: 55,
    remoteness: 5,
    noise: 32,
    tags: ['luxury', 'walkable', 'iconic-landmarks', 'romantic', 'cultural'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=gritti-palace',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const hotelDanieli: Stay = {
  id: stayId('mock-italy:hotel-danieli'),
  providerId: PROVIDER,
  name: 'Hotel Danieli',
  type: 'palazzo',
  location: {
    country: 'IT',
    region: 'Veneto',
    locality: 'Venice',
    neighborhood: "Riva degli Schiavoni, two minutes from St. Mark's",
    coordinates: { lat: 45.434, lng: 12.343 },
  },
  description:
    "A 14th-century Doge's palace turned hotel since 1822. The roof restaurant looks across the lagoon; the main staircase has hosted everyone from Dickens to Wagner.",
  photos: [
    unsplashPhoto({
      id: '1502602898657-3e91760cbb34',
      alt: 'Venetian doge palace hotel staircase',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 980, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'rooftop-restaurant', label: 'Rooftop restaurant' },
    { id: 'concierge', label: 'Concierge' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'historic', label: 'Historic palazzo' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.1, reviewCount: 612, source: 'curated' },
  signals: {
    walkability: 98,
    familyFit: 60,
    remoteness: 0,
    noise: 38,
    tags: ['luxury', 'walkable', 'iconic-landmarks', 'cultural', 'urban'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=hotel-danieli',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

export const VENICE_STAYS: Stay[] = [amanVenice, cipriani, grittiPalace, hotelDanieli];
