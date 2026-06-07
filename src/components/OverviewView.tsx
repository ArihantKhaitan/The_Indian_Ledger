import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { partyColor, statusColor, statusBgColor } from '../lib/colors';
import { fmtAmt, firstYear } from '../lib/utils';

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(current);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val.toLocaleString('en-IN')}</>;
}

// Top cases to feature on the overview
const FEATURED_IDS = [
  '2g_001',
  'coal_001',
  'pnb_001',
  'vyapam_001',
  'electoral_001',
  'fodder_001',
];

export function OverviewView() {
  const { data, setSelectedId, setActiveView } = useStore();

  const nat = data.filter((d) => /national/i.test(d.level)).length;
  const st = data.length - nat;
  const convicted = data.filter((d) => /convict/i.test(d.status)).length;
  const pending = data.filter((d) => /trial|investig|charge/i.test(d.status)).length;
  const acquitted = data.filter((d) => /acquit|no charge/i.test(d.status)).length;
  const totalAmt = data.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Featured entries: try by FEATURED_IDS, fallback to top-6 by amount
  const featured = (() => {
    const byId = FEATURED_IDS.map((id) => data.find((d) => d.id === id)).filter(Boolean);
    if (byId.length >= 4) return byId.slice(0, 6) as typeof data;
    return [...data]
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 6);
  })();

  const stats = [
    { n: data.length, label: 'Total entries', accent: true },
    { n: nat, label: 'National-level', accent: false },
    { n: st, label: 'State-level', accent: false },
    { n: pending, label: 'Under trial / probe', accent: false },
    { n: convicted, label: 'Resulted in conviction', accent: false },
    { n: acquitted, label: 'Acquitted / no charges', accent: false },
  ];

  function openEntry(id: string) {
    setSelectedId(id);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-5 pb-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-10 pb-8 border-b border-line"
      >
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-accent flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-accent opacity-60" />
          Public Record · Cross-Party · 1996 → Present
          <span className="h-px flex-grow bg-accent opacity-20" />
        </div>
        <h1
          className="font-display font-black text-ink leading-none mb-3"
          style={{ fontSize: 'clamp(38px, 6vw, 72px)', letterSpacing: '-2px' }}
        >
          The Ledger
        </h1>
        <p
          className="font-body text-muted max-w-2xl leading-relaxed"
          style={{ fontSize: 'clamp(14px, 1.8vw, 17px)' }}
        >
          An archive of alleged scams &amp; major political controversies across Indian
          governments — national &amp; state. Figures are{' '}
          <em>alleged / estimated</em>; legal status is tracked separately.
        </p>
        <div
          className="mt-5 text-[13px] text-muted max-w-2xl border-l-[3px] border-accent pl-4 py-1.5"
          style={{ background: 'rgba(192,57,43,0.04)' }}
        >
          <strong className="text-ink">Read this first.</strong> Inclusion here is{' '}
          <strong className="text-ink">not</strong> an assertion of guilt. Most "amounts" are{' '}
          <strong className="text-ink">contested estimates</strong> — always check the{' '}
          <strong className="text-ink">Status</strong> field. Treat every entry as a research
          lead: <strong className="text-ink">verify the source before citing anything formally.</strong>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-8 border-b border-line">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="bg-panel border border-line rounded px-4 py-3"
          >
            <div
              className="font-display font-black text-3xl leading-none mb-1.5"
              style={{ color: s.accent ? '#c0392b' : '#ece3d4' }}
            >
              <AnimatedNumber target={s.n} />
            </div>
            <div className="font-mono text-[9px] tracking-[1.5px] uppercase text-faint leading-snug">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total alleged figure */}
      {totalAmt > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="py-6 border-b border-line flex items-baseline gap-4"
        >
          <span className="font-mono text-[10px] tracking-[2px] uppercase text-faint">
            Combined alleged / estimated exposure
          </span>
          <span className="font-display font-black text-2xl text-accent" style={{ letterSpacing: '-1px' }}>
            {fmtAmt(totalAmt, '')}
          </span>
          <span className="font-mono text-[9px] text-faint italic">
            sum of all headline figures — many are CAG presumptive-loss estimates, not proven sums
          </span>
        </motion.div>
      )}

      {/* Featured cases */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-display font-semibold text-ink"
            style={{ fontSize: '22px', letterSpacing: '-0.5px' }}
          >
            High-profile cases
          </h2>
          <button
            onClick={() => setActiveView('ledger')}
            className="font-mono text-[10px] tracking-[1.5px] uppercase text-accent hover:text-accent/80 transition-colors"
          >
            Browse full ledger ({data.length} entries) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((entry, i) => {
            const yr = String(entry.year).match(/\d{4}/)?.[0] ?? '—';
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                onClick={() => openEntry(entry.id)}
                className="bg-panel border border-line rounded p-4 cursor-pointer group transition-all duration-200"
                style={{ borderLeftWidth: '3px', borderLeftColor: partyColor(entry.party) }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = '#241f1a')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = '#1d1915')
                }
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="font-display font-black text-2xl text-accent leading-none"
                    style={{ letterSpacing: '-1px' }}
                  >
                    {yr}
                  </span>
                  <span
                    className="font-mono text-[9px] tracking-[0.5px] uppercase font-semibold px-2 py-0.5 rounded-sm flex-shrink-0"
                    style={{
                      color: statusColor(entry.status),
                      background: statusBgColor(entry.status),
                    }}
                  >
                    {entry.status}
                  </span>
                </div>

                <h3
                  className="font-display font-semibold text-ink mb-1.5 leading-tight"
                  style={{ fontSize: '17px', letterSpacing: '-0.2px' }}
                >
                  {entry.name}
                </h3>

                <div className="flex flex-wrap gap-1 mb-2">
                  {entry.party && (
                    <span
                      className="font-mono text-[9px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-sm font-semibold"
                      style={{ background: partyColor(entry.party), color: '#0c0a08' }}
                    >
                      {entry.party}
                    </span>
                  )}
                  <span className="font-mono text-[9px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-sm border border-line2 text-faint">
                    {entry.level}
                  </span>
                </div>

                <p className="text-muted text-[13px] leading-relaxed font-body line-clamp-2">
                  {entry.desc}
                </p>

                {entry.amount !== null && (
                  <div className="mt-2 font-mono text-[11px] text-ink font-semibold">
                    {fmtAmt(entry.amount, '')}
                    {entry.amtNote && (
                      <span className="text-faint font-normal ml-1 text-[9px]">
                        ({entry.amtNote})
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-line"
      >
        <button
          onClick={() => { window.scrollTo({ top: 0 }); setActiveView('map'); }}
          className="font-mono text-[11px] tracking-[2px] uppercase px-5 py-2.5 rounded border border-line2 text-muted hover:border-accent hover:text-ink transition-colors"
        >
          → Open map view
        </button>
        <button
          onClick={() => { window.scrollTo({ top: 0 }); setActiveView('about'); }}
          className="font-mono text-[11px] tracking-[2px] uppercase px-5 py-2.5 rounded bg-accent text-white hover:bg-[#a82e22] transition-colors"
        >
          → About this archive
        </button>
      </motion.div>
    </div>
  );
}
