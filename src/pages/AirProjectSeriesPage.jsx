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
  const [startDateTime, setStartDateTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [endDateTime, setEndDateTime] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString().slice(0, 16);
  });
  const [unit, setUnit] = useState('HOUR');

  const handleApply = () => {
    const startTime = `${String(tempStartHour).padStart(2, '0')}:${String(tempStartMinute).padStart(2, '0')}`;
    const endTime = `${String(tempEndHour).padStart(2, '0')}:${String(tempEndMinute).padStart(2, '0')}`;
    setStartDateTime(`${tempStartDate}T${startTime}`);
    setEndDateTime(`${tempEndDate}T${endTime}`);
    setUnit(tempUnit);
  };

  useEffect(() => {
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
        // enabledMetrics와 무관하게, 실제 데이터가 있는 모든 메트릭을 표시
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
    const pointsForChart = pts.map(p => {
      const obj = { time: new Date(p.time).getTime() };
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!data) return null;

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
              tickFormatter={(val) => formatTimeLabel(Number(val), processed.stepSec)}
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 12 }}
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
    </div>
  );
}
