import {
  CuratedItineraryGenerator,
  SynthesizedItineraryGenerator,
  type ItineraryGenerator,
} from './generator';
import { getInMemoryItineraryStore } from './in-memory-itinerary-store';
import type { ItineraryStore } from './itinerary-store';

export interface ItinerarySubsystem {
  store: ItineraryStore;
  generator: ItineraryGenerator;
  /** Surfaced via getServerFeatures() — `curated` (default), `model`
   *  when C3.x ships ModelItineraryGenerator. */
  kind: 'curated' | 'model';
}

let _cached: ItinerarySubsystem | null = null;

export function getItinerarySubsystem(): ItinerarySubsystem {
  if (_cached) return _cached;
  const store = getInMemoryItineraryStore();
  const synthesized = new SynthesizedItineraryGenerator();
  const generator = new CuratedItineraryGenerator(synthesized);
  _cached = { store, generator, kind: 'curated' };
  return _cached;
}

export function _resetItinerarySubsystemForTesting(): void {
  _cached = null;
}
