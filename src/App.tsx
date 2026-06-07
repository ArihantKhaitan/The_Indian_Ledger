import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { MapView } from './components/MapView';
import { NationalTray } from './components/NationalTray';
import { TimelineSlider } from './components/TimelineSlider';
import { FilterBar } from './components/FilterBar';
import { LedgerList } from './components/LedgerList';
import { AboutView } from './components/AboutView';
import { DetailDrawer } from './components/DetailDrawer';
import { Footer } from './components/Footer';

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28 },
};

export default function App() {
  const activeView = useStore((s) => s.activeView);
  const loadData = useStore((s) => s.loadData);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div
      className="min-h-screen bg-bg text-ink"
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% -10%, rgba(192,57,43,0.07), transparent 45%), radial-gradient(circle at 85% 5%, rgba(212,100,47,0.05), transparent 40%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navbar />

      {/* All views sit below the 60px navbar */}
      <div className="pt-[60px]">
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div key="overview" {...PAGE_TRANSITION}>
              <OverviewView />
            </motion.div>
          )}

          {activeView === 'map' && (
            <motion.div
              key="map"
              {...PAGE_TRANSITION}
              className="flex flex-col"
              style={{ height: 'calc(100vh - 60px)' }}
            >
              {/* Map — fills all available space above the bottom bar */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <MapView />
              </div>

              {/* Bottom bar: compact timeline + horizontal national cases */}
              <div
                className="flex shrink-0"
                style={{
                  height: '96px',
                  borderTop: '1px solid rgba(236,227,212,0.07)',
                  background: '#14110f',
                }}
              >
                <TimelineSlider />
                <NationalTray />
              </div>
            </motion.div>
          )}

          {activeView === 'ledger' && (
            <motion.div key="ledger" {...PAGE_TRANSITION} className="pb-20">
              {/* FilterBar spans full viewport width so no box edge is visible */}
              <div className="px-5 pt-4">
                <FilterBar />
              </div>
              <div className="max-w-screen-xl mx-auto px-5">
                <LedgerList />
              </div>
            </motion.div>
          )}

          {activeView === 'about' && (
            <motion.div key="about" {...PAGE_TRANSITION}>
              <AboutView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Views that show below the main content (only for non-map views) */}
      {activeView !== 'map' && (
        <div className="max-w-screen-xl mx-auto px-5">
          <Footer />
        </div>
      )}

      {/* Global overlay */}
      <DetailDrawer />
    </div>
  );
}
