import * as Slider from '@radix-ui/react-slider';
import { useStore } from '../store';

const MIN_YEAR = 1996;
const MAX_YEAR = new Date().getFullYear();

export function TimelineSlider() {
  const { timelineYear, timelineMode, setTimelineYear, setTimelineMode } = useStore();

  return (
    <div
      className="flex flex-col justify-center px-5 shrink-0"
      style={{ width: '320px', borderRight: '1px solid rgba(236,227,212,0.07)' }}
    >
      {/* Label + mode toggle */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-mono text-[9px] tracking-[1.5px] uppercase text-faint">Timeline</span>
        <div className="flex items-center gap-1">
          {(['exact', 'upto'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimelineMode(mode)}
              className="font-mono text-[9px] tracking-[0.5px] uppercase px-2 py-0.5 rounded-sm transition-colors"
              style={{
                background: timelineMode === mode ? 'rgba(192,57,43,0.18)' : 'transparent',
                border: `1px solid ${timelineMode === mode ? '#c0392b' : 'rgba(236,227,212,0.15)'}`,
                color: timelineMode === mode ? '#c0392b' : '#6a6052',
              }}
            >
              {mode === 'exact' ? 'Exact' : 'Up to'}
            </button>
          ))}
        </div>
      </div>

      {/* Slider row */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-faint w-7 shrink-0">{MIN_YEAR}</span>

        <Slider.Root
          className="relative flex items-center flex-1 h-4 cursor-pointer"
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
            className="block w-3 h-3 rounded-full border-2 cursor-grab active:cursor-grabbing focus:outline-none"
            style={{ background: '#c0392b', borderColor: '#e05040' }}
          />
        </Slider.Root>

        <span className="font-mono text-[9px] text-faint w-7 text-right shrink-0">{MAX_YEAR}</span>

        <div
          className="font-display font-black text-xl leading-none shrink-0"
          style={{ color: '#c0392b', letterSpacing: '-0.5px', minWidth: '44px', textAlign: 'right' }}
        >
          {timelineYear}
        </div>
      </div>
    </div>
  );
}
