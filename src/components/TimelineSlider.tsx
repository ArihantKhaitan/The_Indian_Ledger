import * as Slider from '@radix-ui/react-slider';
import { useStore } from '../store';

const MIN_YEAR = 1996;
const MAX_YEAR = new Date().getFullYear();

export function TimelineSlider() {
  const { timelineYear, timelineMode, setTimelineYear, setTimelineMode } = useStore();

  return (
    <div className="px-4 py-3" style={{ background: 'rgba(29,25,21,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderTop: '1px solid rgba(236,227,212,0.08)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-faint">Timeline filter</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTimelineMode('exact')}
            className="font-mono text-[10px] tracking-[0.5px] uppercase px-2.5 py-1 rounded-sm transition-colors"
            style={{
              background: timelineMode === 'exact' ? 'rgba(192,57,43,0.2)' : 'transparent',
              border: `1px solid ${timelineMode === 'exact' ? '#c0392b' : 'rgba(236,227,212,0.18)'}`,
              color: timelineMode === 'exact' ? '#c0392b' : '#6a6052',
            }}
          >
            Exact year
          </button>
          <button
            onClick={() => setTimelineMode('upto')}
            className="font-mono text-[10px] tracking-[0.5px] uppercase px-2.5 py-1 rounded-sm transition-colors"
            style={{
              background: timelineMode === 'upto' ? 'rgba(192,57,43,0.2)' : 'transparent',
              border: `1px solid ${timelineMode === 'upto' ? '#c0392b' : 'rgba(236,227,212,0.18)'}`,
              color: timelineMode === 'upto' ? '#c0392b' : '#6a6052',
            }}
          >
            Up to year
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] text-faint w-8">{MIN_YEAR}</span>

        <Slider.Root
          className="relative flex items-center flex-1 h-5 cursor-pointer"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={1}
          value={[timelineYear]}
          onValueChange={([v]) => setTimelineYear(v)}
        >
          <Slider.Track className="relative flex-1 h-px" style={{ background: 'rgba(236,227,212,0.18)' }}>
            <Slider.Range
              className="absolute h-full"
              style={{ background: 'rgba(192,57,43,0.5)' }}
            />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 rounded-full border-2 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-panel"
            style={{ background: '#c0392b', borderColor: '#e05040' }}
          />
        </Slider.Root>

        <span className="font-mono text-[10px] text-faint w-8 text-right">{MAX_YEAR}</span>

        <div
          className="font-display font-black text-2xl leading-none min-w-[56px] text-right"
          style={{ color: '#c0392b', letterSpacing: '-1px' }}
        >
          {timelineYear}
        </div>
      </div>
    </div>
  );
}
