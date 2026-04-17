import React, { memo, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload, label, type = 'line' }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">
        {type === 'line' 
          ? format(parseISO(label), 'MMM d, yyyy')
          : label}
      </div>
      {payload.map((entry, index) => (
        <div key={index} className="tooltip-item" style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name === 'Accuracy' ? '%' : ''}
        </div>
      ))}
    </div>
  );
};

const StatsChart = memo(({ data, type = 'wpm', period = '30d' }) => {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    
    return data.map(item => {
      const date = parseISO(item.completedAt);
      return {
        date: format(date, 'MMM d'),
        fullDate: item.completedAt,
        wpm: item.wpm,
        accuracy: item.accuracy,
        score: item.wpm * (item.accuracy / 100)
      };
    });
  }, [data]);
  
  // Calculate trend line
  const trendData = useMemo(() => {
    if (chartData.length < 2) return [];
    
    // Simple moving average for trend
    const window = Math.min(5, Math.floor(chartData.length / 3));
    return chartData.map((point, index) => {
      const start = Math.max(0, index - window);
      const end = index + 1;
      const slice = chartData.slice(start, end);
      
      return {
        ...point,
        trend: slice.reduce((sum, p) => sum + p[type], 0) / slice.length
      };
    });
  }, [chartData, type]);
  
  // Chart configuration
  const chartConfig = {
    wpm: {
      name: 'WPM',
      color: '#0984e3',
      domain: [0, 'dataMax + 20']
    },
    accuracy: {
      name: 'Accuracy',
      color: '#00b894',
      domain: [0, 100]
    },
    score: {
      name: 'Score',
      color: '#6c5ce7',
      domain: [0, 'dataMax + 50']
    }
  };
  
  const config = chartConfig[type] || chartConfig.wpm;
  
  if (!chartData.length) {
    return (
      <div className="chart-empty">
        <p>No data yet. Complete a typing test to see your progress!</p>
      </div>
    );
  }
  
  return (
    <div className="stats-chart">
      <div className="chart-header">
        <h3>{config.name} Progress</h3>
        <div className="chart-period">
          <span>Last {period === '30d' ? '30 days' : period === '7d' ? '7 days' : 'all time'}</span>
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis 
              domain={config.domain}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip type="line" />} />
            <Legend />
            
            {/* Actual values */}
            <Line
              type="monotone"
              dataKey={type}
              name={config.name}
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            
            {/* Trend line */}
            {trendData.length > 5 && (
              <Line
                type="monotone"
                dataKey="trend"
                name={`${config.name} Trend`}
                stroke={`${config.color}80`}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Quick stats */}
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Best</span>
          <span className="stat-value">
            {Math.max(...chartData.map(d => d[type])).toFixed(1)}
            {type === 'accuracy' ? '%' : ''}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average</span>
          <span className="stat-value">
            {(chartData.reduce((sum, d) => sum + d[type], 0) / chartData.length).toFixed(1)}
            {type === 'accuracy' ? '%' : ''}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Trend</span>
          <span className={`stat-value ${
            chartData[chartData.length - 1][type] >= chartData[0][type] ? 'positive' : 'negative'
          }`}>
            {chartData[chartData.length - 1][type] >= chartData[0][type] ? '↑' : '↓'}
            {Math.abs(chartData[chartData.length - 1][type] - chartData[0][type]).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
});

StatsChart.displayName = 'StatsChart';
export default StatsChart;