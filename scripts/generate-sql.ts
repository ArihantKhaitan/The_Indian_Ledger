import { writeFileSync } from 'fs';
import { SEED } from '../src/data/seed.js';

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/'/g, "''");
}

function makeSql(entries: typeof SEED): string {
  const rows = entries.map((e) => {
    const amount = e.amount != null ? e.amount : 'NULL';
    const lat = e.lat != null ? e.lat : 'NULL';
    const lng = e.lng != null ? e.lng : 'NULL';
    const stateCode = e.stateCode ? `'${esc(e.stateCode)}'` : 'NULL';
    const sourcesJson = JSON.stringify(e.sources).replace(/'/g, "''");
    const verified = e.verified ? 'true' : 'false';
    return (
      `('${esc(e.id)}','${esc(e.name)}','${esc(e.level)}','${esc(e.year)}',` +
      `'${esc(e.party)}','${esc(e.status)}',${amount},'${esc(e.amtNote)}',` +
      `'${esc(e.people)}','${esc(e.desc)}','${esc(e.detailedExplanation)}',` +
      `'${sourcesJson}'::jsonb,${lat},${lng},${stateCode},${verified})`
    );
  });
  return (
    `INSERT INTO public.scam_entries\n` +
    `  (id,name,level,year,party,status,amount,amt_note,people,\n` +
    `   description,detailed_explanation,sources,lat,lng,state_code,verified)\n` +
    `VALUES\n${rows.join(',\n')}\n` +
    `ON CONFLICT (id) DO UPDATE SET\n` +
    `  name=EXCLUDED.name,level=EXCLUDED.level,year=EXCLUDED.year,\n` +
    `  party=EXCLUDED.party,status=EXCLUDED.status,amount=EXCLUDED.amount,\n` +
    `  amt_note=EXCLUDED.amt_note,people=EXCLUDED.people,\n` +
    `  description=EXCLUDED.description,detailed_explanation=EXCLUDED.detailed_explanation,\n` +
    `  sources=EXCLUDED.sources,lat=EXCLUDED.lat,lng=EXCLUDED.lng,\n` +
    `  state_code=EXCLUDED.state_code,verified=EXCLUDED.verified,updated_at=now();`
  );
}

writeFileSync('scripts/seed-batch1.sql', makeSql(SEED.slice(0, 66)), 'utf8');
writeFileSync('scripts/seed-batch2.sql', makeSql(SEED.slice(66)), 'utf8');
console.log(`Written: ${SEED.slice(0,66).length} rows in batch1, ${SEED.slice(66).length} rows in batch2`);
