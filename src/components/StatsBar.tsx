import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val}</>;
}

export function StatsBar() {
  const data = useStore((s) => s.data);

  const nat = data.filter((d) => /national/i.test(d.level)).length;
  const st = data.length - nat;
  const withConv = data.filter((d) => /convict/i.test(d.status)).length;
  const pending = data.filter((d) => /trial|investig|charge/i.test(d.status)).length;

  const stats = [
    { n: data.length, label: 'Total entries', red: true },
    { n: nat, label: 'National', red: false },
    { n: st, label: 'State-level', red: false },
    { n: pending, label: 'Under trial / probe', red: false },
    { n: withConv, label: 'Resulted in conviction', red: false },
  ];

  return (
    <div className="flex flex-wrap gap-3 py-5 border-b border-line">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          className="flex-1 min-w-[120px] bg-panel border border-line rounded px-4 py-3"
        >
          <div className={`font-display font-black text-3xl leading-none ${s.red ? 'text-accent' : 'text-ink'}`}>
            <AnimatedNumber target={s.n} />
          </div>
          <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-faint mt-1.5">
            {s.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
