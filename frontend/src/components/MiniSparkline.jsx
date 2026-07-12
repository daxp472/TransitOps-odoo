import React from 'react';

/**
 * Mini sparkline bar chart for KPI cards.
 * @param {Array} data - Array of numbers (e.g., last 7 days values)
 * @param {string} color - Bar color
 * @param {number} height - Chart height in px
 */
const MiniSparkline = ({ data = [], color = 'var(--accent-color)', height = 28 }) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);

  return (
    <div style={{
      display: 'flex', gap: '2px', alignItems: 'flex-end',
      height, width: '100%', marginTop: '6px'
    }}>
      {data.map((val, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(val / max) * 100}%`,
            backgroundColor: color,
            borderRadius: '1px',
            minHeight: 2,
            opacity: 0.3 + (i / data.length) * 0.7,
            transition: 'height 0.4s ease'
          }}
          title={`${val}`}
        />
      ))}
    </div>
  );
};

export default MiniSparkline;
