import { createClient } from '@supabase/supabase-js';
import type { ScamEntry } from '../types';
import { SEED } from '../data/seed';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// Map Supabase snake_case row → camelCase ScamEntry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEntry(row: Record<string, any>): ScamEntry {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    year: row.year,
    party: row.party,
    status: row.status,
    amount: row.amount ?? null,
    amtNote: row.amt_note ?? '',
    people: row.people ?? '',
    desc: row.description ?? '',
    detailedExplanation: row.detailed_explanation ?? '',
    sources: Array.isArray(row.sources) ? row.sources : [],
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    stateCode: row.state_code ?? undefined,
    verified: row.verified ?? false,
  };
}

export async function fetchAllEntries(): Promise<ScamEntry[]> {
  try {
    const { data, error } = await supabase
      .from('scam_entries')
      .select('*')
      .order('year', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('[Ledger] Supabase fetch failed, using seed data:', error?.message);
      return SEED;
    }

    return data.map(rowToEntry);
  } catch (err) {
    console.warn('[Ledger] Supabase unavailable, using seed data:', err);
    return SEED;
  }
}
