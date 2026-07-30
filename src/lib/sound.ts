let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// browsers only allow audio after a user gesture; any tap/click unlocks it
export function initSoundUnlock(): () => void {
  if (typeof window === 'undefined') return () => {}
  const unlock = () => {
    ac()
  }
  document.addEventListener('pointerdown', unlock)
  return () => document.removeEventListener('pointerdown', unlock)
}

function blip(
  time: number,
  freq: number,
  dur: number,
  gain: number,
  type: OscillatorType = 'square',
) {
  const c = ac()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, time)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  osc.connect(g).connect(c.destination)
  osc.start(time)
  osc.stop(time + dur)
}

function noiseBurst(time: number, dur: number, gain: number, highpassHz = 5000) {
  const c = ac()
  if (!c) return
  const len = Math.ceil(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = highpassHz
  const g = c.createGain()
  g.gain.setValueAtTime(gain, time)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  src.connect(filter).connect(g).connect(c.destination)
  src.start(time)
  src.stop(time + dur)
}

// tick times follow the wheel's ease-out: t = ease⁻¹(rotation fraction)
export function wheelTicks(durationS: number, count: number) {
  const c = ac()
  if (!c || c.state !== 'running') return
  const t0 = c.currentTime + 0.05
  for (let i = 1; i <= count; i++) {
    const t = 1 - Math.cbrt(1 - i / count)
    blip(t0 + t * durationS, 1800, 0.03, 0.07)
  }
}

export function pop() {
  const c = ac()
  if (!c || c.state !== 'running') return
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, t)
  osc.frequency.exponentialRampToValueAtTime(180, t + 0.09)
  g.gain.setValueAtTime(0.15, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.1)
}

// spin start: rising filtered-noise sweep
export function whoosh() {
  const c = ac()
  if (!c || c.state !== 'running') return
  const t = c.currentTime
  const dur = 0.7
  const len = Math.ceil(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.1
  filter.frequency.setValueAtTime(250, t)
  filter.frequency.exponentialRampToValueAtTime(2600, t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.001, t)
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.16)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(g).connect(c.destination)
  src.start(t)
  src.stop(t + dur)
}

// soft blip when a mark toast lands on the TV
export function markTick() {
  const c = ac()
  if (!c || c.state !== 'running') return
  blip(c.currentTime, 1400, 0.06, 0.05, 'triangle')
}

export function buzz(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
}

// wheel stop: low thump + rising two-note ding
export function land() {
  const c = ac()
  if (!c || c.state !== 'running') return
  const t = c.currentTime
  blip(t, 110, 0.12, 0.25, 'sine')
  blip(t + 0.03, 987.77, 0.25, 0.1, 'triangle')
  blip(t + 0.14, 1318.5, 0.45, 0.1, 'triangle')
}

// bingo: cymbal crash, C-major run over a bass line, held detuned chord
export function fanfare() {
  const c = ac()
  if (!c || c.state !== 'running') return
  const t0 = c.currentTime + 0.02
  noiseBurst(t0, 0.5, 0.2)
  const melody = [523.25, 659.25, 783.99, 1046.5]
  melody.forEach((f, i) => blip(t0 + i * 0.13, f, 0.35, 0.12, 'triangle'))
  ;[130.81, 196].forEach((f, i) => blip(t0 + i * 0.26, f, 0.4, 0.15, 'sine'))
  melody.forEach((f) => {
    blip(t0 + 0.52, f, 1.2, 0.07, 'triangle')
    blip(t0 + 0.52, f * 1.004, 1.2, 0.05, 'triangle')
  })
  noiseBurst(t0 + 0.52, 0.8, 0.12)
}
