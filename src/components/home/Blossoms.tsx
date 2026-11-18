// Branche fleurie décorative (fleurs à cinq pétales), pour habiller les visuels sans photo.

function Flower({ x, y, r, rotate = 0, tone = '#fff' }: { x: number; y: number; r: number; rotate?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.55} rx={r * 0.42} ry={r * 0.6} fill={tone} opacity="0.95" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.22} fill="#E9C9A0" />
      <circle r={r * 0.1} fill="#C99A6B" />
    </g>
  );
}

export function Blossoms({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 260 220"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      {/* Branches */}
      <path d="M250 210 C 200 170, 170 120, 120 95 S 40 60, 10 20" fill="none" stroke="#8C6E62" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      <path d="M150 112 C 160 80, 185 60, 215 50" fill="none" stroke="#8C6E62" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <path d="M80 72 C 85 105, 70 130, 50 150" fill="none" stroke="#8C6E62" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      {/* Bourgeons */}
      <circle cx="215" cy="50" r="5" fill="#F3DCE4" />
      <circle cx="50" cy="150" r="4.5" fill="#F3DCE4" />
      <circle cx="12" cy="22" r="4" fill="#F7E6EC" />
      {/* Fleurs */}
      <Flower x={120} y={95} r={26} rotate={10} />
      <Flower x={175} y={68} r={20} rotate={-15} tone="#FBEFF3" />
      <Flower x={62} y={58} r={18} rotate={25} />
      <Flower x={200} y={150} r={22} rotate={5} tone="#FBEFF3" />
      <Flower x={70} y={122} r={15} rotate={-20} tone="#FDF6F8" />
      <Flower x={32} y={36} r={11} rotate={40} />
    </svg>
  );
}
