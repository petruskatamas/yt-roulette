import type { Messages } from '../lib/i18n'

const nf = new Intl.NumberFormat('es-ES')

export const es: Messages = {
  bcp47: 'es-ES',
  nativeName: 'Español',
  flag: '🇪🇸',

  common: {
    close: 'Cerrar',
    cancel: 'Cancelar',
    connecting: 'Conectando…',
    inBrowser: 'En el navegador ↗',
  },

  setup: {
    tagline: 'bingo de cero visualizaciones · un paseo por la papelera de YouTube',
    who: '¿Quién juega?',
    namePlaceholder: 'Nombre del jugador…',
    add: 'Añadir',
    needPlayer: 'Añade al menos un jugador',
    start: 'Empezar la partida ▸',
    language: 'Idioma',
    rulesTitle: 'Cómo se juega',
    rules: [
      'Añadid a todo el mundo aquí en la tele y que cada jugador escanee su propio código QR con el móvil.',
      'En su móvil cada uno escribe su propio cartón de bingo de 5×5 — cosas que apuesta que saldrán de las profundidades de YouTube («un cumpleaños», «exactamente 0 visualizaciones», «el gato de alguien»…).',
      'Turnaos para girar la ruleta en la tele. Genera una búsqueda de vídeos con ~0 visualizaciones: sin título, olvidados.',
      'Abrid la búsqueda, elegid un vídeo enterrado y vedlo juntos. Los jugadores marcan sus aciertos en el móvil.',
      'La primera fila, columna o diagonal completa — y la tele estalla.',
    ],
  },

  join: {
    noLan: 'No se ha encontrado dirección de red — este equipo debe estar en el mismo Wi-Fi que los móviles.',
    scanHint:
      'Escanéalo con el móvil → escribe tu propio cartón de bingo. La marca indica un cartón enviado.',
  },

  host: {
    serverDown: 'Servidor inaccesible — ¿está corriendo `npm run dev`?',
    offline: 'se ha perdido la conexión con el servidor…',
    connect: 'Unirse',
    newGame: 'Partida nueva',
    players: 'Jugadores',
    spunBy: (name: string) => `girado por ${name}`,
    copyTitle: 'Haz clic para copiar',
    copied: '✓ copiado',
    search: 'Buscar',
    sortedByDate: 'ordenado por fecha de subida — lo más reciente primero',
    spinPrompt: '¡Gira la ruleta!',
    marked: (n: number) => `${n}/24 marcadas`,
    writingCard: 'escribiendo su cartón…',
    bingo: 'BINGO',
    cardOf: (name: string) => `cartón de ${name}`,
    stillWriting: 'Todavía está escribiendo su cartón…',
  },

  confirm: {
    newGameText:
      'Esto termina la partida para todos: jugadores, cartones y victorias se borrarán. ¿Seguro?',
    newGameLabel: 'Partida nueva',
    redealText:
      'Ronda nueva con cartones nuevos — cada uno reescribe el suyo en el móvil. ¿Vamos?',
    redealLabel: 'Cartones nuevos',
  },

  celebration: {
    title: 'B I N G O !',
    keepCards: 'Ronda nueva (mantener cartones)',
    newCards: 'Ronda nueva con cartones nuevos',
  },

  search: {
    results: '◂ Resultados',
    searching: 'Buscando…',
    noResults: 'No hay nada — girad otra vez',
    failed: 'No se han podido obtener los resultados — ábrelos en el navegador.',
    openInBrowser: 'Abrir en el navegador ↗',
    playerTitle: 'Reproductor de YouTube',
    random: 'Al azar',
    rolling: 'Sorteando…',
  },

  watch: {
    views: (n: number) => `${nf.format(n)} ${n === 1 ? 'visualización' : 'visualizaciones'}`,
    zeroViews: '0 visualizaciones',
    unknownViews: '? visualizaciones',
    likes: (n: number) => `${nf.format(n)} ${n === 1 ? 'me gusta' : 'me gusta'}`,
    likesApprox: (s: string) => `${s} me gusta`,
    likesHidden: 'me gusta ocultos',
    commentsOff: 'comentarios desactivados',
    subscribers: (n: number) => `${nf.format(n)} ${n === 1 ? 'suscriptor' : 'suscriptores'}`,
    subscribersApprox: (s: string) => `${s} suscriptores`,
    subscribersHidden: 'suscriptores ocultos',
    videos: (n: number) => `${nf.format(n)} ${n === 1 ? 'vídeo' : 'vídeos'}`,
    openChannel: 'Abrir el canal ↗',
  },

  player: {
    cantReach: 'No llego a la partida — ¿estás en el mismo Wi-Fi que la tele?',
    notInGame:
      'No estás en esta partida (¿se ha reiniciado?). Pide al anfitrión que te añada y vuelve a escanear tu código QR.',
    writeCard: 'Escribe tu cartón de bingo',
    builderIntro:
      '24 cosas que apuestas que aparecerán en los vídeos de esta noche. Toca una casilla para editarla y arrástrala sobre otra para intercambiarlas. Las esquinas y las diagonales cuentan en más líneas — pon ahí tus apuestas seguras.',
    fill: 'Rellenar huecos',
    submit: 'Vamos ▸',
    save: 'Guardar',
    delete: 'Borrar',
    editPlaceholder: (example: string) => `p. ej. ${example}`,
    waiting: 'esperando a que el anfitrión empiece…',
    yourTurn: '¡te toca!',
    otherTurn: (name: string) => `${name} está girando`,
    spin: '¡GIRA!',
    spinning: 'GIRANDO…',
    tvBusy: 'viendo un vídeo…',
    bingoBanner: (name: string) => `BINGO — ¡${name}!`,
    youWon: 'Tienes BINGO — ¡grítalo!',
    reconnecting: 'reconectando…',
  },

  vote: {
    mode: 'Voto colectivo',
    modeHint: 'las casillas las aprueba el grupo',
    reviewTitle: 'Revisión de casillas',
    claims: (n: number) => `${n} ${n === 1 ? 'casilla por juzgar' : 'casillas por juzgar'}`,
    claimedBy: (name: string) => `${name} reclama`,
    seenIn: (title: string) => `en «${title}»`,
    waitingFor: (n: number) => `${n} ${n === 1 ? 'voto pendiente' : 'votos pendientes'}`,
    decideNow: 'Decidir ahora',
    accepted: 'ACEPTADA',
    rejected: 'RECHAZADA',
    valid: 'Vale',
    invalid: 'No vale',
    yourClaim: 'El grupo está juzgando tu casilla…',
    voted: 'Voto emitido — esperando a los demás…',
    spinBlocked: 'votación en curso…',
  },

  card: {
    freeTitle: 'Casilla gratis',
  },

  segments: {
    fresh: {
      label: 'Recientes',
      tip: 'Los resultados están ordenados por fecha de subida — puede que seas el primer humano en verlos.',
    },
    digicam: {
      label: 'Cámara',
      tip: 'Pasa de largo lo popular — el cementerio empieza unos resultados más abajo.',
    },
    ancient: {
      label: 'Antiguo',
      tip: 'Fósiles de 2006–2008. Respeto extra por cualquier cosa que siga en 0 visualizaciones.',
    },
    gamer: {
      label: 'Gamer',
      tip: 'Capturas de juego con nombre automático que nadie tituló nunca. Puro 2012.',
    },
    chat: {
      label: 'Chat',
      tip: 'Vídeos que escaparon del grupo de chat de alguien directos a YouTube.',
    },
    camcorder: {
      label: 'Videocámara',
      tip: 'Directo de una cinta MiniDV o de un DVD grabado en casa.',
    },
    webcam: {
      label: 'Webcam',
      tip: 'La época dorada de los monólogos de webcam.',
    },
    world: {
      label: 'Mundo',
      tip: 'La papelera es global. Puntos extra si ni siquiera puedes leer el título.',
    },
    screen: {
      label: 'Pantalla',
      tip: 'Alguien grabó su pantalla y olvidó por qué.',
    },
    phones: {
      label: 'Móvil viejo',
      tip: 'Subido desde un teléfono con teclas físicas.',
    },
    editors: {
      label: 'Editores',
      tip: 'Abrieron un editor, exportaron con el nombre por defecto y desaparecieron.',
    },
    drones: {
      label: 'Drones',
      tip: 'Tomas aéreas que nadie ha visto de algún lugar de la Tierra.',
    },
    dates: {
      label: 'Fechas',
      tip: 'Un título que solo es una fecha. ¿Qué pasó ese día? Solo hay una forma de saberlo.',
    },
    ext: {
      label: 'Archivo',
      tip: 'Cuando todo el título es una extensión de archivo, nadie buscaba visitas.',
    },
    slides: {
      label: 'Diapositivas',
      tip: 'Presentaciones automáticas de fotos con música libre de derechos. Pura nostalgia.',
    },
    wild: {
      label: 'Comodín',
      tip: 'El cero verde. Puede ser cualquier cosa del cementerio entero.',
    },
  },
}
