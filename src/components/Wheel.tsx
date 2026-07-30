import { useRef, useState } from 'react'
import type { Segment } from '../data/patterns'

type Props = {
  segments: Segment[]
  disabled: boolean
  onLand: (segment: Segment) => void
  spinLabel: string
}

const CX = 210
const CY = 210
const R = 200

const polar = (angleDeg: number, r: number) => {
  const a = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) }
}

function segmentPath(i: number, total: number): string {
  const seg = 360 / total
  const a0 = i * seg
  const a1 = (i + 1) * seg
  const p0 = polar(a0, R)
  const p1 = polar(a1, R)
  return `M ${CX} ${CY} L ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y} Z`
}

export function Wheel({ segments, disabled, onLand, spinLabel }: Props) {
  const [rot, setRot] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const targetRef = useRef<Segment | null>(null)
  const seg = 360 / segments.length

  const spin = () => {
    if (spinning || disabled) return
    const idx = Math.floor(Math.random() * segments.length)
    targetRef.current = segments[idx]
    const jitter = (Math.random() - 0.5) * seg * 0.7
    const current = ((rot % 360) + 360) % 360
    const targetAngle = (360 - (idx * seg + seg / 2) + jitter + 360) % 360
    const delta =
      ((targetAngle - current + 360) % 360) + 360 * (4 + Math.floor(Math.random() * 3))
    setRot(rot + delta)
    setSpinning(true)
  }

  const handleEnd = () => {
    if (!spinning) return
    setSpinning(false)
    if (targetRef.current) onLand(targetRef.current)
  }

  return (
    <div className={`wheel-wrap ${spinning ? 'is-spinning' : ''}`}>
      <div className="wheel-pointer">▼</div>
      <div
        className="wheel-rotor"
        style={{
          transform: `rotate(${rot}deg)`,
          transition: spinning
            ? 'transform 4.4s cubic-bezier(0.14, 0.82, 0.09, 1)'
            : 'none',
        }}
        onTransitionEnd={handleEnd}
      >
        <svg viewBox="0 0 420 420" className="wheel-svg" role="img" aria-label="Rulettkerék">
          <circle cx={CX} cy={CY} r={R + 8} fill="#0c0e15" stroke="#d4af37" strokeWidth="4" />
          {segments.map((s, i) => (
            <path key={s.id} d={segmentPath(i, segments.length)} fill={s.color} stroke="#0c0e15" strokeWidth="1.5" />
          ))}
          {segments.map((s, i) => (
            <g key={s.id} transform={`rotate(${i * seg + seg / 2} ${CX} ${CY})`}>
              <text x={CX} y={86} textAnchor="middle" fontSize="34">{s.emoji}</text>
            </g>
          ))}
          <circle cx={CX} cy={CY} r={62} fill="#0c0e15" stroke="#d4af37" strokeWidth="3" />
        </svg>
      </div>
      <button
        className="wheel-spin-btn"
        onClick={spin}
        disabled={spinning || disabled}
      >
        {spinning ? '...' : spinLabel}
      </button>
    </div>
  )
}
