
// Consolidated: re-export formations from `formations.ts` to avoid duplicate data
import FORMATIONS, { LINEUPS as LEGACY_LINEUPS } from './formations';

export const LINEUPS = LEGACY_LINEUPS || FORMATIONS;

export default FORMATIONS;
