---
name: "FNOL Drilldown"
about: "Adds a drilldown page for the FNOL KPI with chart and details table"

---

### Summary

This PR adds a new Drilldown page for the FNOL KPI. It includes a React/TypeScript component, server-expected API contracts, and docs describing wiring and usage.

### Files added
- src/components/Drilldown/DrilldownPage.tsx
- src/components/Drilldown/index.ts
- docs/FNOL-Drilldown.md

### Implementation notes
- The component uses Material UI and Recharts and expects the backend to provide three endpoints:
  - GET /api/metadata/regions
  - GET /api/kpi/fnol/summary
  - GET /api/kpi/fnol/trend
  - GET /api/fnol/details

### Testing & manual verification
- Pull the branch `feature/fnol-drilldown` and start the app; mock the endpoints if needed.

