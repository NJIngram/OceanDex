export default function OceanDexLogo({
  size = 320,
  animated = true,
  showLabels = true,
  showLegend = true,
}) {
  const viewBoxSize = 320
  const c = viewBoxSize / 2

  const radii = {
    outer: 124,
    vu: 96,
    en: 70,
    cr: 44,
  }

  const statusColors = {
    LC: '#3db8e8',
    VU: '#e8a030',
    EN: '#e86030',
    CR: '#e83030',
  }

  const fishBlips = [
    {
      name: 'Striped Bass',
      status: 'LC',
      angleDeg: 332,
      radius: 112,
      scale: 0.9,
      delay: '0s',
      hasDorsal: false,
    },
    {
      name: 'Horseshoe Crab',
      status: 'VU',
      angleDeg: 40,
      radius: 83,
      scale: 0.88,
      delay: '0.5s',
      hasDorsal: false,
    },
    {
      name: 'Atlantic Sturgeon',
      status: 'EN',
      angleDeg: 305,
      radius: 62,
      scale: 0.85,
      delay: '1s',
      hasDorsal: false,
    },
    {
      name: 'Sand Tiger Shark',
      status: 'CR',
      angleDeg: 18,
      radius: 34,
      scale: 0.82,
      delay: '1.5s',
      hasDorsal: true,
    },
  ]

  const polarToCartesian = (angleDeg, radius) => {
    const theta = (angleDeg * Math.PI) / 180
    return {
      x: c + radius * Math.cos(theta),
      y: c - radius * Math.sin(theta),
    }
  }

  const ringBands = [
    { outer: radii.outer, inner: radii.vu, color: statusColors.LC },
    { outer: radii.vu, inner: radii.en, color: statusColors.VU },
    { outer: radii.en, inner: radii.cr, color: statusColors.EN },
    { outer: radii.cr, inner: 18, color: statusColors.CR },
  ]

  const gridLines = []
  for (let p = 16; p <= 304; p += 18) {
    gridLines.push(
      <line key={`v-${p}`} x1={p} y1="0" x2={p} y2={viewBoxSize} className="grid-line" />
    )
    gridLines.push(
      <line key={`h-${p}`} x1="0" y1={p} x2={viewBoxSize} y2={p} className="grid-line" />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: `${size * 0.22}px`,
        overflow: 'hidden',
        display: 'inline-block',
      }}
      aria-label="OceanDex conservation sonar logo"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        role="img"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="oceandex-bg" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#081828" />
            <stop offset="75%" stopColor="#061422" />
            <stop offset="100%" stopColor="#020d18" />
          </radialGradient>

          <linearGradient id="sweep-trail" x1="160" y1="36" x2="284" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3db8e8" stopOpacity="0" />
            <stop offset="100%" stopColor="#3db8e8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <style>{`
          .grid-line {
            stroke: #3db8e8;
            stroke-opacity: 0.07;
            stroke-width: 0.5;
          }

          .ring-stroke {
            fill: none;
            stroke-width: 0.8;
            stroke-opacity: 0.3;
          }

          .bezel-tick {
            stroke: #3db8e8;
            stroke-width: 1.5;
            stroke-opacity: 0.4;
          }

          .cardinal-label {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            fill: #3db8e8;
            fill-opacity: 0.45;
            letter-spacing: 0.5px;
          }

          .sweep-group {
            transform-origin: 160px 160px;
            animation: oceandex-rotate 8s linear infinite;
          }

          .sweep-group.paused {
            animation: none;
            transform: rotate(0deg);
          }

          .pulse-halo {
            fill: none;
            stroke-width: 1;
            transform-origin: center;
            animation: oceandex-pulse 2s ease-out infinite;
          }

          .fish-label {
            font-family: 'Courier New', monospace;
            font-size: 8px;
            fill: #c8ecff;
            opacity: 0.85;
            letter-spacing: 0.2px;
          }

          .legend-label {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 0.8px;
          }

          @keyframes oceandex-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes oceandex-pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
          }
        `}</style>

        <rect x="0" y="0" width={viewBoxSize} height={viewBoxSize} fill="url(#oceandex-bg)" />

        <g>{gridLines}</g>

        <g>
          {ringBands.map((band) => (
            <circle
              key={`${band.outer}-${band.inner}`}
              cx={c}
              cy={c}
              r={(band.outer + band.inner) / 2}
              fill="none"
              stroke={band.color}
              strokeWidth={band.outer - band.inner}
              strokeOpacity="0.025"
            />
          ))}
        </g>

        <g>
          <circle className="ring-stroke" cx={c} cy={c} r={radii.outer} stroke={statusColors.LC} />
          <circle className="ring-stroke" cx={c} cy={c} r={radii.vu} stroke={statusColors.VU} />
          <circle className="ring-stroke" cx={c} cy={c} r={radii.en} stroke={statusColors.EN} />
          <circle className="ring-stroke" cx={c} cy={c} r={radii.cr} stroke={statusColors.CR} />
        </g>

        <g className={`sweep-group ${animated ? '' : 'paused'}`}>
          <path d={`M ${c} ${c} L ${c} ${c - radii.outer} A ${radii.outer} ${radii.outer} 0 0 1 ${c + radii.outer} ${c} Z`} fill="url(#sweep-trail)" />
          <line x1={c} y1={c} x2={c + radii.outer} y2={c} stroke="#3db8e8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={c} y1={c} x2={c + radii.outer} y2={c} stroke="#9ef0ff" strokeWidth="1" strokeLinecap="round" />
        </g>

        <g>
          {fishBlips.map((blip) => {
            const pos = polarToCartesian(blip.angleDeg, blip.radius)
            const fishColor = statusColors[blip.status]
            const labelDx = pos.x < c ? -56 : 10
            const labelAnchor = pos.x < c ? 'end' : 'start'

            return (
              <g key={blip.name} transform={`translate(${pos.x} ${pos.y}) scale(${blip.scale})`}>
                <circle
                  className="pulse-halo"
                  cx="0"
                  cy="0"
                  r="5"
                  stroke={fishColor}
                  style={{ animationDelay: blip.delay }}
                />
                <ellipse cx="0" cy="0" rx="4.2" ry="2.6" fill={fishColor} />
                <polygon points="-4.2,0 -7,1.9 -7,-1.9" fill={fishColor} />
                {blip.hasDorsal ? <polygon points="0.2,-2.7 2.2,-5.4 3.6,-2.6" fill={fishColor} /> : null}
                <circle cx="1.8" cy="-0.4" r="0.6" fill="#e8fbff" />

                {showLabels ? (
                  <text
                    className="fish-label"
                    x={labelDx / blip.scale}
                    y={-7 / blip.scale}
                    textAnchor={labelAnchor}
                  >
                    {blip.name}
                  </text>
                ) : null}
              </g>
            )
          })}
        </g>

        <g>
          <circle cx={c} cy={c} r="10" fill="none" stroke="#3db8e8" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx={c} cy={c} r="5" fill="#3db8e8" />
          <circle cx={c} cy={c} r="3" fill="#9ef0ff" />
        </g>

        <g>
          <circle cx={c} cy={c} r={radii.outer + 14} fill="none" stroke="#1a3d58" strokeWidth="1.5" />
          <line className="bezel-tick" x1={c} y1={20} x2={c} y2={29} />
          <line className="bezel-tick" x1={c} y1={291} x2={c} y2={300} />
          <line className="bezel-tick" x1={20} y1={c} x2={29} y2={c} />
          <line className="bezel-tick" x1={291} y1={c} x2={300} y2={c} />

          <text className="cardinal-label" x={c} y={16} textAnchor="middle">N</text>
          <text className="cardinal-label" x={c} y={313} textAnchor="middle">S</text>
          <text className="cardinal-label" x={12} y={c + 3} textAnchor="middle">W</text>
          <text className="cardinal-label" x={308} y={c + 3} textAnchor="middle">E</text>
        </g>

        {showLegend ? (
          <g transform="translate(56 286)">
            {[
              { key: 'CR', color: statusColors.CR },
              { key: 'EN', color: statusColors.EN },
              { key: 'VU', color: statusColors.VU },
              { key: 'LC', color: statusColors.LC },
            ].map((item, idx) => {
              const x = idx * 52
              return (
                <g key={item.key} transform={`translate(${x} 0)`}>
                  <circle cx="0" cy="0" r="3.2" fill={item.color} />
                  <text className="legend-label" x="8" y="3" fill={item.color}>{item.key}</text>
                </g>
              )
            })}
          </g>
        ) : null}
      </svg>
    </div>
  )
}