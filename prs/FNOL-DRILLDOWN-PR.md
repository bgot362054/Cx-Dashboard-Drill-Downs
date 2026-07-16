---
name: "FNOL Drilldown"
about: "Adds a drilldown page for the FNOL KPI with chart and details table"

---

## Summary

This PR adds a new Drilldown page for the FNOL KPI. It includes a React + TypeScript component, a small export wrapper, and documentation describing the expected backend API contracts and how to wire the page into the application.

The drilldown page provides:
- A KPI card that shows the selected month value and percent change vs the previous month, with a trend icon.
- Filters: KPI month picker, chart date range, and region multi-select (regions metadata is fetched from the backend).
- A trend line chart for the selected date range.
- A server-paginated details table (MUI DataGrid) that lists the rows contributing to the KPI.
- A back button to return to the main dashboard.

## Files added
- `src/components/Drilldown/DrilldownPage.tsx` — main React component (filters, KPI card, chart, DataGrid)
- `src/components/Drilldown/index.ts` — simple re-export
- `docs/FNOL-Drilldown.md` — documentation with wiring instructions and API contracts
- `prs/FNOL-DRILLDOWN-PR.md` — PR body (this file)

## Backend API contract (expected)
The front-end component expects these endpoints. Implementations should ensure filters are applied consistently so the KPI value matches the details rows.

- GET /api/metadata/regions
  - Response: array of region codes or objects: `[{ code: 'N', name: 'North' }, 'S', ...]`

- GET /api/kpi/fnol/summary?kpiMonth=YYYY-MM&regions=R1,R2&...otherFilters
  - Response: `{ kpiMonth: '2026-07', value: 1234, previousMonth: 1100, pctChange: 12.36, trend: 'up' }`
  - Notes: `pctChange` can be null when previousMonth is 0 or missing. `trend` should be one of 'up' | 'down' | 'same'.

- GET /api/kpi/fnol/trend?start=YYYY-MM-DD&end=YYYY-MM-DD&regions=...&freq=day|week
  - Response: `[{ date: '2026-06-01', value: 5 }, ...]`

- GET /api/fnol/details?start=YYYY-MM-DD&end=YYYY-MM-DD&regions=...&limit=50&offset=0
  - Response: `{ total: 1234, rows: [ { id, policy_number, region, date, channel, status, ... }, ... ] }`
  - Notes: the DataGrid expects each row to include an `id` field; the component uses server-side pagination.

## How to run & test locally
1. Checkout the branch:
   - git fetch origin feature/fnol-drilldown
   - git checkout feature/fnol-drilldown

2. Install peer dependencies if your app doesn't already include them:
   - npm install @mui/material @mui/icons-material @mui/x-data-grid recharts axios lodash

3. Start the dev server and either implement or mock the backend endpoints above. Example quick mock using json-server or a small express route is fine.

4. Mount the component in your router, e.g.:

```tsx
import DrilldownPage from 'src/components/Drilldown';
<Route path="/drilldown/fnol" element={<DrilldownPage />} />
```

## Acceptance criteria
- KPI value shown on the KPI card equals the count (or metric) derived from the details endpoint for the selected KPI month and filters.
- Chart updates when date range or filters change.
- DataGrid pages load correctly via server-side pagination.
- Regions list loads from /api/metadata/regions and falls back to defaults when missing.

## Suggestions / next steps
- Add column filtering and sorting in the DataGrid and forward those parameters to the details endpoint so users can focus rows and have the KPI update accordingly.
- Add unit tests around the percent-change calculation on the backend (prev=0, prev=null).
- Consider caching KPI results per filter-hash on the server for commonly requested months/filters.

## PR notes
- Ready to merge into `main`.

