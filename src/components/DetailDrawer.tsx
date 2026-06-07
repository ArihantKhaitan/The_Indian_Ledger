import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { partyColor, statusColor, statusBgColor } from '../lib/colors';
import { fmtAmt } from '../lib/utils';

export function DetailDrawer() {
  const { data, selectedId, setSelectedId } = useStore();
  const entry = selectedId ? data.find((e) => e.id === selectedId) : null;

  const yearDisplay = entry ? (String(entry.year).match(/\d{4}/)?.[0] ?? '—') : '';

  return (
    <AnimatePresence>
      {entry && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(8,6,5,0.6)' }}
            onClick={() => setSelectedId(null)}
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-lg overflow-y-auto"
            style={{ background: '#1d1915', borderLeft: '1px solid rgba(236,227,212,0.18)' }}
          >
            <div className="p-6">
              {/* Close */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.5px] text-muted hover:text-ink transition-colors"
                >
                  <X size={16} /> Close
                </button>
              </div>

              {/* Year + name */}
              <div
                className="font-display font-black text-5xl text-accent leading-none mb-3"
                style={{ letterSpacing: '-1px' }}
              >
                {yearDisplay}
              </div>
              <h2
                className="font-display font-black text-ink leading-tight mb-4"
                style={{ fontSize: '26px', letterSpacing: '-0.5px' }}
              >
                {entry.name}
              </h2>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="font-mono text-[10px] tracking-[0.5px] uppercase px-2.5 py-1 rounded-sm border border-line2 bg-panel2 text-ink">
                  {entry.level}
                </span>
                {entry.party && (
                  <span
                    className="font-mono text-[10px] tracking-[0.5px] uppercase px-2.5 py-1 rounded-sm font-semibold"
                    style={{ background: partyColor(entry.party), color: '#0c0a08' }}
                  >
                    {entry.party}
                  </span>
                )}
                <span
                  className="font-mono text-[10px] tracking-[0.5px] uppercase font-semibold px-2.5 py-1 rounded-sm"
                  style={{
                    color: statusColor(entry.status),
                    background: statusBgColor(entry.status),
                    border: `1px solid ${statusColor(entry.status)}40`,
                  }}
                >
                  {entry.status}
                </span>
              </div>

              {/* Amount */}
              {(entry.amount !== null || entry.amtNote) && (
                <div className="bg-panel2 border border-line rounded p-4 mb-5">
                  <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-faint mb-1">
                    Alleged amount
                  </div>
                  <div className="font-mono font-semibold text-xl text-ink">
                    {entry.amount !== null ? fmtAmt(entry.amount, '') : '—'}
                  </div>
                  {entry.amtNote && (
                    <div className="font-mono text-[11px] text-muted mt-1">{entry.amtNote}</div>
                  )}
                </div>
              )}

              {/* Data rows */}
              {[
                { k: 'Year', v: entry.year },
                { k: 'People', v: entry.people },
              ]
                .filter((r) => r.v && r.v !== '—')
                .map(({ k, v }) => (
                  <div key={k} className="flex gap-3 mb-3 text-[13.5px]">
                    <span className="font-mono text-[10px] tracking-[1px] uppercase text-faint flex-shrink-0 w-[110px] pt-0.5">
                      {k}
                    </span>
                    <span className="text-ink font-body flex-1">{v}</span>
                  </div>
                ))}

              <div className="border-t border-line my-5" />

              {/* Description */}
              <div className="mb-4">
                <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-faint mb-2">
                  Summary
                </div>
                <p className="font-body text-muted text-[14px] leading-relaxed">{entry.desc}</p>
              </div>

              {/* Detailed explanation */}
              {entry.detailedExplanation && (
                <div className="mb-5">
                  <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-faint mb-2">
                    Analysis
                  </div>
                  <p className="font-body text-ink text-[14.5px] leading-relaxed">
                    {entry.detailedExplanation}
                  </p>
                </div>
              )}

              {/* Sources */}
              <div className="mb-5">
                <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-faint mb-3">
                  Sources
                </div>
                {entry.sources && entry.sources.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {entry.sources.map((src, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-1.5 font-body text-[13px] leading-snug hover:text-ink transition-colors group"
                            style={{ color: '#d4642f' }}
                          >
                            <ExternalLink
                              size={12}
                              className="flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform"
                            />
                            {src.title}
                          </a>
                        ) : (
                          <div className="flex items-start gap-1.5 text-faint font-body text-[13px] italic">
                            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                            {src.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-faint font-body italic text-[13px]">
                    No sources added — verify before citing
                  </p>
                )}
              </div>

              {!entry.verified && (
                <div className="flex items-start gap-2 bg-panel2 border border-faint/30 rounded px-3 py-2.5 mt-4">
                  <AlertTriangle size={14} className="text-faint flex-shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-faint leading-snug">
                    Sources for this entry have not been independently verified. Confirm all claims
                    before citing.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
