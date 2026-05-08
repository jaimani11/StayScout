import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { unsplashPhoto } from '../../../_shared/photo';

const FETCHED_AT = new Date('2026-05-08T00:00:00Z').toISOString();
const PROVIDER = providerId('mock-italy');

const villaDEste: Stay = {
  id: stayId('mock-italy:villa-deste'),
  providerId: PROVIDER,
  name: "Villa d'Este",
  type: 'palazzo',
  location: {
    country: 'IT',
    region: 'Lombardy',
    locality: 'Cernobbio',
    neighborhood: 'On the lakeshore',
    coordinates: { lat: 45.838, lng: 9.085 },
  },
  description:
    'A Renaissance villa built in 1568 with 25 acres of gardens running down to the lake. The floating pool sits in the lake itself; the breakfast hall fits a chamber orchestra.',
  photos: [
    unsplashPhoto({
      id: '1568901346375-23c9450c58cd',
      alt: 'Lake Como villa with terraced gardens',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1100, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'floating-pool', label: 'Floating pool' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurants', label: 'Three restaurants' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'private-park', label: '25-acre private park' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.4, reviewCount: 542, source: 'curated' },
  signals: {
    walkability: 60,
    familyFit: 80,
    remoteness: 25,
    noise: 12,
    tags: ['luxury', 'family-friendly', 'iconic-landmarks', 'wellness', 'romantic'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=villa-deste',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const grandHotelTremezzo: Stay = {
  id: stayId('mock-italy:grand-hotel-tremezzo'),
  providerId: PROVIDER,
  name: 'Grand Hotel Tremezzo',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Lombardy',
    locality: 'Tremezzo',
    neighborhood: 'Across the lake from Bellagio',
    coordinates: { lat: 45.987, lng: 9.234 },
  },
  description:
    'A belle-epoque hotel from 1910 with three pools — one floating in the lake, one in the garden, one indoors. The view of Bellagio is the famous one.',
  photos: [
    unsplashPhoto({
      id: '1546412414-e1885259563a',
      alt: 'Lake Como belle epoque hotel facade',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 980, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'pools', label: 'Three pools' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'beach', label: 'Private beach' },
    { id: 'tennis', label: 'Tennis' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.5, reviewCount: 478, source: 'curated' },
  signals: {
    walkability: 65,
    familyFit: 88,
    remoteness: 20,
    noise: 18,
    tags: ['luxury', 'family-friendly', 'beach', 'iconic-landmarks', 'wellness'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=grand-hotel-tremezzo',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const mandarinOrientalLakeComo: Stay = {
  id: stayId('mock-italy:mandarin-oriental-lake-como'),
  providerId: PROVIDER,
  name: 'Mandarin Oriental, Lago di Como',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Lombardy',
    locality: 'Blevio',
    neighborhood: 'East shore, 10 minutes from Como town',
    coordinates: { lat: 45.829, lng: 9.106 },
  },
  description:
    'A nine-acre estate of villas and gardens. Boat-only access to one of the wings; the spa runs across two floors and three pools.',
  photos: [
    unsplashPhoto({
      id: '1502602898657-3e91760cbb34',
      alt: 'Lakeside villa estate at sunrise',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1280, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'spa', label: 'Spa' },
    { id: 'pools', label: 'Three pools' },
    { id: 'restaurants', label: 'Two restaurants' },
    { id: 'private-boat', label: 'Private boat' },
  ],
  capacity: { sleeps: 4, bedrooms: 2, bathrooms: 2 },
  rating: { score: 9.6, reviewCount: 234, source: 'curated' },
  signals: {
    walkability: 30,
    familyFit: 70,
    remoteness: 60,
    noise: 8,
    tags: ['luxury', 'wellness', 'romantic', 'remote', 'slow'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=mandarin-oriental-lake-como',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const passalacqua: Stay = {
  id: stayId('mock-italy:passalacqua'),
  providerId: PROVIDER,
  name: 'Passalacqua',
  type: 'palazzo',
  location: {
    country: 'IT',
    region: 'Lombardy',
    locality: 'Moltrasio',
    neighborhood: 'A small village 10 minutes north of Como',
    coordinates: { lat: 45.852, lng: 9.082 },
  },
  description:
    'A 18th-century villa converted into 24 suites in 2022. Frescoed ceilings, a music room with a Steinway, gardens designed by the family for over two centuries.',
  photos: [
    unsplashPhoto({
      id: '1499678329028-101435549a4e',
      alt: 'Frescoed Italian villa with terraced gardens',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 1750, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'spa', label: 'Spa' },
    { id: 'pool', label: 'Pool' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'music-room', label: 'Music room' },
    { id: 'private-boat', label: 'Private boat' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.8, reviewCount: 96, source: 'curated' },
  signals: {
    walkability: 35,
    familyFit: 50,
    remoteness: 40,
    noise: 6,
    tags: ['luxury', 'romantic', 'slow', 'wellness', 'cultural'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=passalacqua',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

export const LAKE_COMO_STAYS: Stay[] = [
  villaDEste,
  grandHotelTremezzo,
  mandarinOrientalLakeComo,
  passalacqua,
];
