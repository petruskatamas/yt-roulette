import { useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import type { Segment } from '@/types'
import { land, wheelTicks, whoosh } from '@/lib/sound'

export type WheelHandle = { spin: () => void }

type Props = {
  segments: Segment[]
  onLand: (segment: Segment) => void
  ref?: Ref<WheelHandle>
}

const SPIN_S = 4.4
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

export function Wheel({ segments, onLand, ref }: Props) {
  const [rot, setRot] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [landedId, setLandedId] = useState<string | null>(null)
  const targetRef = useRef<Segment | null>(null)
  const seg = 360 / segments.length

  const spin = () => {
    if (spinning) return
    const idx = Math.floor(Math.random() * segments.length)
    targetRef.current = segments[idx]
    const jitter = (Math.random() - 0.5) * seg * 0.7
    const current = ((rot % 360) + 360) % 360
    const targetAngle = (360 - (idx * seg + seg / 2) + jitter + 360) % 360
    const delta =
      ((targetAngle - current + 360) % 360) + 360 * (4 + Math.floor(Math.random() * 3))
    setRot(rot + delta)
    setSpinning(true)
    setLandedId(null)
    whoosh()
    wheelTicks(SPIN_S, Math.floor(delta / seg))
  }

  useImperativeHandle(ref, () => ({ spin }))

  const handleEnd = () => {
    if (!spinning) return
    setSpinning(false)
    setLandedId(targetRef.current?.id ?? null)
    land()
    if (targetRef.current) onLand(targetRef.current)
  }

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer">▼</div>
      <div
        className="wheel-rotor"
        style={{
          transform: `rotate(${rot}deg)`,
          transition: spinning
            ? `transform ${SPIN_S}s cubic-bezier(0.14, 0.82, 0.09, 1)`
            : 'none',
        }}
        onTransitionEnd={handleEnd}
      >
        <svg viewBox="0 0 420 420" className="wheel-svg" role="img" aria-label="Rulettkerék">
          <circle cx={CX} cy={CY} r={R + 8} fill="#0c0e15" stroke="#d4af37" strokeWidth="4" />
          {segments.map((s, i) => (
            <path
              key={s.id}
              d={segmentPath(i, segments.length)}
              fill={s.color}
              stroke="#0c0e15"
              strokeWidth="1.5"
              className={landedId === s.id ? 'is-landed' : undefined}
            />
          ))}
          {segments.map((s, i) => (
            <g key={s.id} transform={`rotate(${i * seg + seg / 2} ${CX} ${CY})`}>
              <text x={CX} y={86} textAnchor="middle" fontSize="34">{s.emoji}</text>
            </g>
          ))}
          <circle cx={CX} cy={CY} r={62} fill="#0c0e15" stroke="#d4af37" strokeWidth="3" />
        </svg>
      </div>
      <button className="wheel-spin-btn" onClick={spin} disabled={spinning}>
        {spinning ? '...' : 'SPIN'}
      </button>
    </div>
  )
}
