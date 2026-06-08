# The Indian Ledger

A public archive of Indian corruption and scam cases from 1996 to the present. Built for transparency — every entry is sourced, timestamped, and clearly marked verified or unverified.

**Live:** [the-indian-ledger.vercel.app](https://the-indian-ledger.vercel.app)

---

## What it is

The Indian Ledger is a searchable, filterable database of significant corruption cases, financial scams, and political scandals in India. It covers national-level cases (2G, Coalgate, PNB fraud, electoral bonds) as well as state-level cases across all major states.

The project is read-only by design. No one can edit or submit entries through the site. All additions go through this repository.

---

## Features

- **Interactive India map** — click any state to see cases pinned to it; colour intensity reflects the number of cases per state
- **Timeline slider** — filter by exact year or "up to year" to trace how corruption evolved over time
- **Full-text search** — search by case name, accused, or description
- **Filters** — filter by level (national / state), ruling party at the time, and case status
- **Detail drawer** — click any case for a detailed explanation and source links
- **Export** — download the full dataset as JSON or CSV
- **Supabase backend** — data lives in a Supabase database; the frontend falls back to a seed file if the DB is unreachable

---

## Data principles

- **No invented figures.** Amounts shown are either court-established, CAG-estimated (labelled as such), or widely-cited media estimates (labelled as such).
- **Unverified entries are marked.** Where facts could not be independently confirmed, the entry is marked `verified: false`.
- **Sources cited.** Every entry links to at least one source. Where a source title exists but the URL could not be verified, the URL is left blank rather than guessed.
- **Status is current.** Cases are labelled Convicted / Under trial / Under investigation / Acquitted / Closed / Alleged as of the data's last update.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Map | D3.js (`d3-geo`) + GeoJSON (post-2019 J&K/Ladakh bifurcation) |
| State | Zustand with `persist` middleware |
| Animation | Framer Motion |
| UI primitives | Radix UI |
| Database | Supabase (Postgres, RLS — anon SELECT only) |
| Deployment | Vercel |

---

## Project structure

```
src/
  components/
    MapView.tsx        # D3 India map with state fills and scam pins
    FilterBar.tsx      # Search + filter controls (sticky)
    LedgerList.tsx     # Scrollable list of cases
    DetailDrawer.tsx   # Slide-in case detail panel
    TimelineSlider.tsx # Radix slider for year filtering
    NationalTray.tsx   # National cases list (below map)
    OverviewView.tsx   # Homepage stats
    Navbar.tsx
    Footer.tsx
    AboutView.tsx
  data/
    seed.ts            # Fallback dataset (~132 entries)
  lib/
    supabase.ts        # Supabase client + fetchAllEntries()
    colors.ts          # Party and status colour helpers
    utils.ts           # Export helpers, firstYear()
  store.ts             # Zustand store
  types.ts             # ScamEntry type
public/
  india-states.geojson # Pre-built GeoJSON (736 district features, post-2019 borders)
scripts/
  fetch-geojson.mjs    # Fetches and merges per-state GeoJSONs from udit-001/india-maps-data
```

---

## Running locally

```bash
npm install
```

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
```

If no `.env` is present, the app falls back to the seed data in `src/data/seed.ts`.

---

## Adding or correcting entries

Open an issue or pull request. Each entry must include:

- A verifiable source (court order, CAG report, credible news outlet)
- The correct `verified` flag
- Amounts labelled with what they represent (funds embezzled, CAG presumptive loss, media estimate, etc.)

Entries that cannot be sourced will not be merged.

---

## GeoJSON

The map uses a pre-built `public/india-states.geojson` (736 district-level features) assembled from [udit-001/india-maps-data](https://github.com/udit-001/india-maps-data), which includes the post-2019 bifurcation of Jammu & Kashmir and Ladakh into separate Union Territories.

To rebuild the GeoJSON:

```bash
node scripts/fetch-geojson.mjs
```

---

## License

Data is public domain. Code is MIT.
