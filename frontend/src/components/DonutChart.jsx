import React from 'react';

/**
 * Pure SVG Donut Chart with legend.
 * @param {Array} segments - [{ label, value, color }]
 * @param {number} size - Chart diameter in px
 * @param {number} thickness - Ring thickness in px
 * @param {string} centerLabel - Optional center text
 * @param {string} centerValue - Optional center large value
 */
const DonutChart = ({ segments = [], size = 160, thickness = 24, centerLabel = '', centerValue = '' }) => {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulated = 0;

  const arcs = segments
    .filter(seg => seg.value > 0)
    .map((seg, i) => {
      const pct = total > 0 ? seg.value / total : 0;
      const dashLength = circumference * pct;
      const dashOffset = circumference * (1 - accumulated / total);
      accumulated += seg.value;

      return (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={thickness}
          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
        />
      );
    });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={thickness}
          />
          {arcs}
        </svg>
        {/* Center text */}
        {(centerValue || centerLabel) && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            {centerValue && (
              <div style={{
                fontSize: '22px', fontWeight: '700',
                fontFamily: 'var(--font-title)',
                color: 'var(--text-main)'
              }}>
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div style={{
                fontSize: '10px', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {centerLabel}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.filter(seg => seg.value > 0).map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '2px',
              backgroundColor: seg.color, flexShrink: 0
            }} />
            <span style={{ color: 'var(--text-muted)', minWidth: '90px' }}>{seg.label}</span>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{seg.value}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              ({total > 0 ? Math.round((seg.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
