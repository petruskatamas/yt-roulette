import type { Messages } from '../lib/i18n'

const nf = new Intl.NumberFormat('fr-FR')

export const fr: Messages = {
  bcp47: 'fr-FR',
  nativeName: 'Français',
  flag: '🇫🇷',

  common: {
    close: 'Fermer',
    cancel: 'Annuler',
    connecting: 'Connexion…',
    inBrowser: 'Dans le navigateur ↗',
  },

  setup: {
    tagline: 'bingo à zéro vue · une visite de la corbeille de YouTube',
    who: 'Qui joue ?',
    namePlaceholder: 'Nom du joueur…',
    add: 'Ajouter',
    needPlayer: 'Ajoute au moins un joueur',
    start: 'Lancer la partie ▸',
    language: 'Langue',
    rulesTitle: 'Comment jouer',
    rules: [
      'Ajoutez tout le monde ici sur la TV, puis chaque joueur scanne son propre QR code avec son téléphone.',
      'Sur son téléphone, chacun écrit sa propre carte de bingo 5×5 — des choses qu’il parie voir surgir des profondeurs de YouTube (« un anniversaire », « exactement 0 vue », « le chat de quelqu’un »…).',
      'Faites tourner la roue à tour de rôle sur la TV. Elle génère une recherche de vidéos à ~0 vue — sans titre, oubliées.',
      'Ouvrez la recherche, choisissez une vidéo enfouie et regardez-la ensemble. Les joueurs cochent leurs trouvailles sur leur téléphone.',
      'La première ligne, colonne ou diagonale complète — et la TV explose.',
    ],
  },

  join: {
    noLan: 'Aucune adresse réseau trouvée — cet ordinateur doit être sur le même Wi-Fi que les téléphones.',
    scanHint:
      'Scanne-le avec ton téléphone → écris ta propre carte de bingo. Une coche signale une carte envoyée.',
  },

  host: {
    serverDown: 'Serveur injoignable — est-ce que `npm run dev` tourne ?',
    offline: 'connexion au serveur de jeu perdue…',
    connect: 'Rejoindre',
    newGame: 'Nouvelle partie',
    players: 'Joueurs',
    spunBy: (name: string) => `lancé par ${name}`,
    copyTitle: 'Clique pour copier',
    copied: '✓ copié',
    search: 'Rechercher',
    sortedByDate: 'trié par date d’ajout — les plus récentes d’abord',
    spinPrompt: 'Fais tourner la roue !',
    marked: (n: number) => `${n}/24 cochées`,
    writingCard: 'écrit sa carte…',
    bingo: 'BINGO',
    cardOf: (name: string) => `carte de ${name}`,
    stillWriting: 'Écrit encore sa carte…',
  },

  confirm: {
    newGameText:
      'Cela met fin à la partie pour tout le monde : joueurs, cartes et victoires seront effacés. Sûr ?',
    newGameLabel: 'Nouvelle partie',
    redealText:
      'Nouvelle manche avec de nouvelles cartes — chacun réécrit la sienne sur son téléphone. On y va ?',
    redealLabel: 'Nouvelles cartes',
  },

  celebration: {
    title: 'B I N G O !',
    keepCards: 'Nouvelle manche (garder les cartes)',
    newCards: 'Nouvelle manche, nouvelles cartes',
  },

  search: {
    results: '◂ Résultats',
    searching: 'Recherche…',
    noResults: 'Rien trouvé — relancez la roue',
    failed: 'Impossible de récupérer les résultats — ouvre-les dans le navigateur.',
    openInBrowser: 'Ouvrir dans le navigateur ↗',
    playerTitle: 'Lecteur YouTube',
    random: 'Au hasard',
    rolling: 'Tirage…',
  },

  watch: {
    views: (n: number) => `${nf.format(n)} ${n === 1 ? 'vue' : 'vues'}`,
    zeroViews: '0 vue',
    unknownViews: '? vues',
    likes: (n: number) => `${nf.format(n)} j’aime`,
    likesApprox: (s: string) => `${s} j’aime`,
    likesHidden: 'j’aime masqués',
    commentsOff: 'commentaires désactivés',
    subscribers: (n: number) => `${nf.format(n)} ${n === 1 ? 'abonné' : 'abonnés'}`,
    subscribersApprox: (s: string) => `${s} abonnés`,
    subscribersHidden: 'abonnés masqués',
    videos: (n: number) => `${nf.format(n)} ${n === 1 ? 'vidéo' : 'vidéos'}`,
    openChannel: 'Ouvrir la chaîne ↗',
  },

  player: {
    cantReach: 'Impossible de joindre la partie — es-tu sur le même Wi-Fi que la TV ?',
    notInGame:
      'Tu n’es pas dans cette partie (a-t-elle été relancée ?). Demande à l’hôte de t’ajouter, puis rescanne ton QR code.',
    writeCard: 'Écris ta carte de bingo',
    builderIntro:
      '24 choses que tu paries voir dans les vidéos de ce soir. Touche une case pour la modifier, fais-la glisser sur une autre pour les échanger. Les coins et les diagonales comptent dans plus de lignes — mets-y tes valeurs sûres.',
    fill: 'Remplir les vides',
    submit: 'C’est parti ▸',
    save: 'Enregistrer',
    delete: 'Supprimer',
    editPlaceholder: (example: string) => `p. ex. ${example}`,
    waiting: 'en attente du lancement par l’hôte…',
    yourTurn: 'à toi !',
    otherTurn: (name: string) => `${name} lance la roue`,
    spin: 'LANCE !',
    spinning: 'ÇA TOURNE…',
    tvBusy: 'vidéo en cours…',
    bingoBanner: (name: string) => `BINGO — ${name} !`,
    youWon: 'Tu as BINGO — crie-le !',
    markedHint: (n: number) => `${n}/24 cochées · touche une case quand tu la repères`,
    reconnecting: 'reconnexion…',
  },

  card: {
    freeTitle: 'Case gratuite',
  },

  segments: {
    fresh: {
      label: 'Récentes',
      tip: 'Les résultats sont triés par date d’ajout — tu es peut-être le premier humain à les regarder.',
    },
    digicam: {
      label: 'Numérique',
      tip: 'Passe tout ce qui est populaire — le cimetière commence quelques résultats plus bas.',
    },
    ancient: {
      label: 'Antique',
      tip: 'Des fossiles de 2006–2008. Respect supplémentaire pour tout ce qui est encore à 0 vue.',
    },
    gamer: {
      label: 'Gamer',
      tip: 'Captures de jeu nommées automatiquement que personne n’a jamais titrées. Ambiance 2012.',
    },
    chat: {
      label: 'Chat',
      tip: 'Des vidéos échappées de la conversation de groupe de quelqu’un directement sur YouTube.',
    },
    camcorder: {
      label: 'Caméscope',
      tip: 'Directement d’une cassette MiniDV ou d’un DVD gravé à la maison.',
    },
    webcam: {
      label: 'Webcam',
      tip: 'L’âge d’or des monologues à la webcam.',
    },
    world: {
      label: 'Monde',
      tip: 'La corbeille est mondiale. Points bonus si tu ne sais même pas lire le titre.',
    },
    screen: {
      label: 'Écran',
      tip: 'Quelqu’un a enregistré son écran et a oublié pourquoi.',
    },
    phones: {
      label: 'Vieux tél.',
      tip: 'Envoyé depuis un téléphone à touches physiques.',
    },
    editors: {
      label: 'Montage',
      tip: 'Ils ont ouvert un logiciel de montage, exporté avec le nom par défaut, puis disparu.',
    },
    drones: {
      label: 'Drones',
      tip: 'Des images aériennes que personne n’a jamais regardées, quelque part sur Terre.',
    },
    dates: {
      label: 'Dates',
      tip: 'Un titre qui n’est qu’une date. Que s’est-il passé ce jour-là ? Un seul moyen de le savoir.',
    },
    ext: {
      label: 'Fichier',
      tip: 'Quand tout le titre est une extension de fichier, personne ne cherchait des vues.',
    },
    slides: {
      label: 'Diaporama',
      tip: 'Diaporamas photo automatiques avec musique libre de droits. Pure nostalgie.',
    },
    wild: {
      label: 'Joker',
      tip: 'Le zéro vert. Ça peut être n’importe quoi du cimetière entier.',
    },
  },
}
