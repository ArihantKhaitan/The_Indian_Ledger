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
    <div className="flex flex-col h-full bg-panel border-l border-line overflow-hidden" style={{ minWidth: '200px', maxWidth: '220px' }}>
      <div className="px-3 py-2.5 border-b border-line">
        <div className="font-mono text-[9px] tracking-[1.5px] uppercase text-faint">National cases</div>
        <div className="font-mono text-[11px] text-muted mt-0.5">{nationalEntries.length} entries</div>
      </div>

      <div className="flex-1 overflow-y-auto">
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
                transition={{ duration: 0.2, delay: i * 0.03 }}
                onClick={() => setSelectedId(isSelected ? null : entry.id)}
                className="px-3 py-2.5 border-b border-line cursor-pointer transition-colors"
                style={{
                  background: isSelected ? 'rgba(192,57,43,0.08)' : 'transparent',
                  boxShadow: isSelected ? 'inset 2px 0 0 #c0392b' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(236,227,212,0.025)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <span className="font-mono text-[10px] text-accent font-semibold">{yearDisplay}</span>
                  <span
                    className="font-mono text-[8px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-sm whitespace-nowrap flex-shrink-0"
                    style={{
                      color: statusColor(entry.status),
                      background: statusBgColor(entry.status),
                    }}
                  >
                    {entry.status.split(' ')[0]}
                  </span>
                </div>
                <div className="font-body text-[11px] text-ink leading-tight">{entry.name}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
