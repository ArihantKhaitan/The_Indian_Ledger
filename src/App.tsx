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
              className="relative overflow-hidden"
              style={{ height: 'calc(100vh - 60px)' }}
            >
              {/* Map fills the entire space */}
              <MapView />

              {/* National cases tray — right side overlay */}
              <div className="absolute top-0 right-0 bottom-0 flex flex-col" style={{ width: '200px' }}>
                <NationalTray />
              </div>

              {/* Timeline slider — bottom overlay, left of the tray */}
              <div
                className="absolute bottom-0 left-0"
                style={{ right: '200px' }}
              >
                <TimelineSlider />
              </div>
            </motion.div>
          )}

          {activeView === 'ledger' && (
            <motion.div key="ledger" {...PAGE_TRANSITION} className="max-w-screen-xl mx-auto px-5 pb-20">
              <div className="pt-4">
                <FilterBar />
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
