export interface Source {
  title: string;
  url: string;
}

export interface ScamEntry {
  id: string;
  name: string;
  level: string;
  year: string;
  party: string;
  status: string;
  amount: number | null;
  amtNote: string;
  people: string;
  desc: string;
  detailedExplanation: string;
  sources: Source[];
  lat?: number;
  lng?: number;
  stateCode?: string;
  verified: boolean;
}
