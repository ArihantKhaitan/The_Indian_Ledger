import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const outPath = join(ROOT, 'public', 'india-states.geojson');

const r = await fetch('https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/dnh-and-dd.geojson');
const data = await r.json();
const newFeatures = (data.features ?? []).map(f => ({
  ...f,
  properties: { ...f.properties, ST_NM: 'dnh-and-dd', STATE_CODE: 'DN' },
}));

const existing = JSON.parse(readFileSync(outPath, 'utf8'));
existing.features.push(...newFeatures);
writeFileSync(outPath, JSON.stringify(existing));
console.log(`Added ${newFeatures.length} DN features. Total: ${existing.features.length}`);
