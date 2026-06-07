import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScamEntry } from './types';
import { SEED } from './data/seed';

export type ActiveView = 'overview' | 'map' | 'ledger' | 'about';

interface Filters {
  query: string;
  level: string;
  party: string;
  status: string;
  sort: string;
}

interface AppState {
  data: ScamEntry[];
  filters: Filters;
  selectedId: string | null;
  timelineYear: number;
  timelineMode: 'exact' | 'upto';
  activeView: ActiveView;

  setFilter: (key: keyof Filters, value: string) => void;
  setSelectedId: (id: string | null) => void;
  setTimelineYear: (year: number) => void;
  setTimelineMode: (mode: 'exact' | 'upto') => void;
  setActiveView: (view: ActiveView) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      data: SEED,
      filters: {
        query: '',
        level: '',
        party: '',
        status: '',
        sort: 'year-desc',
      },
      selectedId: null,
      timelineYear: new Date().getFullYear(),
      timelineMode: 'upto',
      activeView: 'overview',

      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),
      setSelectedId: (id) => set({ selectedId: id }),
      setTimelineYear: (year) => set({ timelineYear: year }),
      setTimelineMode: (mode) => set({ timelineMode: mode }),
      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: 'ledger_india_scams_v2',
      partialize: (state) => ({ data: state.data }),
    }
  )
);
