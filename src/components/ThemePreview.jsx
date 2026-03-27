import { memo } from 'react'

/**
 * Live mock Power BI dashboard rendered as a single SVG.
 * Updates in real time as theme state changes.
 * Wrapped in React.memo to avoid unnecessary re-renders.
 *
 * Layout (800 × 520):
 *   - Bar chart  (top-left)
 *   - Line chart (top-right)
 *   - KPI card   (bottom-left)
 *   - Table      (bottom-right)
 */
const BG_OPTIONS = [
  { value: '#ffffff', label: 'White' },
  { value: '#e5e5e5', label: 'Light grey' },
  { value: '#1a1a1a', label: 'Black' },
]

const ThemePreview = memo(function ThemePreview({ state, previewBg = '#ffffff', onPreviewBgChange }) {
  const { dataColors, background, foreground, tableAccent, textClasses } = state
  const callout = textClasses.callout
  const title = textClasses.title
  const label = textClasses.label
  const header = textClasses.header

  // Static data used purely for visual demonstration
  const barData = [62, 85, 48, 91, 73]
  const lineData1 = [30, 55, 45, 70, 60, 80, 65]
  const lineData2 = [50, 40, 60, 35, 55, 42, 70]

  const W = 800
  const H = 520
  const pad = 16
  const midX = W / 2
  const midY = H / 2

  // ── Shared helpers ──────────────────────────────────────────────────────────

  const scaleY = (val, max, height, top) =>
    top + height - (val / max) * height

  const polylinePoints = (data, x0, y0, w, h, maxVal) =>
    data.map((v, i) => {
      const x = x0 + (i / (data.length - 1)) * w
      const y = y0 + h - (v / maxVal) * h
      return `${x},${y}`
    }).join(' ')

  // ── Bar chart (top-left quadrant) ────────────────────────────────────────
  const bcLeft = pad + 8
  const bcTop = pad + 28
  const bcW = midX - pad * 2 - 8
  const bcH = midY - pad * 2 - 30
  const barMax = Math.max(...barData) * 1.15
  const barW = (bcW - 20) / barData.length - 6

  const bars = barData.map((v, i) => {
    const bx = bcLeft + 20 + i * (barW + 6)
    const by = scaleY(v, barMax, bcH - 12, bcTop + 8)
    const bh = bcTop + bcH - by
    return { x: bx, y: by, w: barW, h: bh, color: dataColors[0] || '#ccc', val: v }
  })

  // ── Line chart (top-right quadrant) ──────────────────────────────────────
  const lcLeft = midX + pad
  const lcTop = pad + 28
  const lcW = W - midX - pad * 2
  const lcH = midY - pad * 2 - 30
  const lineMax = 100

  // ── KPI card (bottom-left quadrant) ──────────────────────────────────────
  const kpiLeft = pad + 8
  const kpiTop = midY + pad
  const kpiW = midX - pad * 2 - 8
  const kpiH = H - midY - pad * 2

  // ── Table (bottom-right quadrant) ────────────────────────────────────────
  const tLeft = midX + pad
  const tTop = midY + pad
  const tW = W - midX - pad * 2
  const tH = H - midY - pad * 2
  const rowH = 22
  const tableRows = [
    ['North',   '$412K', '↑ 12%'],
    ['South',   '$289K', '↓ 4%'],
    ['East',    '$531K', '↑ 24%'],
    ['West',    '$198K', '↑ 3%'],
  ]
  const colWidths = [tW * 0.45, tW * 0.35, tW * 0.20]

  return (
    <div className="w-full rounded-2xl overflow-hidden border shadow-sm"
      style={{ borderColor: 'var(--border)' }}>

      {/* Preview label bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}
          className="text-xs font-medium">
          Preview — not exact Power BI rendering
        </span>
        <div className="flex items-center gap-3">
          {/* Canvas background switcher */}
          <div className="flex items-center gap-1.5">
            {BG_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                title={label}
                onClick={() => onPreviewBgChange?.(value)}
                className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: value,
                  borderColor: previewBg === value ? 'var(--accent)' : 'var(--border)',
                  boxShadow: value === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined,
                }}
              />
            ))}
            {/* Custom colour picker */}
            <label
              title="Custom colour"
              className="w-4 h-4 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 overflow-hidden relative"
              style={{
                borderColor: !BG_OPTIONS.some(o => o.value === previewBg) ? 'var(--accent)' : 'var(--border)',
                background: !BG_OPTIONS.some(o => o.value === previewBg) ? previewBg : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
              }}
            >
              <input
                type="color"
                className="absolute opacity-0 w-full h-full cursor-pointer"
                style={{ top: 0, left: 0 }}
                value={!BG_OPTIONS.some(o => o.value === previewBg) ? previewBg : '#ff0000'}
                onChange={e => onPreviewBgChange?.(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* SVG dashboard */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ background: previewBg, display: 'block' }}
        aria-label="Theme preview dashboard"
      >
        {/* ── Card backgrounds ─────────────────────────────────────── */}
        <CardBg x={bcLeft - 4} y={bcTop - 24} w={bcW + 8} h={bcH + 32} />
        <CardBg x={lcLeft - 4} y={lcTop - 24} w={lcW + 8} h={lcH + 32} />
        <CardBg x={kpiLeft - 4} y={kpiTop - 4} w={kpiW + 8} h={kpiH + 8} />
        <CardBg x={tLeft - 4} y={tTop - 4} w={tW + 8} h={tH + 8} />

        {/* ── Card titles ──────────────────────────────────────────── */}
        <text x={bcLeft + 2} y={bcTop - 8} fontFamily={title.fontFace} fontSize={11}
          fill={title.fontColor} fontWeight="600">Revenue by Region</text>
        <text x={lcLeft + 2} y={lcTop - 8} fontFamily={title.fontFace} fontSize={11}
          fill={title.fontColor} fontWeight="600">Trend Over Time</text>
        <text x={kpiLeft + 2} y={kpiTop + 12} fontFamily={title.fontFace} fontSize={11}
          fill={title.fontColor} fontWeight="600">Total Revenue</text>
        <text x={tLeft + 2} y={tTop - 8} fontFamily={header.fontFace} fontSize={11}
          fill={header.fontColor} fontWeight="600">Sales by Territory</text>

        {/* ── Bar chart ────────────────────────────────────────────── */}
        {/* Y axis */}
        <line x1={bcLeft + 18} y1={bcTop + 6} x2={bcLeft + 18} y2={bcTop + bcH}
          stroke={foreground} strokeOpacity={0.15} strokeWidth={1} />
        {/* Bars */}
        {bars.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} rx={3} />
            <text x={b.x + b.w / 2} y={b.y - 4} textAnchor="middle"
              fontFamily={label.fontFace} fontSize={9} fill={foreground} fillOpacity={0.6}>
              {b.val}%
            </text>
          </g>
        ))}
        {/* X axis labels */}
        {['N', 'S', 'E', 'W', 'C'].map((l, i) => (
          <text key={i} x={bars[i]?.x + barW / 2} y={bcTop + bcH + 12}
            textAnchor="middle" fontFamily={label.fontFace} fontSize={9} fill={foreground} fillOpacity={0.5}>
            {l}
          </text>
        ))}

        {/* ── Line chart ───────────────────────────────────────────── */}
        <line x1={lcLeft} y1={lcTop + lcH - 8} x2={lcLeft + lcW} y2={lcTop + lcH - 8}
          stroke={foreground} strokeOpacity={0.15} strokeWidth={1} />
        <polyline
          points={polylinePoints(lineData1, lcLeft + 4, lcTop + 8, lcW - 8, lcH - 20, lineMax)}
          fill="none" stroke={dataColors[0]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"
        />
        <polyline
          points={polylinePoints(lineData2, lcLeft + 4, lcTop + 8, lcW - 8, lcH - 20, lineMax)}
          fill="none" stroke={dataColors[1]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="5 3"
        />
        {/* Dots on line 1 */}
        {lineData1.map((v, i) => {
          const x = lcLeft + 4 + (i / (lineData1.length - 1)) * (lcW - 8)
          const y = lcTop + 8 + (lcH - 20) - (v / lineMax) * (lcH - 20)
          return <circle key={i} cx={x} cy={y} r={3} fill={dataColors[0]} />
        })}
        {/* Legend */}
        <circle cx={lcLeft + lcW - 60} cy={lcTop + lcH - 24} r={4} fill={dataColors[0]} />
        <text x={lcLeft + lcW - 52} y={lcTop + lcH - 20} fontFamily={label.fontFace} fontSize={9}
          fill={foreground} fillOpacity={0.6}>Series A</text>
        <line x1={lcLeft + lcW - 20} y1={lcTop + lcH - 22} x2={lcLeft + lcW - 8} y2={lcTop + lcH - 22}
          stroke={dataColors[1]} strokeWidth={2} strokeDasharray="4 2" />
        <text x={lcLeft + lcW - 20} y={lcTop + lcH - 9} fontFamily={label.fontFace} fontSize={9}
          fill={foreground} fillOpacity={0.6}>Series B</text>

        {/* ── KPI card ─────────────────────────────────────────────── */}
        <text x={kpiLeft + kpiW / 2} y={kpiTop + kpiH * 0.48}
          textAnchor="middle" fontFamily={callout.fontFace}
          fontSize={Math.min(callout.fontSize, 52)} fill={callout.fontColor} fontWeight="700">
          $2.4M
        </text>
        <text x={kpiLeft + kpiW / 2} y={kpiTop + kpiH * 0.48 + 22}
          textAnchor="middle" fontFamily={label.fontFace} fontSize={10}
          fill={foreground} fillOpacity={0.55}>
          +18.4% vs last year
        </text>
        {/* Mini sparkline */}
        <polyline
          points={[42,0, 55,0, 48,0, 67,0, 72,0].map((v, i) => {
            const sx = kpiLeft + 20 + i * (kpiW - 40) / 4
            const sy = kpiTop + kpiH - 20 - v * 0.4
            return `${sx},${sy}`
          }).join(' ')}
          fill="none" stroke={dataColors[0]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        />

        {/* ── Table ────────────────────────────────────────────────── */}
        {/* Header row */}
        <rect x={tLeft} y={tTop} width={tW} height={rowH} fill={tableAccent} rx={4} />
        {['Territory', 'Revenue', 'Change'].map((h, ci) => {
          const cx = tLeft + colWidths.slice(0, ci).reduce((a, b) => a + b, 0) + 8
          return (
            <text key={ci} x={cx} y={tTop + rowH - 7}
              fontFamily={header.fontFace} fontSize={10} fill="white" fontWeight="600">
              {h}
            </text>
          )
        })}
        {/* Data rows */}
        {tableRows.map((row, ri) => {
          const ry = tTop + rowH * (ri + 1)
          const isEven = ri % 2 === 1
          return (
            <g key={ri}>
              {isEven && (
                <rect x={tLeft} y={ry} width={tW} height={rowH}
                  fill={tableAccent} fillOpacity={0.06} />
              )}
              {row.map((cell, ci) => {
                const cx = tLeft + colWidths.slice(0, ci).reduce((a, b) => a + b, 0) + 8
                const isChange = ci === 2
                const changeColor = cell.startsWith('↑') ? '#16a34a' : '#dc2626'
                return (
                  <text key={ci} x={cx} y={ry + rowH - 7}
                    fontFamily={label.fontFace} fontSize={10}
                    fill={isChange ? changeColor : foreground}
                    fillOpacity={isChange ? 1 : 0.85}>
                    {cell}
                  </text>
                )
              })}
              {/* Row divider */}
              <line x1={tLeft} y1={ry + rowH} x2={tLeft + tW} y2={ry + rowH}
                stroke={foreground} strokeOpacity={0.06} strokeWidth={1} />
            </g>
          )
        })}
      </svg>
    </div>
  )
})

function CardBg({ x, y, w, h }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx={8}
      fill="white" fillOpacity={0.6}
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.06))' }}
    />
  )
}

export default ThemePreview
