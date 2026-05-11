import type { Stay } from '@core/stay';
import { providerId, stayId } from '@core/ids';
import { unsplashPhoto } from '../../../_shared/photo';

const FETCHED_AT = new Date('2026-05-08T00:00:00Z').toISOString();
const PROVIDER = providerId('mock-italy');

const jkPlaceRoma: Stay = {
  id: stayId('mock-italy:jk-place-roma'),
  providerId: PROVIDER,
  name: 'J.K. Place Roma',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Lazio',
    locality: 'Rome',
    neighborhood: 'Piazza del Popolo',
    coordinates: { lat: 41.911, lng: 12.476 },
  },
  description:
    'Thirty rooms behind a discreet door near Piazza del Popolo. Library bar, courtyard restaurant, the Spanish Steps a five-minute walk.',
  photos: [
    unsplashPhoto({
      id: '1531572753322-ad063cecc140',
      alt: 'Roman boutique hotel lobby',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 880, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'bar', label: 'Library bar' },
    { id: 'concierge', label: 'Concierge' },
    { id: 'wifi', label: 'Wi-Fi' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.6, reviewCount: 412, source: 'curated' },
  signals: {
    walkability: 96,
    familyFit: 50,
    remoteness: 5,
    noise: 30,
    tags: ['luxury', 'walkable', 'cultural', 'iconic-landmarks', 'urban'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=jk-place-roma',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const hotelDeRussie: Stay = {
  id: stayId('mock-italy:hotel-de-russie'),
  providerId: PROVIDER,
  name: 'Hotel de Russie',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Lazio',
    locality: 'Rome',
    neighborhood: 'Between Piazza del Popolo and the Spanish Steps',
    coordinates: { lat: 41.911, lng: 12.478 },
  },
  description:
    'A 19th-century hotel built around a terraced garden the size of a small park. Bar Stravinskij at sunset is its own institution.',
  photos: [
    unsplashPhoto({
      // Replaced - original Unsplash ID 1568901346375-23c9450c58cd
      // was repurposed and now serves a non-travel image (burger).
      id: '1464822759023-fed622ff2c3b',
      alt: 'Hotel courtyard garden with terraces',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 920, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'spa', label: 'Spa' },
    { id: 'gardens', label: 'Terrace gardens' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'bar', label: 'Bar Stravinskij' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.5, reviewCount: 524, source: 'curated' },
  signals: {
    walkability: 96,
    familyFit: 70,
    remoteness: 5,
    noise: 28,
    tags: ['luxury', 'walkable', 'iconic-landmarks', 'urban', 'family-friendly'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=hotel-de-russie',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const hotelEden: Stay = {
  id: stayId('mock-italy:hotel-eden'),
  providerId: PROVIDER,
  name: 'Hotel Eden',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Lazio',
    locality: 'Rome',
    neighborhood: 'Above the Via Veneto',
    coordinates: { lat: 41.906, lng: 12.487 },
  },
  description:
    'A 19th-century hotel with one of the best rooftops in the city. The bar looks out over Villa Borghese; the restaurant is run by Fabio Ciervo.',
  photos: [
    unsplashPhoto({
      id: '1567880905822-56f8e06fe630',
      alt: 'Roman rooftop hotel at sunset',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 980, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'rooftop', label: 'Rooftop bar' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Restaurant' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.4, reviewCount: 388, source: 'curated' },
  signals: {
    walkability: 90,
    familyFit: 55,
    remoteness: 5,
    noise: 32,
    tags: ['luxury', 'walkable', 'romantic', 'urban', 'foodie'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=hotel-eden',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const sixSensesRome: Stay = {
  id: stayId('mock-italy:six-senses-rome'),
  providerId: PROVIDER,
  name: 'Six Senses Rome',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Lazio',
    locality: 'Rome',
    neighborhood: 'Piazza San Marcello, near the Trevi Fountain',
    coordinates: { lat: 41.898, lng: 12.482 },
  },
  description:
    'A Palladio-era palazzo restored as a 96-room wellness hotel. Roman baths reborn as the spa downstairs; the rooftop is open to the public for negroni hour.',
  photos: [
    unsplashPhoto({
      id: '1502602898657-3e91760cbb34',
      alt: 'Restored Roman palazzo entrance',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 850, currency: 'EUR' }, cancellation: 'free' },
  amenities: [
    { id: 'spa', label: 'Roman bath spa' },
    { id: 'rooftop', label: 'Rooftop' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'wellness', label: 'Wellness program' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.5, reviewCount: 142, source: 'curated' },
  signals: {
    walkability: 95,
    familyFit: 60,
    remoteness: 5,
    noise: 30,
    tags: ['luxury', 'walkable', 'wellness', 'urban', 'iconic-landmarks'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=six-senses-rome',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

const sohoHouseRome: Stay = {
  id: stayId('mock-italy:soho-house-rome'),
  providerId: PROVIDER,
  name: 'Soho House Rome',
  type: 'hotel',
  location: {
    country: 'IT',
    region: 'Lazio',
    locality: 'Rome',
    neighborhood: 'San Lorenzo',
    coordinates: { lat: 41.901, lng: 12.519 },
  },
  description:
    'A members club with rooms above. The rooftop has a 25-meter pool and pizza oven; the basement screening room runs 35mm prints on Tuesdays.',
  photos: [
    unsplashPhoto({
      id: '1546412414-e1885259563a',
      alt: 'Rooftop pool with city skyline',
      credit: 'Unsplash',
    }),
  ],
  pricing: { pricePerNight: { amount: 380, currency: 'EUR' }, cancellation: 'partial' },
  amenities: [
    { id: 'pool', label: 'Rooftop pool' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'gym', label: 'Gym' },
    { id: 'cinema', label: 'Screening room' },
  ],
  capacity: { sleeps: 3, bedrooms: 1, bathrooms: 1 },
  rating: { score: 9.0, reviewCount: 218, source: 'curated' },
  signals: {
    walkability: 80,
    familyFit: 45,
    remoteness: 15,
    noise: 38,
    tags: ['mid-range', 'urban', 'foodie', 'fast-paced'],
  },
  bookingLink: {
    url: 'https://example.com/redirect?provider=mock-italy&id=soho-house-rome',
    type: 'redirect',
  },
  fetchedAt: FETCHED_AT,
};

export const ROME_STAYS: Stay[] = [
  jkPlaceRoma,
  hotelDeRussie,
  hotelEden,
  sixSensesRome,
  sohoHouseRome,
];
