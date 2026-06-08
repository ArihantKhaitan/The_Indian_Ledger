import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useMemo } from 'react';
import { firstYear } from '../lib/utils';
import { statusColor, statusBgColor } from '../lib/colors';

export function NationalTray() {
  const { data, selectedId, setSelectedId, timelineYear, timelineMode } = useStore();

  const nationalEntries = useMemo(() => {
    return data.filter((d) => {
      if (d.stateCode !== 'NATIONAL' && !/national/i.test(d.level)) return false;
      const yr = firstYear(d.year);
      if (timelineMode === 'exact' && yr !== timelineYear) return false;
      if (timelineMode === 'upto' && yr > timelineYear) return false;
      return true;
    }).sort((a, b) => firstYear(b.year) - firstYear(a.year));
  }, [data, timelineYear, timelineMode]);

  return (
    <div style={{ borderTop: '1px solid rgba(236,227,212,0.08)', background: '#14110f' }}>
      <div className="max-w-screen-xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[9px] tracking-[1.5px] uppercase text-faint">National cases</span>
          <span className="font-mono text-[9px] text-accent font-semibold">{nationalEntries.length} entries</span>
        </div>

        <AnimatePresence>
          {nationalEntries.map((entry, i) => {
            const isSelected = selectedId === entry.id;
            const yearDisplay = String(entry.year).match(/\d{4}/)?.[0] ?? '—';
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => setSelectedId(isSelected ? null : entry.id)}
                className="flex items-start justify-between gap-4 py-2.5 border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'rgba(236,227,212,0.07)',
                  background: isSelected ? 'rgba(192,57,43,0.06)' : 'transparent',
                  boxShadow: isSelected ? 'inset 2px 0 0 #c0392b' : 'none',
                  paddingLeft: isSelected ? '10px' : '0',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(236,227,212,0.02)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <span className="font-mono text-[10px] text-accent font-semibold shrink-0 w-10">{yearDisplay}</span>
                <span className="font-body text-[12px] text-ink leading-snug flex-1">{entry.name}</span>
                <span
                  className="font-mono text-[8px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-sm whitespace-nowrap shrink-0"
                  style={{ color: statusColor(entry.status), background: statusBgColor(entry.status) }}
                >
                  {entry.status.split(' ')[0]}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
