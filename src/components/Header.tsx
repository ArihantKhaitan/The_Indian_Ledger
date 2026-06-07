import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="border-b-2 border-line2 relative overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px',
        }}
      />

      <div className="max-w-screen-xl mx-auto px-5 py-7 pb-5 relative">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 font-mono text-[11px] tracking-[3px] uppercase text-accent mb-3"
        >
          <span className="h-px w-8 bg-accent opacity-60 flex-shrink-0" />
          Public Record · Cross-Party · 1996 → Present
          <span className="h-px bg-accent opacity-60 flex-grow" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-black text-ink leading-none tracking-tight"
          style={{ fontSize: 'clamp(34px, 6vw, 62px)', letterSpacing: '-1.5px', lineHeight: 0.95 }}
        >
          The Ledger
          <span
            className="block font-body font-normal italic text-muted mt-2"
            style={{ fontSize: 'clamp(13px, 2vw, 17px)', letterSpacing: '0', lineHeight: 1.5 }}
          >
            An archive of alleged scams &amp; major political controversies across Indian governments — national &amp; state. Figures are <em>alleged / estimated</em>; legal status is tracked separately.
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-[13px] text-muted max-w-3xl border-l-[3px] border-accent pl-4 py-1.5"
          style={{ background: 'rgba(192,57,43,0.04)' }}
        >
          <strong className="text-ink">Read this first.</strong> Inclusion here is <strong className="text-ink">not</strong> an assertion of guilt. Most "amounts" are <strong className="text-ink">contested estimates</strong> (e.g. CAG presumptive-loss figures), not proven sums. Always check the <strong className="text-ink">Status</strong> field — many high-profile cases ended in <em>acquittal</em> or remain <em>pending</em>. Treat every entry as a research lead: <strong className="text-ink">verify the source before citing anything formally.</strong>
        </motion.div>
      </div>
    </header>
  );
}
