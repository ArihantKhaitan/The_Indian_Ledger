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
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5 shrink-0">
        <span className="font-mono text-[9px] tracking-[1.5px] uppercase text-faint">National cases</span>
        <span className="font-mono text-[9px] text-accent font-semibold">{nationalEntries.length}</span>
      </div>

      {/* Horizontal scrolling cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-stretch gap-px px-4 pb-2.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {nationalEntries.map((entry) => {
          const isSelected = selectedId === entry.id;
          const yearDisplay = String(entry.year).match(/\d{4}/)?.[0] ?? '—';
          return (
            <button
              key={entry.id}
              onClick={() => setSelectedId(isSelected ? null : entry.id)}
              className="flex-shrink-0 flex flex-col justify-between text-left rounded px-2.5 py-1.5 transition-colors"
              style={{
                width: '148px',
                background: isSelected ? 'rgba(192,57,43,0.10)' : 'rgba(236,227,212,0.03)',
                border: `1px solid ${isSelected ? 'rgba(192,57,43,0.35)' : 'rgba(236,227,212,0.07)'}`,
                boxShadow: isSelected ? 'inset 0 0 0 1px rgba(192,57,43,0.2)' : 'none',
              }}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono text-[9px] text-accent font-semibold">{yearDisplay}</span>
                <span
                  className="font-mono text-[7.5px] tracking-[0.3px] uppercase px-1 py-0.5 rounded-sm whitespace-nowrap"
                  style={{ color: statusColor(entry.status), background: statusBgColor(entry.status) }}
                >
                  {entry.status.split(' ')[0]}
                </span>
              </div>
              <div className="font-body text-[10px] text-ink leading-snug line-clamp-2">{entry.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
