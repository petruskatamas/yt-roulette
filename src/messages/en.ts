const nf = new Intl.NumberFormat('en-US')

export const en = {
  bcp47: 'en-US',
  nativeName: 'English',
  flag: '🇺🇸',

  common: {
    close: 'Close',
    cancel: 'Cancel',
    connecting: 'Connecting…',
    inBrowser: 'In browser ↗',
  },

  setup: {
    tagline: 'zero-view bingo · a tour of YouTube’s recycle bin',
    who: 'Who’s playing?',
    namePlaceholder: 'Player name…',
    add: 'Add',
    needPlayer: 'Add at least one player',
    start: 'Start the game ▸',
    language: 'Language',
    rulesTitle: 'How to play',
    rules: [
      'Add everyone here on the TV, then each player scans their own QR code with their phone.',
      'On their phone everyone writes their own 5×5 bingo card — things they bet will surface from the depths of YouTube (“a birthday party”, “exactly 0 views”, “someone’s cat”…).',
      'Take turns spinning the wheel on the TV. It generates a search for videos with ~0 views — untitled, forgotten.',
      'Open the search, pick a buried video, and watch it together. Players mark their hits on their phones.',
      'The first full row, column or diagonal — and the TV erupts. 🎉',
    ],
  },

  join: {
    noLan: '⚠️ No network address found — this machine must be on the same Wi-Fi as the phones.',
    scanHint: 'Scan it with your phone → write your own bingo card. ✅ = card submitted.',
  },

  host: {
    serverDown: 'Server unreachable — is `npm run dev` running?',
    offline: '⚠️ lost connection to the game server…',
    connect: 'Join',
    newGame: 'New game',
    players: 'Players',
    spunBy: (name: string) => `spun by ${name}`,
    copyTitle: 'Click to copy',
    copied: '✓ copied',
    search: '🔍 Search',
    sortedByDate: 'sorted by upload date — newest first',
    spinPrompt: 'Spin the wheel!',
    marked: (n: number) => `${n}/24 marked`,
    writingCard: '✍️ writing card…',
    bingo: '🏆 BINGO',
    cardOf: (name: string) => `${name}’s card`,
    stillWriting: '✍️ Still writing their card…',
  },

  confirm: {
    newGameText: 'This ends the game for everyone: players, cards and wins are erased. Sure?',
    newGameLabel: 'New game',
    redealText: 'New round with new cards — everyone rewrites theirs on their phone. Go?',
    redealLabel: 'New cards',
  },

  celebration: {
    title: 'B I N G O !',
    keepCards: 'New round (keep cards)',
    newCards: 'New round with new cards',
  },

  search: {
    results: '◂ Results',
    searching: 'Searching…',
    noResults: 'Nothing found — spin again',
    failed: 'Couldn’t fetch the results — open it in the browser.',
    openInBrowser: 'Open in browser ↗',
    playerTitle: 'YouTube player',
  },

  watch: {
    views: (n: number) => `${nf.format(n)} ${n === 1 ? 'view' : 'views'}`,
    zeroViews: '☠️ 0 views',
    unknownViews: '? views',
    likes: (n: number) => `${nf.format(n)} ${n === 1 ? 'like' : 'likes'}`,
    likesApprox: (s: string) => `${s} likes`,
    likesHidden: 'likes hidden',
    commentsOff: '🚫 comments off',
    subscribers: (n: number) => `${nf.format(n)} ${n === 1 ? 'subscriber' : 'subscribers'}`,
    subscribersApprox: (s: string) => `${s} subscribers`,
    subscribersHidden: 'subscribers hidden',
    videos: (n: number) => `${nf.format(n)} ${n === 1 ? 'video' : 'videos'}`,
    openChannel: 'Open channel ↗',
  },

  player: {
    cantReach: 'Can’t reach the game — are you on the same Wi-Fi as the TV?',
    notInGame:
      '🫥 You’re not in this game (was it restarted?). Ask the host to add you, then rescan your QR code.',
    writeCard: 'Write your bingo card',
    builderIntro:
      '24 things you bet will show up in tonight’s videos. Tap a square to edit it, drag it onto another to swap. Corners and diagonals count in more lines — put your safe bets there.',
    fill: '✨ Fill blanks',
    submit: 'Go ▸',
    save: 'Save',
    delete: 'Delete',
    editPlaceholder: (example: string) => `e.g. ${example}`,
    waiting: 'waiting for the host to start…',
    yourTurn: '🎯 your turn!',
    otherTurn: (name: string) => `🎯 ${name} is spinning`,
    spin: 'SPIN!',
    spinning: 'SPINNING…',
    bingoBanner: (name: string) => `🎉 BINGO — ${name}! 🎉`,
    youWon: '🏆 You have BINGO — shout it!',
    markedHint: (n: number) => `${n}/24 marked · tap a square when you spot it`,
    reconnecting: '⚠️ reconnecting…',
  },

  card: {
    freeTitle: 'Free square',
  },

  segments: {
    fresh: {
      label: 'Fresh',
      tip: 'Results are sorted by upload date — you may be the first human ever to watch these.',
    },
    digicam: {
      label: 'Digicam',
      tip: 'Scroll past anything popular — the graveyard starts a few results down.',
    },
    ancient: {
      label: 'Ancient',
      tip: 'These are fossils from 2006–2008. Extra respect for anything still at 0 views.',
    },
    gamer: {
      label: 'Gamer',
      tip: 'Auto-named game captures nobody ever titled. Peak 2012 energy.',
    },
    chat: {
      label: 'Chat',
      tip: 'Videos that escaped someone’s group chat straight onto YouTube.',
    },
    camcorder: {
      label: 'Camcorder',
      tip: 'Straight off a MiniDV tape or a home-burned DVD.',
    },
    webcam: {
      label: 'Webcam',
      tip: 'The golden age of bedroom webcam monologues.',
    },
    world: {
      label: 'World',
      tip: 'The recycle bin is global. Bonus points if you can’t even read the title.',
    },
    screen: {
      label: 'Screen',
      tip: 'Somebody recorded their screen and forgot why.',
    },
    phones: {
      label: 'Old phone',
      tip: 'Uploaded from a phone with physical buttons.',
    },
    editors: {
      label: 'Editors',
      tip: 'They opened an editor, exported with the default name, and vanished.',
    },
    drones: {
      label: 'Drones',
      tip: 'Unwatched aerial footage of somewhere on Earth.',
    },
    dates: {
      label: 'Dates',
      tip: 'A title that is only a date. What happened that day? One way to find out.',
    },
    ext: {
      label: 'File type',
      tip: 'When the whole title is a file extension, nobody was chasing views.',
    },
    slides: {
      label: 'Slideshow',
      tip: 'Automated photo slideshows with royalty-free music. Pure nostalgia.',
    },
    wild: {
      label: 'Joker',
      tip: 'The green zero. Could be anything from the entire graveyard.',
    },
  },
}
