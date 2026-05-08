import type { Stay } from '@core/stay';
import { TUSCANY_STAYS } from './stays/tuscany';
import { UMBRIA_STAYS } from './stays/umbria';
import { AMALFI_STAYS } from './stays/amalfi';
import { ROME_STAYS } from './stays/rome';
import { VENICE_STAYS } from './stays/venice';
import { LAKE_COMO_STAYS } from './stays/lake-como';
import { CINQUE_TERRE_STAYS } from './stays/cinque-terre';

export const ALL_STAYS: readonly Stay[] = [
  ...TUSCANY_STAYS,
  ...UMBRIA_STAYS,
  ...AMALFI_STAYS,
  ...ROME_STAYS,
  ...VENICE_STAYS,
  ...LAKE_COMO_STAYS,
  ...CINQUE_TERRE_STAYS,
];

export const STAYS_BY_DESTINATION: Readonly<Record<string, readonly Stay[]>> = {
  tuscany: TUSCANY_STAYS,
  umbria: UMBRIA_STAYS,
  amalfi: AMALFI_STAYS,
  rome: ROME_STAYS,
  venice: VENICE_STAYS,
  'lake-como': LAKE_COMO_STAYS,
  'cinque-terre': CINQUE_TERRE_STAYS,
};
