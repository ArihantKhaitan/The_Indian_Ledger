import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { ScamCard } from './ScamCard';
import { firstYear } from '../lib/utils';

export function LedgerList() {
  const { data, filters, selectedId, timelineYear, timelineMode } = useStore();
  const selectedCardRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase();
    let rows = data.filter((d) => {
      if (filters.level && d.level !== filters.level) return false;
      if (filters.party && d.party !== filters.party) return false;
      if (filters.status && d.status !== filters.status) return false;
      if (q) {
        const blob = (d.name + ' ' + d.desc + ' ' + (d.people || '') + ' ' + d.party + ' ' + d.level).toLowerCase();
        if (!blob.includes(q)) return false;
      }
      // Timeline filter
      const entryYear = firstYear(d.year);
      if (timelineMode === 'exact' && entryYear !== timelineYear) return false;
      if (timelineMode === 'upto' && entryYear > timelineYear) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      if (filters.sort === 'year-desc') return firstYear(b.year) - firstYear(a.year);
      if (filters.sort === 'year-asc') return firstYear(a.year) - firstYear(b.year);
      if (filters.sort === 'amt-desc') return (b.amount || 0) - (a.amount || 0);
      if (filters.sort === 'amt-asc') return (a.amount || 0) - (b.amount || 0);
      if (filters.sort === 'az') return a.name.localeCompare(b.name);
      return 0;
    });

    return rows;
  }, [data, filters, timelineYear, timelineMode]);

  // Scroll selected card into view
  useEffect(() => {
    if (selectedId && selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  return (
    <div>
      <div className="flex justify-between items-baseline py-3 text-faint font-mono text-[11px] tracking-[1px] uppercase border-b border-line">
        <span>{filtered.length} of {data.length} entries shown</span>
        <span className="hidden sm:inline">Click any row to open details · amounts in ₹ crore</span>
      </div>

      <div className="border-t border-line">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted font-body italic text-base">
            No entries match. Adjust filters or add a new one.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((entry, i) => (
              <ScamCard
                key={entry.id}
                entry={entry}
                index={i}
                isSelected={selectedId === entry.id}
                cardRef={selectedId === entry.id ? selectedCardRef : undefined}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
