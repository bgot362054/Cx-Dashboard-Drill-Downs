# Add FNOL drilldown React component (DrilldownPage)

This pull request adds a frontend Drilldown page for the FNOL KPI with chart and server-paginated details table.

Files changed (new):
- src/components/Drilldown/DrilldownPage.tsx
- src/components/Drilldown/index.ts
- docs/FNOL-Drilldown.md
- prs/FNOL-DRILLDOWN-PR.md

APIs expected by this component (implement on backend):
- GET /api/metadata/regions
- GET /api/kpi/fnol/summary
- GET /api/kpi/fnol/trend
- GET /api/fnol/details

Notes:
- Uses MUI DataGrid for server-side pagination. Page size is 50.
- Regions list is loaded at mount and falls back to defaults.

