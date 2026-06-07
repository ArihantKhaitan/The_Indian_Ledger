import { ScamEntry } from '../types';

export function firstYear(y: string): number {
  const m = String(y).match(/\d{4}/);
  return m ? +m[0] : 0;
}

export function fmtAmt(n: number | null, note: string): string {
  if (n === null || n === undefined || isNaN(n as number)) {
    return note ? `— (${note})` : '—';
  }
  const v = Number(n);
  let disp: string;
  if (v >= 100000) {
    disp = `₹${(v / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} lakh cr`;
  } else {
    disp = `₹${v.toLocaleString('en-IN')} cr`;
  }
  return disp;
}

export function exportJSON(data: ScamEntry[]): void {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'india-scams-ledger.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportCSV(data: ScamEntry[]): void {
  const cols = ['id', 'name', 'level', 'year', 'party', 'status', 'amount', 'amtNote', 'people', 'desc', 'detailedExplanation', 'sources', 'lat', 'lng', 'stateCode', 'verified'];
  const rows = [cols.join(',')].concat(
    data.map(d => {
      const row = d as unknown as Record<string, unknown>;
      return cols.map(c => {
        let v: string;
        if (c === 'sources') {
          v = JSON.stringify(row[c]);
        } else {
          const val = row[c];
          v = val == null ? '' : String(val);
        }
        return '"' + v.replace(/"/g, '""') + '"';
      }).join(',');
    })
  ).join('\n');
  const blob = new Blob([rows], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'india-scams-ledger.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function nanoid(): string {
  return 'e_' + Math.random().toString(36).slice(2, 9);
}
