import { Search } from 'lucide-react';
import { useStore } from '../store';
import { exportJSON, exportCSV } from '../lib/utils';

export function FilterBar() {
  const { data, filters, setFilter } = useStore();

  const levels = [...new Set(data.map((d) => d.level))].sort();
  const parties = [...new Set(data.map((d) => d.party).filter(Boolean))].sort();
  const statuses = [...new Set(data.map((d) => d.status).filter(Boolean))].sort();

  const selectCls =
    'bg-panel border border-line2 text-ink font-mono text-xs tracking-[0.5px] px-3 py-2.5 rounded cursor-pointer outline-none focus:border-accent hover:border-line2/80 transition-colors';
  const btnCls =
    'bg-panel border border-line2 text-muted font-mono text-xs tracking-[0.5px] px-3 py-2.5 rounded cursor-pointer hover:border-accent hover:text-ink transition-colors flex items-center gap-1.5';

  return (
    <div
      className="flex flex-wrap gap-2 items-center py-4 sticky top-[60px] z-20"
      style={{
        background: 'rgba(20,17,15,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          className="w-full bg-panel border border-line2 text-ink font-body text-[15px] pl-9 pr-3 py-2.5 rounded outline-none focus:border-accent transition-colors placeholder:text-faint"
          placeholder="Search name, person, description…"
          value={filters.query}
          onChange={(e) => setFilter('query', e.target.value)}
        />
      </div>

      <select
        className={selectCls}
        value={filters.level}
        onChange={(e) => setFilter('level', e.target.value)}
      >
        <option value="">All levels</option>
        {levels.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <select
        className={selectCls}
        value={filters.party}
        onChange={(e) => setFilter('party', e.target.value)}
      >
        <option value="">All parties</option>
        {parties.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        className={selectCls}
        value={filters.status}
        onChange={(e) => setFilter('status', e.target.value)}
      >
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        className={selectCls}
        value={filters.sort}
        onChange={(e) => setFilter('sort', e.target.value)}
      >
        <option value="year-desc">Newest first</option>
        <option value="year-asc">Oldest first</option>
        <option value="amt-desc">Largest amount</option>
        <option value="amt-asc">Smallest amount</option>
        <option value="az">A → Z</option>
      </select>

      <button className={btnCls} onClick={() => exportJSON(data)}>
        ⤓ JSON
      </button>
      <button className={btnCls} onClick={() => exportCSV(data)}>
        ⤓ CSV
      </button>
    </div>
  );
}
