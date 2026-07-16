# FNOL Drilldown Component

This branch adds a React TypeScript component for an FNOL KPI drilldown page.

Files added:
- src/components/Drilldown/DrilldownPage.tsx - The main React component
- src/components/Drilldown/index.ts - Simple export

What it does
- Renders a KPI card showing the selected KPI month value and percent change vs previous month
- Provides filters: KPI month, chart start/end, and region multi-select
- Shows a trend line chart for the selected date range
- Shows a paginated details table (expects server-side pagination)
- "Back" button returns to previous page via history.back() or an injected `onBack` prop

APIs expected (implement on your backend):
- GET /api/kpi/fnol/summary?kpiMonth=YYYY-MM&regions=R1,R2
- GET /api/kpi/fnol/trend?start=YYYY-MM-DD&end=YYYY-MM-DD&regions=R1,R2
- GET /api/fnol/details?start=YYYY-MM-DD&end=YYYY-MM-DD&regions=R1,R2&limit=50&offset=0

How to wire into your app
1. Install peer deps if not present: @mui/material, @mui/icons-material, recharts, axios, lodash
2. Import the component and add a route, for example with React Router:

```tsx
import DrilldownPage from 'src/components/Drilldown';

<Route path="/drilldown/fnol" element={<DrilldownPage />} />
```

3. Implement the backend endpoints above to return the required JSON shape.

Notes
- This component focuses on frontend behavior and assumes your backend will compute KPI aggregations so that KPI values match the details rows.
- Adjust the table columns and region list to match your data model.
