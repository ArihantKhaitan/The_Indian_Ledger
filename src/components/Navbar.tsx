import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useStore, ActiveView } from '../store';
import { exportJSON, exportCSV } from '../lib/utils';

const NAV_ITEMS: { id: ActiveView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'map', label: 'Map' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'about', label: 'About' },
];

export function Navbar() {
  const { activeView, setActiveView, data } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function nav(view: ActiveView) {
    setActiveView(view);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(20,17,15,0.90)'
            : 'rgba(20,17,15,0.70)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: scrolled
            ? '1px solid rgba(236,227,212,0.12)'
            : '1px solid transparent',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-5 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => nav('overview')}
            className="flex items-center gap-3 group"
          >
            <span
              className="font-display font-black text-ink tracking-tight leading-none"
              style={{ fontSize: '20px', letterSpacing: '-0.5px' }}
            >
              The{' '}
              <span style={{ color: '#c0392b' }}>Ledger</span>
            </span>
            <span
              className="font-mono text-[9px] tracking-[2px] uppercase text-faint hidden sm:block"
              style={{ paddingTop: '2px' }}
            >
              1996 → Present
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  onClick={() => nav(id)}
                  className="relative px-4 py-1.5 font-mono text-[11px] tracking-[1.5px] uppercase transition-colors duration-200"
                  style={{ color: active ? '#ece3d4' : '#6a6052' }}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-px"
                      style={{ background: '#c0392b' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            <div className="w-px h-5 bg-line mx-2" />

            <button
              onClick={() => exportJSON(data)}
              className="font-mono text-[10px] tracking-[1px] uppercase text-faint hover:text-ink transition-colors px-2 py-1.5"
              title="Export JSON"
            >
              ⤓ JSON
            </button>
            <button
              onClick={() => exportCSV(data)}
              className="font-mono text-[10px] tracking-[1px] uppercase text-faint hover:text-ink transition-colors px-2 py-1.5"
              title="Export CSV"
            >
              ⤓ CSV
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted hover:text-ink transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-[60px] left-0 right-0 z-40"
            style={{
              background: 'rgba(20,17,15,0.97)',
              backdropFilter: 'blur(14px)',
              borderBottom: '1px solid rgba(236,227,212,0.12)',
            }}
          >
            <div className="max-w-screen-xl mx-auto px-5 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => nav(id)}
                  className="text-left px-3 py-3 font-mono text-[12px] tracking-[2px] uppercase transition-colors rounded"
                  style={{
                    color: activeView === id ? '#ece3d4' : '#6a6052',
                    background: activeView === id ? 'rgba(192,57,43,0.08)' : 'transparent',
                    borderLeft: activeView === id ? '2px solid #c0392b' : '2px solid transparent',
                  }}
                >
                  {label}
                </button>
              ))}
              <div className="flex gap-4 pt-2 pl-3">
                <button
                  onClick={() => { exportJSON(data); setMobileOpen(false); }}
                  className="font-mono text-[10px] tracking-[1px] uppercase text-faint hover:text-ink transition-colors"
                >
                  ⤓ JSON
                </button>
                <button
                  onClick={() => { exportCSV(data); setMobileOpen(false); }}
                  className="font-mono text-[10px] tracking-[1px] uppercase text-faint hover:text-ink transition-colors"
                >
                  ⤓ CSV
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
