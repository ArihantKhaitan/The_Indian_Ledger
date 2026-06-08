import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { partyColor } from '../lib/colors';
import { firstYear } from '../lib/utils';

// GeoJSON fetch priority — drop a post-2019 file at /public/india-states.geojson
// to get correct J&K / Ladakh bifurcation boundaries
const GEO_LOCAL = '/india-states.geojson';
const GEO_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';
const GEO_FALLBACK =
  'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States';

// Fixed SVG canvas — matches Rajneeti exactly; CSS scales it to fill container
const W = 620;
const H = 740;

// Normalize a string to lowercase letters only for fuzzy matching
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

// Authoritative GeoJSON name variants → state codes (ported from Rajneeti IndiaMap.tsx)
const ALIASES: Record<string, string> = {
  andhrapradesh: 'AP',
  arunachalpradesh: 'AR',
  assam: 'AS',
  bihar: 'BR',
  chhattisgarh: 'CG',
  goa: 'GA',
  gujarat: 'GJ',
  haryana: 'HR',
  himachalpradesh: 'HP',
  jharkhand: 'JH',
  karnataka: 'KA',
  kerala: 'KL',
  madhyapradesh: 'MP',
  maharashtra: 'MH',
  manipur: 'MN',
  meghalaya: 'ML',
  mizoram: 'MZ',
  nagaland: 'NL',
  odisha: 'OD',
  orissa: 'OD',
  punjab: 'PB',
  rajasthan: 'RJ',
  sikkim: 'SK',
  tamilnadu: 'TN',
  telangana: 'TG',
  tripura: 'TR',
  uttarpradesh: 'UP',
  uttarakhand: 'UT',
  uttaranchal: 'UT',
  westbengal: 'WB',
  jammuandkashmir: 'JK',
  jammukashmir: 'JK',
  jammu: 'JK',
  kashmir: 'JK',
  ladakh: 'LA',
  delhi: 'DL',
  nctofdelhi: 'DL',
  chandigarh: 'CH',
  puducherry: 'PY',
  pondicherry: 'PY',
  andamanandnicobarislands: 'AN',
  andamannicobar: 'AN',
  lakshadweep: 'LD',
  dadraandnagarhaveli: 'DN',
  damananddiu: 'DN',
  dadraandnagarhavelianddamananddiu: 'DN',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function codeFromProps(props: Record<string, any>): string | undefined {
  const raw = props.ST_NM ?? props.STATE ?? props.NAME_1 ?? props.state ?? props.name ?? '';
  return ALIASES[norm(raw)];
}

// States to render abbreviation labels for (excludes tiny island UTs)
const LABEL_STATES = new Set([
  'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JH', 'KA', 'KL',
  'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PB', 'RJ', 'SK', 'TN', 'TG',
  'TR', 'UP', 'UT', 'WB', 'DL', 'JK', 'LA', 'CH', 'PY',
]);

// Big states get larger font
const BIG_STATES = new Set(['UP', 'RJ', 'MP', 'MH', 'GJ', 'WB']);

interface TooltipState {
  x: number;
  y: number;
  name: string;
  year: string;
  party: string;
}

export function MapView() {
  const svgRef = useRef<SVGSVGElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([]);
  const [geoError, setGeoError] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data, selectedId, setSelectedId, timelineYear, timelineMode } = useStore();

  const mappedEntries = useMemo(() => {
    return data.filter((d) => {
      if (!d.lat || !d.lng) return false;
      const yr = firstYear(d.year);
      if (timelineMode === 'exact' && yr !== timelineYear) return false;
      if (timelineMode === 'upto' && yr > timelineYear) return false;
      return true;
    });
  }, [data, timelineYear, timelineMode]);

  const scamsByState = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((e) => {
      if (e.stateCode && e.stateCode !== 'NATIONAL') {
        const yr = firstYear(e.year);
        if (timelineMode === 'exact' && yr !== timelineYear) return;
        if (timelineMode === 'upto' && yr > timelineYear) return;
        counts[e.stateCode] = (counts[e.stateCode] || 0) + 1;
      }
    });
    return counts;
  }, [data, timelineYear, timelineMode]);

  // Fetch GeoJSON — try local file first (post-2019 J&K), then remote fallbacks
  useEffect(() => {
    let cancelled = false;
    const load = (url: string) =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error('not ok');
        return r.json();
      });

    load(GEO_LOCAL)
      .catch(() => load(GEO_URL))
      .catch(() => load(GEO_FALLBACK))
      .then((json) => {
        if (cancelled) return;
        const feats = json.features ?? (Array.isArray(json) ? json : null);
        if (feats?.length > 0) setFeatures(feats);
        else setGeoError(true);
      })
      .catch(() => { if (!cancelled) setGeoError(true); });

    return () => { cancelled = true; };
  }, []);

  // Fixed projection — identical to Rajneeti: center 82.5°E/22°N, scale 920, shifted down 25px
  const { projection, pathFn } = useMemo(() => {
    const proj = d3
      .geoMercator()
      .center([82.5, 22])
      .scale(920)
      .translate([W / 2, H / 2 + 25]);
    return { projection: proj, pathFn: d3.geoPath().projection(proj) };
  }, []);

  const project = useCallback(
    (lng: number, lat: number): [number, number] | null => {
      const pt = projection([lng, lat]);
      return pt ? [pt[0], pt[1]] : null;
    },
    [projection]
  );

  // Precompute SVG paths + per-feature centroids
  const featureData = useMemo(() => {
    return features.map((feat) => {
      const code = codeFromProps(feat.properties || {});
      let pathD = '';
      let centroid: [number, number] | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pathD = pathFn(feat as any) || '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = pathFn.centroid(feat as any);
        if (c && !isNaN(c[0]) && !isNaN(c[1])) centroid = c as [number, number];
      } catch { /* skip degenerate features */ }
      return { code, pathD, centroid };
    });
  }, [features, pathFn]);

  // Average centroids across all features per state code (handles multi-polygon states correctly)
  const stateCentroidMap = useMemo(() => {
    const acc: Record<string, { sumX: number; sumY: number; count: number }> = {};
    featureData.forEach(({ code, centroid }) => {
      if (!code || !centroid) return;
      if (!acc[code]) acc[code] = { sumX: 0, sumY: 0, count: 0 };
      acc[code].sumX += centroid[0];
      acc[code].sumY += centroid[1];
      acc[code].count += 1;
    });
    const result: Record<string, [number, number]> = {};
    for (const [code, { sumX, sumY, count }] of Object.entries(acc)) {
      result[code] = [sumX / count, sumY / count];
    }
    return result;
  }, [featureData]);

  function getStateFill(code: string | undefined): string {
    if (!code) return '#1d1915';
    const count = scamsByState[code] || 0;
    if (count === 0) return '#1d1915';
    const t = Math.min(count / 4, 1);
    return d3.interpolateRgb('#232018', '#4a1f1a')(t);
  }

  function handlePinEnter(e: React.MouseEvent, id: string) {
    const entry = data.find((d) => d.id === id);
    if (!entry) return;
    setHoveredId(id);
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      name: entry.name,
      year: entry.year,
      party: entry.party,
    });
  }

  return (
    <div className="relative w-full h-full select-none" style={{ background: '#14110f' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        style={{ display: 'block' }}
      >
        {/* State fills */}
        {featureData.map(({ code, pathD }, i) =>
          pathD ? (
            <path
              key={i}
              d={pathD}
              fill={getStateFill(code)}
              stroke="rgba(236,227,212,0.18)"
              strokeWidth={0.7}
              style={{
                transition: 'fill 0.4s ease',
                filter: code && scamsByState[code] ? 'brightness(1.3)' : undefined,
              }}
            />
          ) : null
        )}

        {/* State abbreviation labels — one per state, placed at averaged centroid */}
        {Object.entries(stateCentroidMap).map(([code, [cx, cy]]) => {
          if (!LABEL_STATES.has(code)) return null;
          if (cx < 10 || cx > W - 10 || cy < 10 || cy > H - 10) return null;
          const count = scamsByState[code] || 0;
          const big = BIG_STATES.has(code);
          return (
            <text
              key={`lbl-${code}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={big ? 9.5 : count > 0 ? 9 : 8}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight={count > 0 ? '600' : '400'}
              fill={count > 0 ? 'rgba(236,227,212,0.75)' : 'rgba(236,227,212,0.28)'}
              style={{ pointerEvents: 'none', letterSpacing: '0.5px' }}
            >
              {code}
            </text>
          );
        })}

        {/* Scam pins */}
        <AnimatePresence>
          {mappedEntries.map((entry) => {
            const coords = project(entry.lng!, entry.lat!);
            if (!coords) return null;
            const [cx, cy] = coords;
            const isSelected = selectedId === entry.id;
            const isHovered = hoveredId === entry.id;
            const color = partyColor(entry.party);
            const r = isSelected ? 9 : isHovered ? 8 : 6;

            return (
              <g key={entry.id}>
                {isSelected && (
                  <motion.circle
                    cx={cx} cy={cy}
                    initial={{ r, opacity: 0.7 }}
                    animate={{ r: r * 3, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    fill="none" stroke={color} strokeWidth={1}
                  />
                )}
                <motion.circle
                  cx={cx} cy={cy} r={r}
                  fill={color}
                  fillOpacity={isSelected ? 0.95 : 0.85}
                  stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.4)'}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{
                    cursor: 'pointer',
                    filter:
                      isSelected || isHovered
                        ? `drop-shadow(0 0 6px ${color})`
                        : `drop-shadow(0 1px 2px rgba(0,0,0,0.6))`,
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onClick={() => setSelectedId(isSelected ? null : entry.id)}
                  onMouseEnter={(e) => handlePinEnter(e as unknown as React.MouseEvent, entry.id)}
                  onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
                />
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Pin tooltip — fixed to viewport so it doesn't get clipped by SVG viewBox */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tt"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed pointer-events-none z-50"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 50,
              background: '#1d1915',
              border: '1px solid rgba(236,227,212,0.18)',
              borderRadius: '4px',
              padding: '8px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              maxWidth: '220px',
            }}
          >
            <div className="font-body text-[12px] text-ink font-medium leading-snug mb-1.5">
              {tooltip.name}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[9px] text-faint">{tooltip.year}</span>
              {tooltip.party && (
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm font-semibold"
                  style={{ background: partyColor(tooltip.party), color: '#0c0a08' }}
                >
                  {tooltip.party}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Party legend */}
      <div
        className="absolute bottom-3 left-3 flex flex-col gap-1"
        style={{
          background: 'rgba(20,17,15,0.88)',
          border: '1px solid rgba(236,227,212,0.10)',
          borderRadius: '4px',
          padding: '8px 10px',
        }}
      >
        <div className="font-mono text-[8px] tracking-[1.5px] uppercase text-faint mb-1">
          Ruling party
        </div>
        {[
          { label: 'Congress / UPA', color: '#c97a6a' },
          { label: 'BJP / NDA', color: '#e8a23a' },
          { label: 'TMC', color: '#5fb898' },
          { label: 'AAP', color: '#5ad9d2' },
          { label: 'Regional / other', color: '#b0a48f' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <span className="font-mono text-[9px] text-faint">{label}</span>
          </div>
        ))}
      </div>

      {geoError && features.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-[11px] text-faint text-center">
            Could not load map boundaries.<br />Pins still functional — check network.
          </p>
        </div>
      )}

      {!geoError && features.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-[11px] text-faint animate-pulse">Loading map…</p>
        </div>
      )}
    </div>
  );
}
