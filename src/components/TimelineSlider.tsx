import * as Slider from '@radix-ui/react-slider';
import { useStore } from '../store';

const MIN_YEAR = 1996;
const MAX_YEAR = new Date().getFullYear();

export function TimelineSlider() {
  const { timelineYear, timelineMode, setTimelineYear, setTimelineMode } = useStore();

  return (
    <div
      className="px-6 py-5"
      style={{ borderTop: '1px solid rgba(236,227,212,0.08)', background: '#14110f' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[9px] tracking-[1.5px] uppercase text-faint">Timeline filter</span>
          <div className="flex items-center gap-1.5">
            {(['exact', 'upto'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimelineMode(mode)}
                className="font-mono text-[9px] tracking-[0.5px] uppercase px-2.5 py-1 rounded-sm transition-colors"
                style={{
                  background: timelineMode === mode ? 'rgba(192,57,43,0.18)' : 'transparent',
                  border: `1px solid ${timelineMode === mode ? '#c0392b' : 'rgba(236,227,212,0.15)'}`,
                  color: timelineMode === mode ? '#c0392b' : '#6a6052',
                }}
              >
                {mode === 'exact' ? 'Exact year' : 'Up to year'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="font-mono text-[10px] text-faint shrink-0">{MIN_YEAR}</span>

          <Slider.Root
            className="relative flex items-center flex-1 h-5 cursor-pointer"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={[timelineYear]}
            onValueChange={([v]) => setTimelineYear(v)}
          >
            <Slider.Track className="relative flex-1 h-px" style={{ background: 'rgba(236,227,212,0.15)' }}>
              <Slider.Range className="absolute h-full" style={{ background: 'rgba(192,57,43,0.45)' }} />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3.5 h-3.5 rounded-full border-2 cursor-grab active:cursor-grabbing focus:outline-none"
              style={{ background: '#c0392b', borderColor: '#e05040' }}
            />
          </Slider.Root>

          <span className="font-mono text-[10px] text-faint shrink-0">{MAX_YEAR}</span>

          <div
            className="font-display font-black text-2xl leading-none shrink-0"
            style={{ color: '#c0392b', letterSpacing: '-1px', minWidth: '52px', textAlign: 'right' }}
          >
            {timelineYear}
          </div>
        </div>
      </div>
    </div>
  );
}
