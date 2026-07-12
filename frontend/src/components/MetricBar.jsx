import React from 'react';

/**
 * Horizontal metric progress bar with label.
 * @param {string} label - Left label
 * @param {string} value - Right value text
 * @param {number} pct - Percentage (0-100)
 * @param {string} color - Bar fill color
 */
const MetricBar = ({ label, value, pct = 0, color = 'var(--accent-color)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
    <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '120px', flexShrink: 0 }}>
      {label}
    </span>
    <div style={{
      flex: 1, height: '8px', backgroundColor: 'var(--border-color)',
      borderRadius: '2px', overflow: 'hidden'
    }}>
      <div style={{
        width: `${Math.min(pct, 100)}%`, height: '100%',
        backgroundColor: color, borderRadius: '2px',
        transition: 'width 0.6s ease'
      }} />
    </div>
    <span style={{
      fontSize: '12px', fontWeight: '600', color: 'var(--text-main)',
      minWidth: '60px', textAlign: 'right'
    }}>
      {value}
    </span>
  </div>
);

export default MetricBar;
