import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import axiosInstance from '../api/axiosInstance';

const COLOR_PALETTE = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

function formatTimeLabel(ms, stepSec) {
  const d = new Date(ms);
  if (stepSec >= 86400) return d.toLocaleDateString();
  if (stepSec >= 3600) return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' });
  if (stepSec >= 60) return d.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleTimeString();
}

function CustomTick({ x, y, payload, points, stepSec }) {
  // payload.payload is the full data point we created in processed.points
  const point = payload && payload.payload ? payload.payload : null;
  const idx = point && point.__index != null ? point.__index : -1;
  const timeMs = payload && payload.value ? Number(payload.value) : null;
  if (timeMs == null) return null;

  const dateStr = new Date(timeMs).toLocaleDateString();
  const timeStr = new Date(timeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // show date label when first tick or when date changes compared to previous point
  let showDate = false;
  if (idx <= 0) showDate = true;
  else if (points && points[idx - 1]) {
    const prev = new Date(points[idx - 1].time).toDateString();
    const cur = new Date(points[idx].time).toDateString();
    showDate = prev !== cur;
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text x={0} y={0} textAnchor="middle" fontSize={12} fill="#333">{timeStr}</text>
      {showDate && <text x={0} y={14} textAnchor="middle" fontSize={11} fill="#666">{dateStr}</text>}
    </g>
  );
}

function downsample(points, maxPoints = 2000) {
  const n = points.length;
  if (n <= maxPoints) return points;
  const factor = Math.ceil(n / maxPoints);
  const result = [];
  for (let i = 0; i < n; i += factor) {
    const window = points.slice(i, i + factor);
    const aggMetrics = {};
    const metricKeys = new Set();
    window.forEach(w => Object.keys(w.metrics).forEach(k => metricKeys.add(k)));
    metricKeys.forEach(k => {
      let sum = 0;
      let count = 0;
      for (const w of window) {
        const v = w.metrics[k];
        if (v !== null && v !== undefined) {
          sum += v;
          count += 1;
        }
      }
      aggMetrics[k] = count ? sum / count : null;
    });
    result.push({ time: window[Math.floor(window.length / 2)].time, metrics: aggMetrics });
  }
  return result;
}

const UNITS = [
  { label: 'Second', value: 'SECOND' },
  { label: 'Minute', value: 'MINUTE' },
  { label: '30 Minutes', value: 'THIRTY_MINUTES' },
  { label: 'Hour', value: 'HOUR' }
];

export default function AirProjectSeriesPage({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState({});
  
  const [tempStartDate, setTempStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [tempStartHour, setTempStartHour] = useState('00');
  const [tempStartMinute, setTempStartMinute] = useState('00');
  
  const [tempEndDate, setTempEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tempEndHour, setTempEndHour] = useState('23');
  const [tempEndMinute, setTempEndMinute] = useState('59');
  
  const [tempUnit, setTempUnit] = useState('HOUR');
  // start/end are null initially — do not fetch until user clicks Apply
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [unit, setUnit] = useState('HOUR');

  const handleApply = () => {
    const startTime = `${String(tempStartHour).padStart(2, '0')}:${String(tempStartMinute).padStart(2, '0')}`;
    const endTime = `${String(tempEndHour).padStart(2, '0')}:${String(tempEndMinute).padStart(2, '0')}`;
    setStartDateTime(`${tempStartDate}T${startTime}`);
    setEndDateTime(`${tempEndDate}T${endTime}`);
    setUnit(tempUnit);
  };

  useEffect(() => {
    if (!startDateTime || !endDateTime) return; // skip initial mount
    let mounted = true;
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`/pm/projects/${projectId}/series`, {
        params: { startDate: startDateTime, endDate: endDateTime, unit }
      })
      .then(res => {
        if (!mounted) return;
        const data = res.data?.data || res.data;
        console.log('Air Project Series Data:', data);
        setData(data);
        if (data.points && data.points.length > 0) {
          const metricsKeys = Object.keys(data.points[0].metrics || {});
          const init = {};
          metricsKeys.forEach(k => (init[k] = true));
          setVisible(init);
        }
      })
      .catch(err => {
        if (!mounted) return;
        console.error('Failed to fetch series data:', err);
        setError(err?.message || 'Failed to load data');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [projectId, startDateTime, endDateTime, unit]);

  const processed = useMemo(() => {
    if (!data || !data.points) return { points: [], metricKeys: [], stepSec: 60 };
    const pts = downsample(data.points, 2000);
    const pointsForChart = pts.map((p, idx) => {
      const obj = { time: new Date(p.time).getTime(), __timeStr: p.time, __index: idx };
      Object.entries(p.metrics || {}).forEach(([k, v]) => {
        obj[k] = v === null || v === undefined ? undefined : v;
      });
      return obj;
    });
    // 실제 데이터의 metrics 키들을 모두 수집
    const metricKeysSet = new Set();
    data.points.forEach(p => {
      if (p.metrics) Object.keys(p.metrics).forEach(k => metricKeysSet.add(k));
    });
    const metricKeys = Array.from(metricKeysSet);
    return { points: pointsForChart, metricKeys, stepSec: data.stepSec };
  }, [data]);

  const toggle = useCallback((key) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Always render the form and chart area. Data will be empty until Apply is clicked.

  return (
    <div style={{ width: '100%', padding: 12 }}>
      <div style={{ marginBottom: 16, padding: 12, border: '1px solid #ccc', borderRadius: 4 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>Start Date</label>
            <input type="date" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>Hour</label>
              <input 
                type="number" 
                min="0" 
                max="23" 
                value={tempStartHour} 
                onChange={(e) => setTempStartHour(String(parseInt(e.target.value) || 0).padStart(2, '0'))}
                style={{ width: '50px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>Minute</label>
              <input 
                type="number" 
                min="0" 
                max="59" 
                value={tempStartMinute} 
                onChange={(e) => setTempStartMinute(String(parseInt(e.target.value) || 0).padStart(2, '0'))}
                style={{ width: '50px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>End Date</label>
            <input type="date" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>Hour</label>
              <input 
                type="number" 
                min="0" 
                max="23" 
                value={tempEndHour} 
                onChange={(e) => setTempEndHour(String(parseInt(e.target.value) || 0).padStart(2, '0'))}
                style={{ width: '50px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>Minute</label>
              <input 
                type="number" 
                min="0" 
                max="59" 
                value={tempEndMinute} 
                onChange={(e) => setTempEndMinute(String(parseInt(e.target.value) || 0).padStart(2, '0'))}
                style={{ width: '50px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>Unit</label>
            <select value={tempUnit} onChange={(e) => setTempUnit(e.target.value)}>
              {UNITS.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleApply} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Apply
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        {processed.metricKeys.map((k, idx) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={!!visible[k]} onChange={() => toggle(k)} />
            <span style={{ color: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}>{k}</span>
          </label>
        ))}
      </div>

      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processed.points} margin={{ top: 12, right: 24, left: 8, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={<CustomTick points={processed.points} stepSec={processed.stepSec} />}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(val) => new Date(Number(val)).toLocaleString()}
              formatter={(value, name) => [value, name]}
            />
            <Legend />
            {processed.metricKeys.map((k, idx) => (
              visible[k] ? (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  dot={false}
                  stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  isAnimationActive={false}
                  strokeWidth={2}
                  connectNulls
                />
              ) : null
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0' }}>Table (Excel-like)</h3>
        <div style={processed.points.length > 40 ? { maxHeight: 360, overflowY: 'auto', overflowX: 'auto', border: '1px solid #e6e6e6' } : { overflowX: 'auto', border: '1px solid #e6e6e6' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: processed.metricKeys && processed.metricKeys.length ? Math.max(600, processed.metricKeys.length * 120) + 'px' : '100%' }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', top: 0, background: '#fafafa', borderBottom: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Time</th>
                {processed.metricKeys.map(k => (
                  <th key={k} style={{ position: 'sticky', top: 0, background: '#fafafa', borderBottom: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processed.points.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f1f1' }}>
                  <td style={{ padding: 8 }}>{p.__timeStr || new Date(p.time).toLocaleString()}</td>
                  {processed.metricKeys.map(k => (
                    <td key={k} style={{ padding: 8, textAlign: 'right' }}>{p[k] != null ? String(p[k]) : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// TODO: 쿼리문 다시 생각해보기 -> 서버
// TODO: GUEST 권한일때 api 로 로그인 가능하도록 -> 서버