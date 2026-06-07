import { motion } from 'framer-motion';
import { useStore } from '../store';
import { ScamEntry } from '../types';
import { partyColor, statusColor, statusBgColor } from '../lib/colors';
import { fmtAmt, firstYear } from '../lib/utils';

interface Props {
  entry: ScamEntry;
  index: number;
  isSelected: boolean;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function ScamCard({ entry, index, isSelected, cardRef }: Props) {
  const setSelectedId = useStore((s) => s.setSelectedId);
  const yearDisplay = String(entry.year).match(/\d{4}/)?.[0] ?? '—';

  // suppress unused-warning for firstYear – used indirectly via seed data
  void firstYear;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      onClick={() => setSelectedId(isSelected ? null : entry.id)}
      className="border-b border-line cursor-pointer transition-colors duration-150"
      style={{
        background: isSelected ? 'rgba(192,57,43,0.06)' : 'transparent',
        boxShadow: isSelected ? 'inset 3px 0 0 #c0392b' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.background =
            'rgba(236,227,212,0.025)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <div className="py-4 px-3 grid gap-4" style={{ gridTemplateColumns: '64px 1fr auto' }}>
        {/* Year */}
        <div className="pt-0.5">
          <div className="font-display font-black text-xl text-accent leading-none">{yearDisplay}</div>
          <div className="font-mono text-[9px] text-faint tracking-[1px] mt-1">{String(entry.year)}</div>
        </div>

        {/* Main */}
        <div>
          <h3
            className="font-display font-semibold text-xl text-ink leading-tight mb-1.5"
            style={{ letterSpacing: '-0.3px' }}
          >
            {entry.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="font-mono text-[10px] tracking-[0.5px] uppercase px-2 py-0.5 rounded-sm border border-line2 bg-panel2 text-ink">
              {entry.level}
            </span>
            {entry.party && (
              <span
                className="font-mono text-[10px] tracking-[0.5px] uppercase px-2 py-0.5 rounded-sm font-semibold"
                style={{ background: partyColor(entry.party), color: '#0c0a08' }}
              >
                {entry.party}
              </span>
            )}
            {!entry.verified && (
              <span className="font-mono text-[9px] tracking-[0.5px] uppercase px-2 py-0.5 rounded-sm border border-faint text-faint">
                unverified sources
              </span>
            )}
          </div>
          <p className="text-muted text-[14px] max-w-lg leading-relaxed font-body">{entry.desc}</p>
        </div>

        {/* Right */}
        <div className="text-right flex flex-col items-end gap-2 min-w-[130px]">
          <div>
            <div className="font-mono font-semibold text-base text-ink whitespace-nowrap">
              {fmtAmt(entry.amount, '')}
            </div>
            {entry.amtNote && (
              <div className="font-mono text-[9px] text-faint tracking-[0.5px] mt-0.5 max-w-[150px] text-right leading-tight">
                {entry.amtNote}
              </div>
            )}
          </div>
          <span
            className="font-mono text-[10px] tracking-[0.5px] uppercase font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap"
            style={{
              color: statusColor(entry.status),
              background: statusBgColor(entry.status),
              border: `1px solid ${statusColor(entry.status)}40`,
            }}
          >
            {entry.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
