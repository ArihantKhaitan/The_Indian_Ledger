// Fetches post-2019 state GeoJSONs from udit-001/india-maps-data (same source as Rajneeti)
// and merges them into public/india-states.geojson
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const STATE_SLUGS = {
  AP: 'andhra-pradesh',
  AR: 'arunachal-pradesh',
  AS: 'assam',
  BR: 'bihar',
  CG: 'chhattisgarh',
  GA: 'goa',
  GJ: 'gujarat',
  HR: 'haryana',
  HP: 'himachal-pradesh',
  JH: 'jharkhand',
  KA: 'karnataka',
  KL: 'kerala',
  MP: 'madhya-pradesh',
  MH: 'maharashtra',
  MN: 'manipur',
  ML: 'meghalaya',
  MZ: 'mizoram',
  NL: 'nagaland',
  OD: 'odisha',
  PB: 'punjab',
  RJ: 'rajasthan',
  SK: 'sikkim',
  TN: 'tamil-nadu',
  TG: 'telangana',
  TR: 'tripura',
  UP: 'uttar-pradesh',
  UT: 'uttarakhand',
  WB: 'west-bengal',
  DL: 'delhi',
  JK: 'jammu-and-kashmir',
  LA: 'ladakh',
  AN: 'andaman-and-nicobar-islands',
  CH: 'chandigarh',
  DN: 'dnh-and-dd',
  LD: 'lakshadweep',
  PY: 'puducherry',
};

const BASE = 'https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states';

async function fetchState(code, slug) {
  const url = `${BASE}/${slug}.geojson`;
  try {
    const r = await fetch(url);
    if (!r.ok) { console.warn(`  SKIP ${code}: HTTP ${r.status}`); return []; }
    const data = await r.json();
    const features = data.features ?? [];
    return features.map(f => ({
      ...f,
      properties: { ...f.properties, ST_NM: slug, STATE_CODE: code },
    }));
  } catch (e) {
    console.warn(`  SKIP ${code}: ${e.message}`);
    return [];
  }
}

async function main() {
  console.log('Fetching state GeoJSONs from udit-001/india-maps-data...');
  const entries = Object.entries(STATE_SLUGS);
  const allFeatures = [];

  // Fetch in batches of 6 to avoid overwhelming the server
  for (let i = 0; i < entries.length; i += 6) {
    const batch = entries.slice(i, i + 6);
    console.log(`Batch ${Math.floor(i/6)+1}: ${batch.map(([c]) => c).join(', ')}`);
    const results = await Promise.all(batch.map(([code, slug]) => fetchState(code, slug)));
    results.forEach(feats => allFeatures.push(...feats));
  }

  console.log(`\nTotal features: ${allFeatures.length}`);

  const geojson = { type: 'FeatureCollection', features: allFeatures };

  mkdirSync(join(ROOT, 'public'), { recursive: true });
  const outPath = join(ROOT, 'public', 'india-states.geojson');
  writeFileSync(outPath, JSON.stringify(geojson));
  console.log(`Written to ${outPath} (${(JSON.stringify(geojson).length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
