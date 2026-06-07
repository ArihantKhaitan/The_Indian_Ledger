import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { partyColor } from '../lib/colors';
import { firstYear } from '../lib/utils';

// Direct GeoJSON — no topojson processing needed
const GEO_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';
// Fallback if above fails (topojson, requires processing)
const GEO_FALLBACK =
  'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States';

// Normalise various GeoJSON state name spellings → our stateCode
const NAME_TO_CODE: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OD',
  'Orissa': 'OD',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TS',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'Uttaranchal': 'UK',
  'West Bengal': 'WB',
  'Jammu and Kashmir': 'JK',
  'Jammu & Kashmir': 'JK',
  'Ladakh': 'LA',
  'Delhi': 'DL',
  'NCT of Delhi': 'DL',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN',
  'Lakshadweep': 'LD',
  'Puducherry': 'PY',
  'Andaman and Nicobar Islands': 'AN',
  'Chandigarh': 'CH',
};

// Extract state name from any GeoJSON property schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStateName(props: Record<string, any>): string {
  return props.ST_NM || props.NAME_1 || props.State || props.state || props.name || '';
}

interface TooltipState {
  x: number;
  y: number;
  name: string;
  year: string;
  party: string;
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([]);
  const [geoError, setGeoError] = useState(false);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data, selectedId, setSelectedId, timelineYear, timelineMode } = useStore();

  // Entries visible on map under current timeline
  const mappedEntries = useMemo(() => {
    return data.filter((d) => {
      if (!d.lat || !d.lng) return false;
      const yr = firstYear(d.year);
      if (timelineMode === 'exact' && yr !== timelineYear) return false;
      if (timelineMode === 'upto' && yr > timelineYear) return false;
      return true;
    });
  }, [data, timelineYear, timelineMode]);

  // Scam count per state code (for subtle choropleth)
  const scamsByState = useMemo(() => {
    const counts: Record<string, number> = {};
    mappedEntries.forEach((e) => {
      if (e.stateCode && e.stateCode !== 'NATIONAL') {
        counts[e.stateCode] = (counts[e.stateCode] || 0) + 1;
      }
    });
    return counts;
  }, [mappedEntries]);

  // Load GeoJSON — try primary URL, fall back to secondary
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const urls = [GEO_URL, GEO_FALLBACK];
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const json: any = await res.json();
          if (cancelled) return;
          // Support both FeatureCollection and array of features
          const feats = json.features ?? (Array.isArray(json) ? json : null);
          if (feats && feats.length > 0) {
            setFeatures(feats);
            return;
          }
        } catch {
          // try next url
        }
      }
      if (!cancelled) setGeoError(true);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Track container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 800;
      const h = el.clientHeight || 600;
      setDims({ width: w, height: h });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  // D3 projection — matches Rajneeti: center [82.5, 22], scale ~920 for 620px width
  // Translate pushed slightly below geometric center so J&K stays in frame
  const { projection, pathFn } = useMemo(() => {
    const scale = (dims.height / 700) * 920;
    const proj = d3
      .geoMercator()
      .center([82.5, 22])
      .scale(scale)
      .translate([dims.width / 2, dims.height * 0.54]);
    return { projection: proj, pathFn: d3.geoPath().projection(proj) };
  }, [dims]);

  // lat/lng → SVG coords
  const project = useCallback(
    (lng: number, lat: number): [number, number] | null => {
      const pt = projection([lng, lat]);
      return pt ? [pt[0], pt[1]] : null;
    },
    [projection]
  );

  function getStateFill(name: string): string {
    const code = NAME_TO_CODE[name];
    if (!code) return '#1d1915';
    const count = scamsByState[code] || 0;
    if (count === 0) return '#1d1915';
    const t = Math.min(count / 3, 1) * 0.65;
    return d3.interpolateRgb('#1d1915', '#3a2820')(t);
  }

  function handlePinEnter(e: React.MouseEvent, id: string) {
    const entry = data.find((d) => d.id === id);
    if (!entry) return;
    setHoveredId(id);
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name: entry.name,
      year: entry.year,
      party: entry.party,
    });
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      style={{ background: '#14110f' }}
    >
      <svg
        ref={svgRef}
        width={dims.width}
        height={dims.height}
        style={{ display: 'block' }}
      >
        {/* State boundary paths */}
        {features.map((feat, i) => {
          const name = getStateName(feat.properties || {});
          const code = NAME_TO_CODE[name];
          const hasScams = !!code && scamsByState[code] > 0;
          let pathD = '';
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pathD = pathFn(feat as any) || '';
          } catch {
            /* skip malformed feature */
          }
          return (
            <path
              key={i}
              d={pathD}
              fill={getStateFill(name)}
              stroke="rgba(236,227,212,0.14)"
              strokeWidth={0.6}
              style={{ transition: 'fill 0.4s ease', filter: hasScams ? 'brightness(1.2)' : undefined }}
            />
          );
        })}

        {/* Pins */}
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
                  fillOpacity={isSelected ? 0.95 : 0.82}
                  stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.35)'}
                  strokeWidth={isSelected ? 1.5 : 0.7}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{
                    cursor: 'pointer',
                    filter: isSelected || isHovered ? `drop-shadow(0 0 5px ${color})` : undefined,
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

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tt"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute pointer-events-none z-10"
            style={{
              left: Math.min(tooltip.x + 14, dims.width - 230),
              top: Math.max(tooltip.y - 50, 8),
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
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="font-mono text-[9px] text-faint">{label}</span>
          </div>
        ))}
      </div>

      {/* State count */}
      <div className="absolute top-3 right-3 font-mono text-[9px] tracking-[1px] text-faint uppercase">
        {mappedEntries.length} state-level {mappedEntries.length !== 1 ? 'cases' : 'case'} shown
      </div>

      {/* GeoJSON load error fallback */}
      {geoError && features.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-[11px] text-faint text-center">
            Could not load map boundaries.<br />Pins still functional — check network.
          </p>
        </div>
      )}

      {/* Loading state */}
      {!geoError && features.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-[11px] text-faint animate-pulse">Loading map…</p>
        </div>
      )}
    </div>
  );
}
