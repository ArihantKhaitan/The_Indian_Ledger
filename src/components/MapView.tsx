import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { partyColor } from '../lib/colors';
import { firstYear } from '../lib/utils';

const GEO_URL =
  'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json';

// Map topojson NAME_1 → stateCode
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
  'Delhi': 'DL',
  'NCT of Delhi': 'DL',
};

interface GeoFeature {
  type: string;
  properties: Record<string, string>;
  geometry: unknown;
}

interface TooltipState {
  x: number;
  y: number;
  name: string;
  year: string;
  party: string;
  amount: number | null;
  amtNote: string;
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [dims, setDims] = useState({ width: 600, height: 500 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data, selectedId, setSelectedId, timelineYear, timelineMode } = useStore();

  // Filtered entries for current timeline
  const mappedEntries = useMemo(() => {
    return data.filter((d) => {
      if (!d.lat || !d.lng) return false;
      const yr = firstYear(d.year);
      if (timelineMode === 'exact' && yr !== timelineYear) return false;
      if (timelineMode === 'upto' && yr > timelineYear) return false;
      return true;
    });
  }, [data, timelineYear, timelineMode]);

  // Scam count per state (for subtle choropleth)
  const scamsByState = useMemo(() => {
    const counts: Record<string, number> = {};
    mappedEntries.forEach((e) => {
      if (e.stateCode && e.stateCode !== 'NATIONAL') {
        counts[e.stateCode] = (counts[e.stateCode] || 0) + 1;
      }
    });
    return counts;
  }, [mappedEntries]);

  // Load GeoJSON once
  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const key = Object.keys(topo.objects)[0];
        const geo = feature(topo, topo.objects[key] as Parameters<typeof feature>[1]);
        if (geo.type === 'FeatureCollection') {
          setFeatures(geo.features as GeoFeature[]);
        }
      })
      .catch(console.error);
  }, []);

  // Track container size with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setDims({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // D3 projection — recalculate on size change
  const { projection, pathFn } = useMemo(() => {
    const proj = d3
      .geoMercator()
      .center([82, 22])
      .scale((Math.min(dims.width, dims.height) / 500) * 900)
      .translate([dims.width / 2, dims.height / 2]);
    return { projection: proj, pathFn: d3.geoPath().projection(proj) };
  }, [dims]);

  // Convert lat/lng to SVG x/y
  const project = useCallback(
    (lng: number, lat: number): [number, number] => {
      return projection([lng, lat]) as [number, number];
    },
    [projection]
  );

  function getStateFill(name: string): string {
    const code = NAME_TO_CODE[name];
    if (!code) return '#1d1915';
    const count = scamsByState[code] || 0;
    if (count === 0) return '#1d1915';
    // Subtle brightness: 1 scam → slightly lighter, 2 → a bit more, 3+ → most
    const t = Math.min(count / 3, 1);
    return d3.interpolateRgb('#1d1915', '#2e2520')(t * 0.7);
  }

  function handlePinMouseEnter(e: React.MouseEvent, id: string) {
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
      amount: entry.amount,
      amtNote: entry.amtNote,
    });
  }

  function handlePinMouseLeave() {
    setHoveredId(null);
    setTooltip(null);
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
        {/* State paths */}
        {features.map((feat, i) => {
          const name = feat.properties?.NAME_1 || feat.properties?.ST_NM || '';
          const code = NAME_TO_CODE[name];
          const hasScams = code && scamsByState[code] > 0;
          return (
            <path
              key={i}
              d={pathFn(feat as unknown as d3.GeoPermissibleObjects) || ''}
              fill={getStateFill(name)}
              stroke="rgba(236,227,212,0.12)"
              strokeWidth={0.5}
              style={{
                transition: 'fill 0.4s ease',
                filter: hasScams ? 'brightness(1.15)' : undefined,
              }}
            />
          );
        })}

        {/* Pins — rendered as SVG circles */}
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
                {/* Pulse ring when selected */}
                {isSelected && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    initial={{ r: r, opacity: 0.7 }}
                    animate={{ r: r * 3, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                  />
                )}
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={color}
                  fillOpacity={isSelected ? 0.95 : 0.8}
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
                        ? `drop-shadow(0 0 5px ${color})`
                        : undefined,
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onClick={() => setSelectedId(isSelected ? null : entry.id)}
                  onMouseEnter={(e) => handlePinMouseEnter(e as unknown as React.MouseEvent, entry.id)}
                  onMouseLeave={handlePinMouseLeave}
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
              left: Math.min(tooltip.x + 14, dims.width - 220),
              top: Math.max(tooltip.y - 50, 8),
              background: '#1d1915',
              border: '1px solid rgba(236,227,212,0.18)',
              borderRadius: '4px',
              padding: '8px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              maxWidth: '210px',
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
          background: 'rgba(20,17,15,0.85)',
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
          { label: 'Regional', color: '#b0a48f' },
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

      {/* Count overlay */}
      <div className="absolute top-3 right-3 font-mono text-[9px] tracking-[1px] text-faint uppercase">
        {mappedEntries.length} state-level{mappedEntries.length !== 1 ? ' cases' : ' case'} shown
      </div>
    </div>
  );
}
