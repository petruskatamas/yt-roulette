export const ri = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const pad = (n: number, len: number) => String(n).padStart(len, '0')

export const pick = <T,>(arr: readonly T[]): T => arr[ri(0, arr.length - 1)]

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

import type { SimpleDate } from '../types'

export const randDate = (yFrom: number, yTo: number): SimpleDate => ({
  y: ri(yFrom, yTo),
  m: ri(1, 12),
  d: ri(1, 28),
})

export const today = (): SimpleDate => {
  const t = new Date()
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }
}

/** 20190412 */
export const compact = ({ y, m, d }: SimpleDate) => `${y}${pad(m, 2)}${pad(d, 2)}`

/** 2019 04 12 */
export const spaced = ({ y, m, d }: SimpleDate) => `${y} ${pad(m, 2)} ${pad(d, 2)}`

/** May 2, 2011 */
export const monthDayY = ({ y, m, d }: SimpleDate) => `${MONTHS[m - 1]} ${d}, ${y}`

/** May 02, 2011 */
export const monthDDY = ({ y, m, d }: SimpleDate) => `${MONTHS[m - 1]} ${pad(d, 2)}, ${y}`

export const hexChar = () => pick(['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
