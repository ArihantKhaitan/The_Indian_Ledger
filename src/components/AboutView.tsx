import { motion } from 'framer-motion';

const PRINCIPLES = [
  {
    title: 'Cross-party coverage',
    body: 'Cases are included across the political spectrum — BJP, Congress, TMC, AAP, regional parties, and corporate actors. Inclusion is not a political statement; it is a research lead.',
  },
  {
    title: 'Alleged figures are labelled as such',
    body: 'Many headline numbers are CAG "presumptive-loss" figures — a methodology the courts have not always accepted. Where a figure is an estimate, that is explicitly noted in the "Amount note" field.',
  },
  {
    title: 'Status tracking is central',
    body: 'The Status field tells you where a case stands legally. Several high-profile matters (e.g. 2G) ended in full acquittal. Conviction and acquittal data is tracked separately from the initial allegation.',
  },
  {
    title: 'Sources required; unverified entries flagged',
    body: 'Entries without independently verified sources are marked "unverified sources." Before citing any figure or fact from this archive in a formal context, verify it against the primary source.',
  },
  {
    title: 'No invented data',
    body: 'Where a figure cannot be confirmed from a reputable source (news, CAG report, court filing, ED/CBI document), no figure is shown. Uncertainty is stated, not hidden.',
  },
];

const METHODOLOGY = [
  'Each entry corresponds to a discrete alleged event, scam, or controversy that received significant national or state-level coverage.',
  'The "level" field indicates whether a case is national in scope or specific to a named state government.',
  'The "ruling party" is the party or coalition in government when the alleged events primarily occurred — not necessarily the party in power when charges were filed.',
  'Where cases span multiple years, the earliest year of the primary alleged conduct is used as the headline year.',
  '"Amount" is the largest credible headline figure associated with the case — typically from a CAG report, court filing, or major investigation. The qualifier is always shown.',
  'State-level cases include a map pin at the approximate seat of government / city most associated with the events.',
  'National cases without a specific geographic anchor (e.g. policy decisions, multi-state frauds) are not pinned on the map; they appear in the National panel.',
];

export function AboutView() {
  return (
    <div className="max-w-screen-xl mx-auto px-5 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-10 pb-8 border-b border-line max-w-3xl"
      >
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-accent mb-4">
          About this archive
        </div>
        <h1
          className="font-display font-black text-ink leading-tight mb-4"
          style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1px' }}
        >
          What The Ledger is — and is not
        </h1>
        <p className="font-body text-muted leading-relaxed" style={{ fontSize: '16px' }}>
          The Ledger is a personal research database of alleged scams and major political
          controversies in India, 1996 to the present. It is designed to be a starting point for
          research — not a verdict, not a scorecard, and not an assertion of guilt.
        </p>
      </motion.div>

      {/* Disclaimer box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="my-8 border-l-[3px] border-accent pl-5 py-3 max-w-3xl"
        style={{ background: 'rgba(192,57,43,0.04)' }}
      >
        <div className="font-mono text-[10px] tracking-[2px] uppercase text-accent mb-2">
          Formal disclaimer
        </div>
        <p className="font-body text-muted text-[14px] leading-relaxed">
          <strong className="text-ink">Inclusion here is not an assertion of guilt.</strong> Most
          "amounts" are <strong className="text-ink">contested estimates</strong> (e.g. CAG
          presumptive-loss figures), not proven sums. Always check the{' '}
          <strong className="text-ink">Status</strong> field — many high-profile cases ended in{' '}
          <em>acquittal</em> or remain <em>pending</em>. Treat every entry as a research lead:{' '}
          <strong className="text-ink">verify the source before citing anything formally.</strong>
        </p>
      </motion.div>

      {/* Principles */}
      <div className="mt-8 max-w-3xl">
        <h2
          className="font-display font-semibold text-ink mb-6"
          style={{ fontSize: '20px', letterSpacing: '-0.3px' }}
        >
          Editorial principles
        </h2>
        <div className="flex flex-col gap-5">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="flex gap-4"
            >
              <div
                className="font-display font-black text-accent flex-shrink-0 w-7 text-right pt-0.5"
                style={{ fontSize: '18px', letterSpacing: '-0.5px' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="font-display font-semibold text-ink mb-1" style={{ fontSize: '16px' }}>
                  {p.title}
                </div>
                <p className="font-body text-muted text-[14px] leading-relaxed">{p.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="mt-12 max-w-3xl">
        <h2
          className="font-display font-semibold text-ink mb-5"
          style={{ fontSize: '20px', letterSpacing: '-0.3px' }}
        >
          Data methodology
        </h2>
        <ul className="flex flex-col gap-3">
          {METHODOLOGY.map((m, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex gap-3 text-[14px]"
            >
              <span className="font-mono text-[10px] text-accent flex-shrink-0 pt-0.5">—</span>
              <span className="font-body text-muted leading-relaxed">{m}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-12 pt-6 border-t border-line font-mono text-[10px] text-faint tracking-[0.5px] leading-relaxed max-w-3xl"
      >
        THE LEDGER · a personal research database · data is manually curated &amp; source-verified
        where possible · stored locally in your browser · export regularly to keep a backup ·
        cross-party &amp; factually neutral · not affiliated with any political party, government
        body, or media organization
      </motion.div>
    </div>
  );
}
