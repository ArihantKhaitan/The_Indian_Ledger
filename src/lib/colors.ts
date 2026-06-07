export const PARTY_COLORS: Record<string, string> = {
  "Congress": "#c97a6a",
  "Congress (UPA)": "#c97a6a",
  "BJP": "#e8a23a",
  "BJP (NDA)": "#e8a23a",
  "TMC": "#5fb898",
  "DMK": "#c97ad9",
  "AIADMK": "#86c97a",
  "RJD": "#6a96c9",
  "BSP": "#a89ae0",
  "AAP": "#5ad9d2",
  "NCP": "#d9b87a",
  "JMM": "#8ac97a",
  "UDF / Congress": "#c97a6a",
  "Multiple / various": "#b0a48f",
  "Corporate": "#9a8f7d",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] || "#b0a48f";
}

export function statusColor(status: string): string {
  if (/convict/i.test(status)) return "#c0392b";
  if (/acquit|no charge/i.test(status)) return "#5aa17a";
  if (/trial|investig|charge/i.test(status)) return "#d4a23a";
  if (/policy|struck/i.test(status)) return "#4a86b0";
  return "#7d7468";
}

export function statusBgColor(status: string): string {
  if (/convict/i.test(status)) return "rgba(192,57,43,0.18)";
  if (/acquit|no charge/i.test(status)) return "rgba(90,161,122,0.18)";
  if (/trial|investig|charge/i.test(status)) return "rgba(212,162,58,0.18)";
  if (/policy|struck/i.test(status)) return "rgba(74,134,176,0.18)";
  return "rgba(125,116,104,0.18)";
}
