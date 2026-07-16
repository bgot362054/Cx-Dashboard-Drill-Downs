import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import debounce from 'lodash/debounce';

type TrendPoint = { date: string; value: number };
type DetailRow = { id: string; policy_number: string; region: string; date: string; [k: string]: any };

export default function DrilldownPage({ onBack }: { onBack?: () => void }) {
  // Filters
  const [kpiMonth, setKpiMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [chartRange, setChartRange] = useState<{ start: string; end: string }>(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 3);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  });
  const [regions, setRegions] = useState<string[]>([]);
  const [kpiSummary, setKpiSummary] = useState<any>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [details, setDetails] = useState<{ total: number; rows: DetailRow[] }>({ total: 0, rows: [] });
  const [page, setPage] = useState(0);

  // Fetch functions
  const fetchKpi = useCallback(async () => {
    try {
      const r = await axios.get('/api/kpi/fnol/summary', {
        params: { kpiMonth, regions: regions.join(',') },
      });
      setKpiSummary(r.data);
    } catch (err) {
      console.error('fetchKpi error', err);
      setKpiSummary(null);
    }
  }, [kpiMonth, regions]);

  const fetchTrend = useCallback(async () => {
    try {
      const r = await axios.get('/api/kpi/fnol/trend', {
        params: { start: chartRange.start, end: chartRange.end, regions: regions.join(',') },
      });
      setTrendData(r.data);
    } catch (err) {
      console.error('fetchTrend error', err);
      setTrendData([]);
    }
  }, [chartRange, regions]);

  const fetchDetails = useCallback(async () => {
    try {
      const r = await axios.get('/api/fnol/details', {
        params: { start: chartRange.start, end: chartRange.end, regions: regions.join(','), limit: 50, offset: page * 50 },
      });
      setDetails(r.data);
    } catch (err) {
      console.error('fetchDetails error', err);
      setDetails({ total: 0, rows: [] });
    }
  }, [chartRange, regions, page]);

  // Debounce combined fetch (when filters change rapidly)
  const debouncedFetchAll = useCallback(
    debounce(() => {
      fetchKpi();
      fetchTrend();
      setPage(0);
      fetchDetails();
    }, 300),
    [fetchKpi, fetchTrend, fetchDetails]
  );

  // effect: run initial fetch and when filters change
  useEffect(() => {
    debouncedFetchAll();
    return () => debouncedFetchAll.cancel();
  }, [kpiMonth, chartRange, regions, debouncedFetchAll]);

  const renderTrendIcon = () => {
    if (!kpiSummary) return null;
    if (kpiSummary.trend === 'up') return <ArrowUpwardIcon color="success" />;
    if (kpiSummary.trend === 'down') return <ArrowDownwardIcon color="error" />;
    return <RemoveIcon color="disabled" />;
  };

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => (onBack ? onBack() : window.history.back())}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          FNOL Drilldown
        </Typography>
      </Box>

      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <Box flex="1" p={2} borderRadius={2} boxShadow={1}>
          <Typography variant="subtitle2">FNOL - {kpiMonth}</Typography>
          <Typography variant="h4">{kpiSummary ? kpiSummary.value : '—'}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {renderTrendIcon()}
            <Typography variant="body2">
              {kpiSummary ? (kpiSummary.pctChange === null ? 'no previous data' : `${kpiSummary.pctChange}%`) : ''}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          <TextField label="KPI Month" type="month" value={kpiMonth} onChange={(e) => setKpiMonth(e.target.value)} />
          <TextField
            label="Chart start"
            type="date"
            value={chartRange.start}
            onChange={(e) => setChartRange((r) => ({ ...r, start: e.target.value }))}
          />
          <TextField
            label="Chart end"
            type="date"
            value={chartRange.end}
            onChange={(e) => setChartRange((r) => ({ ...r, end: e.target.value }))}
          />

          <Select
            multiple
            value={regions}
            onChange={(e) =>
              setRegions(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))
            }
            displayEmpty
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Regions</MenuItem>
            <MenuItem value="N">North</MenuItem>
            <MenuItem value="S">South</MenuItem>
            <MenuItem value="E">East</MenuItem>
            <MenuItem value="W">West</MenuItem>
          </Select>

          <Button
            variant="contained"
            onClick={() => {
              fetchKpi();
              fetchTrend();
              setPage(0);
              fetchDetails();
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>

      <Box height={300} mb={2}>
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1976d2" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box>
        <Typography variant="h6">Details ({details.total})</Typography>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Policy</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Region</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Other</th>
              </tr>
            </thead>
            <tbody>
              {details.rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 8 }}>{r.date}</td>
                  <td style={{ padding: 8 }}>{r.policy_number}</td>
                  <td style={{ padding: 8 }}>{r.region}</td>
                  <td style={{ padding: 8 }}>{JSON.stringify(r.other ?? '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </Box>
  );
}
