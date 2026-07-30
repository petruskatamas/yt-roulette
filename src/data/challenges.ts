export type Cell = {
  text: string
  marked: boolean
  free?: boolean
}

// Dolgok, amiket kiszúrhatsz a nulla nézettségű videókban.
// Javaslatként szolgálnak a saját kártya írásához.
export const CHALLENGES: string[] = [
  'Pontosan 0 megtekintés',
  '10-nél kevesebb megtekintés',
  '10+ éve feltöltve',
  'Az elmúlt 24 órában feltöltve',
  'Háziállat vagy állat',
  'Szülinap vagy buli',
  'Valaki énekel vagy táncol',
  'Videójáték-felvétel',
  'Álló (függőleges) videó',
  '15 másodpercnél rövidebb',
  '10 percnél hosszabb',
  'Nyelv, amit nem beszélsz',
  'Autó, busz vagy vonat',
  'Osztályterem vagy iskola',
  'Esküvő vagy ünnepség',
  'Élő zene vagy koncert',
  'Gyerekjáték',
  'Eső vagy hó',
  'Valaki nevet',
  'Lefilmezett TV vagy monitor',
  'Étel vagy főzés',
  'Sportolás',
  'Egyáltalán nincs hang',
  'Nagyon remegős vagy homályos kép',
  'Webkamerás videó',
  'Fotó-diavetítés',
  'Csatorna 0 feliratkozóval',
  'Se lájk, se komment',
  'Szürke / fekete / hibás indexkép',
  'Valakinek a kertje vagy udvara',
  'Kisbaba vagy totyogó',
  'Autóból filmezve',
  'Iskolai projekt vagy beadandó',
  'Tűzijáték',
  'Medence, tó vagy tengerpart',
  'Csatorna egyetlen feltöltéssel',
  'Ünnep (karácsony, szilveszter…)',
  'Véletlen zsebfelvétel',
  'Drón- vagy GoPro-felvétel',
  'Valaki integet a kamerába',
  'Zene szól a háttérben',
  'Nálad öregebb videó',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function newCard(): Cell[] {
  const picks = shuffle(CHALLENGES).slice(0, 24)
  const cells: Cell[] = picks.map((text) => ({ text, marked: false }))
  cells.splice(12, 0, { text: 'FREE', marked: true, free: true })
  return cells
}

const LINES: number[][] = [
  // rows
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  // columns
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  // diagonals
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
]

/** Indices of every cell that is part of a completed line */
export function winningCells(cells: Cell[]): Set<number> {
  const won = new Set<number>()
  for (const line of LINES) {
    if (line.every((i) => cells[i]?.marked)) line.forEach((i) => won.add(i))
  }
  return won
}

export const hasBingo = (cells: Cell[]) => winningCells(cells).size > 0
