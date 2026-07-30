import {
  ri, pad, pick, hexChar, randDate, today, compact, spaced,
  monthDayY, monthDDY, MONTHS,
} from '../lib/rand'

export type SortMode = 'date' | 'none'

export type SpinQuery = {
  query: string
  sort: SortMode
  map: string
  tip: string
}

export type Segment = {
  id: string
  label: string
  emoji: string
  color: string
  desc: string
  gen: () => SpinQuery
}

type Gen = () => { query: string; sort?: SortMode; map?: string }

const MAP1 = '1. térkép · vadonatúj (~0 megtekintés)'
const MAP2 = '2. térkép · régi és elfeledett (~0 megtekintés)'
const MAP3 = '3. térkép · őskor (2006–2008)'

export const ytUrl = (query: string, sort: SortMode) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${
    sort === 'date' ? '&sp=CAI%253D' : ''
  }`

// ————— generátorok, a YouTube's Recycle Bin dokumentum térképeiből —————
// (a keresőkifejezések angolok maradnak — a YouTube-on lévő fájlnevekre kell illeszkedniük)

const digicam: Gen[] = [
  () => ({ query: `"IMG ${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"DSC 0${pad(ri(0, 5000), 4)}"` }),
  () => ({ query: `"DSCN${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"DSCF${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"CIMG${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"PICT${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"HPIM${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"IMGP${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"SAM ${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"SANY${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"SDC1${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"100 ${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"101 ${pad(ri(1, 6500), 4)}"` }),
  () => ({ query: `"Picture ${pad(ri(1, 1220), 3)}"` }),
  () => ({ query: `"SUNP${pad(ri(0, 1500), 4)}"` }),
  () => ({ query: `"DSCI${pad(ri(1, 4000), 4)}"` }),
]

const camcorder: Gen[] = [
  () => ({ query: `"MVI ${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"MOV ${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"MOV0${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"VTS 01 ${pad(ri(0, 999), 3)}"` }),
  () => ({ query: `"AVSEQ${pad(ri(0, 99), 2)}"` }),
  () => ({ query: `"M2U0${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"MAH0${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"MOV${pad(ri(0, 3000), 4)}A"` }),
  () => ({ query: `"HDV ${pad(ri(1, 5000), 4)}"` }),
  () => ({ query: `"M4H0${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"REC ${pad(ri(0, 1000), 4)}"` }),
  () => ({ query: `"Video${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"VIDEO TS"` }),
  () => ({ query: `"SDV ${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"Clip${pad(ri(0, 2000), 4)}"` }),
]

const oldPhones: Gen[] = [
  () => ({ query: `"VID0${pad(ri(0, 5000), 4)}"` }),
  () => ({ query: `"Video0${pad(ri(0, 10), 2)}"`, map: MAP3 }),
  () => ({ query: `"MOL0${hexChar()}${ri(0, 9)}"` }),
  () => ({ query: `"CAM0${pad(ri(0, 5000), 4)}"` }),
  () => ({ query: `"Moto_0${pad(ri(0, 999), 3)}"` }),
  () => ({ query: `"Video from my phone"`, map: MAP3 }),
  () => ({ query: `"Sent from my blackberry smartphone"` }),
  () => ({ query: `"This video was uploaded from an Android phone"` }),
  () => ({ query: `"Sprint PictureMail"` }),
  () => ({ query: `"You have new picture mail! (video)"`, map: MAP3 }),
  () => ({ query: `"New Multimedia Message"`, map: MAP3 }),
  () => ({ query: `"Sent using a Sony Ericsson mobile phone"` }),
  () => ({ query: `"sent from my iphone"` }),
  () => ({ query: `"Vid0${pad(ri(0, 10), 2)}"`, map: MAP3 }),
]

const gamer: Gen[] = [
  () => ({ query: `Robloxapp ${compact(randDate(2010, 2024))}` }),
  () => ({ query: `RobloxApp ${spaced(randDate(2010, 2024))}` }),
  () => ({ query: `Bandicam ${spaced(randDate(2011, 2023))}` }),
  () => ({ query: `CODWAWMP ${spaced(randDate(2009, 2022))}` }),
  () => ({ query: `Iw3mp ${compact(randDate(2009, 2019))}` }),
  () => ({ query: `Hl2 ${spaced(randDate(2009, 2022))}` }),
  () => ({ query: `Grand Theft Auto 5 ${spaced(randDate(2014, 2024))}` }),
  () => ({ query: `Javaw ${spaced(randDate(2010, 2023))}` }),
  () => ({ query: `"My great game My great capture"` }),
  () => ({ query: `"Shot with Geforce"` }),
  () => ({ query: `NHL14XBX` }),
  () => ({ query: `Robloxapp`, sort: 'date', map: MAP1 }),
  () => ({ query: `Lv 0`, sort: 'date', map: MAP1 }),
]

const drones: Gen[] = [
  () => ({ query: `"DJI ${pad(ri(0, 2000), 4)}"` }),
  () => ({ query: `"GOPR${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"GP01${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"GX01${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"GH01${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"YDXJ${pad(ri(1, 5000), 4)}"` }),
  () => ({ query: `"AR.Drone 2.0 Video: ${ri(2016, 2020)}"` }),
  () => ({ query: `"AMBA${pad(ri(1, 5000), 4)}"` }),
  () => ({ query: `"Zi6 ${pad(ri(1, 2000), 4)}"` }),
  () => ({ query: `"EKEN00${pad(ri(1, 50), 2)}"` }),
  () => ({ query: `"CADDX0000${pad(ri(1, 50), 2)}"` }),
]

const chatApps: Gen[] = [
  () => ({ query: `WhatsApp Video ${spaced(randDate(2016, 2025))}` }),
  () => ({ query: `WhatsApp Video ${new Date().getFullYear()}`, sort: 'date', map: MAP1 }),
  () => ({ query: `"WA0${pad(ri(0, 999), 3)}"` }),
  () => {
    const d = randDate(2013, 2024)
    return { query: `KakaoTalk Video ${d.y} ${pad(d.m, 2)}` }
  },
  () => ({ query: `"Messenger creation"` }),
  () => ({ query: `AUD-${compact(randDate(2018, 2024))}` }),
  () => ({ query: `"Video from Tweetcaster"` }),
  () => ({ query: `"story_fbid"` }),
  () => ({ query: `"Temp video for share"` }),
  () => ({ query: `"What do you think of this picture?"` }),
]

const fresh: Gen[] = [
  () => ({ query: `IMG` }),
  () => ({ query: `MVI` }),
  () => ({ query: `PXL` }),
  () => ({ query: `FullSizeRender` }),
  () => ({ query: `RPReplay` }),
  () => ({ query: `"My Movie ${ri(1, 20)}"` }),
  () => ({ query: `"My Edited Video"` }),
  () => ({ query: `"Untitled video"` }),
  () => ({ query: `InShot ${compact(today())}` }),
  () => ({ query: `${compact(today())}` }),
  () => ({ query: `VID ${compact(today())}` }),
  () => ({ query: `WIN ${compact(today())}` }),
  () => ({ query: `Desktop ${spaced(today())}` }),
  () => ({ query: `Videoplayback` }),
  () => ({ query: `"Untitled Project"` }),
  () => ({ query: `"Meeting Recording"` }),
  () => ({ query: `/Storage/Emulated/` }),
  () => ({ query: `FILE${pad(ri(0, 9999), 4)}`, sort: 'none', map: MAP2 }),
]

const ancient: Gen[] = [
  () => ({ query: `"Media1.3gp"` }),
  () => ({ query: `"Video.3g2"` }),
  () => ({ query: `"Multimedia Message"` }),
  () => ({ query: `"Video uploaded from my mobile phone"` }),
  () => ({ query: `"using a Flip Video Camcorder"` }),
  () => ({ query: `"using FlipShare"` }),
  () => ({ query: `"muuvee00${pad(ri(0, 40), 2)}"` }),
  () => ({ query: `"0_VIDEO_0${pad(ri(1, 54), 2)}"` }),
  () => ({ query: `"You have received a new message"` }),
  () => ({ query: `"My Great Movie"` }),
  () => ({ query: `"My First Project"` }),
  () => ({ query: `"Click here to change title"` }),
  () => ({ query: `/tmp/upload/` }),
  () => ({ query: `=?utf-8?b` }),
  () => ({ query: `"C:\\Documents and Settings"` }),
  () => ({ query: `"MOV000${pad(ri(0, 10), 2)}"` }),
  () => ({ query: `"You have a PXT from"` }),
  () => ({ query: `"Recorded on ${monthDDY(randDate(2007, 2009))} using a Flip Video Camcorder"` }),
]

const screenRecs: Gen[] = [
  () => ({ query: `mobizen ${compact(randDate(2015, 2024))}` }),
  () => {
    const d = randDate(2018, 2024)
    return { query: `"ScreenRecording ${pad(d.m, 2)} ${pad(d.d, 2)} ${d.y}"` }
  },
  () => {
    const d = randDate(2019, 2025)
    return { query: `"obs ${d.y}-${pad(d.m, 2)}-${pad(d.d, 2)}"` }
  },
  () => {
    const d = randDate(2022, 2024)
    return { query: `XRecorder ${pad(d.d, 2)}${pad(d.m, 2)}${d.y}` }
  },
  () => ({ query: `"Kazam Screencast 000${pad(ri(1, 50), 2)}"` }),
  () => ({ query: `"New Loom Recording"` }),
  () => ({ query: `Screen Recording ${spaced(randDate(2013, 2024))}` }),
  () => ({ query: `Simplescreenrecorder ${spaced(randDate(2023, 2025))}` }),
  () => ({ query: `RPReplay`, sort: 'date', map: MAP1 }),
  () => ({ query: `VLC Record ${spaced(randDate(2011, 2024))}` }),
  () => ({ query: `"my screencast"` }),
  () => ({ query: `"Screencast from"` }),
  () => ({ query: `ScreenRecording`, sort: 'date', map: MAP1 }),
]

const editors: Gen[] = [
  () => ({ query: `"Untitled Video Made with Clipchamp"` }),
  () => ({ query: `"Made with Clipchamp"`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Made with Flexclip"` }),
  () => ({ query: `"Created with Wondershare Filmora"` }),
  () => ({ query: `"Created by Magisto - Magical Video Editor"` }),
  () => ({ query: `"Created with WeVideo"` }),
  () => ({ query: `"created at animoto.com"` }),
  () => ({ query: `"My Videolicious Video"` }),
  () => ({ query: `"I created this video with the YouTube Video Editor"` }),
  () => ({ query: `"My Ezvid Video"` }),
  () => ({ query: `"Copy of Copy of"` }),
  () => ({ query: `"Untitled Design"`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Your Paragraph Text"` }),
  () => ({ query: `"My stop motion movie"` }),
  () => ({ query: `"XiaoYing video"` }),
  () => ({ query: `"Made with Explain Everything"` }),
  () => ({ query: `"Sequence 01 1"` }),
  () => ({ query: `"Untitled Project ${ri(1, 150)}"` }),
]

const dateStamps: Gen[] = [
  () => ({ query: `${compact(randDate(2009, 2024))}` }),
  () => ({ query: `WIN ${compact(randDate(2014, 2024))}` }),
  () => ({ query: `VID ${compact(randDate(2009, 2024))}` }),
  () => ({ query: `Capture ${compact(randDate(2009, 2024))}` }),
  () => ({ query: `Desktop ${spaced(randDate(2015, 2024))}` }),
  () => ({ query: `WP ${compact(randDate(2012, 2016))}` }),
  () => ({ query: `"Video ${compact(randDate(2013, 2024))}"` }),
  () => ({ query: `GMT${compact(randDate(2013, 2023))}` }),
  () => ({ query: `KM ${compact(randDate(2021, 2025))}` }),
  () => ({ query: `YouCut ${compact(randDate(2018, 2024))}` }),
  () => ({ query: `SCR ${compact(randDate(2015, 2017))}` }),
  () => ({ query: `"${monthDDY(randDate(2009, 2014))}"` }),
  () => ({ query: `PXL ${compact(randDate(2021, 2024))}` }),
  () => ({ query: `InShot ${compact(randDate(2017, 2023))}` }),
]

const webcams: Gen[] = [
  () => ({ query: `Webcam ${compact(randDate(2008, 2009))}` }),
  () => ({ query: `"Webcam Recorded Video - ${monthDayY(randDate(2008, 2010))}"` }),
  () => ({ query: `Webcam video ${monthDayY(randDate(2010, 2012))}` }),
  () => ({ query: `Webcam video from ${monthDayY(randDate(2011, 2016))}` }),
  () => ({ query: `"QuickCapture Video - ${monthDayY(randDate(2008, 2012))}"` }),
  () => ({ query: `"Film nagrany kamerą internetową w dniu"` }),
  () => ({ query: `"Video cam direct upload"` }),
  () => ({ query: `"Project of ${ri(1, 28)} ${pick(MONTHS).slice(0, 3)} 2011 PDT"` }),
]

const worldTour: Gen[] = [
  () => ({ query: `"Видео${pad(ri(0, 1000), 4)}"` }),
  () => ({ query: `"Фильм 0${pad(ri(1, 250), 3)}"` }),
  () => ({ query: `"Vídeo${pad(ri(1, 2000), 4)}"` }),
  () => ({ query: `"照片 ${pad(ri(1, 1500), 3)}"` }),
  () => ({ query: `"วิดีโอ0${pad(ri(0, 140), 3)}"` }),
  () => ({ query: `"Filmato 0${pad(ri(1, 120), 3)}"` }),
  () => ({ query: `"Il mio filmato ${ri(1, 100)}"` }),
  () => ({ query: `"Snímek ${pad(ri(1, 300), 3)}"` }),
  () => ({ query: `"Wideo${pad(ri(0, 199), 3)}"` }),
  () => ({ query: `"無題のビデオ"` }),
  () => ({ query: `"のコピー"` }),
  () => ({ query: `"копия видео"` }),
  () => ({ query: `"video senza titolo"` }),
  () => ({ query: `"Sans titre"`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Mój edytowany film"` }),
  () => ({ query: `"Vídeo desde mi teléfono"`, map: MAP3 }),
  () => ({ query: `"Video dari ponsel saya"` }),
  () => ({ query: `"Mijn diavoorstelling"` }),
  () => {
    const d = randDate(2011, 2023)
    return { query: `${d.y}년 ${d.m}월 ${d.d}일` }
  },
  () => {
    const d = randDate(2011, 2023)
    return { query: `${d.y}年${d.m}月${d.d}日` }
  },
  () => ({ query: `"moje upravené video"` }),
  () => ({ query: `"Klip wideo bez tytułu"` }),
  () => ({ query: `"Obraz ${pad(ri(1, 500), 3)}"` }),
  () => ({ query: `"film wideo z telefonu"` }),
]

const fileExt: Gen[] = [
  () => ({ query: `"${pick(['.MP4', '.3gp', '.MOV', '.AVI', '.WMV', '.3g2', '.mpeg', '.WAV', '.FLAC'])}"`, sort: 'date', map: MAP1 }),
  () => ({ query: `"${pick(['.VOB', '.flv', '.webm', '.divx', '.mpg', '.rmvb', '.qt', '.hevc'])}"` }),
  () => ({ query: `"${pad(ri(0, 9999), 4)}.mp4"` }),
  () => ({ query: `"${ri(1, 1000)}.mpg"` }),
  () => ({ query: `"0${pad(ri(0, 2000), 4)}.MTS"` }),
  () => ({ query: `"(${ri(1, 500)}).mpg"` }),
  () => ({ query: `"(${ri(1, 45)}).mkv"` }),
  () => ({ query: `"(${ri(1, 100)}).m2ts"` }),
  () => ({ query: `"Video_ts.vob"` }),
  () => ({ query: `"AVSEQ${pad(ri(0, 99), 2)}.DAT"` }),
  () => ({ query: `"MUSIC0${ri(1, 9)}.DAT"` }),
  () => ({ query: `"Stop motion.avi"` }),
  () => ({ query: `"${ri(0, 100)}.webm"` }),
  () => ({ query: `"${ri(0, 50)}.ogv"` }),
]

const slideshows: Gen[] = [
  () => ({ query: `"My Slideshow"` }),
  () => ({ query: `"My Slideshow ${pad(ri(0, 99), 2)}"` }),
  () => ({ query: `"My Slideshow Video"` }),
  () => ({ query: `"My Stupeflix Video"` }),
  () => ({ query: `"My Stupeflix Video ${pad(ri(0, 1050), 4)}"` }),
  () => ({ query: `"Video created using fotoslides"` }),
  () => ({ query: `"Minha apresentação de slides"` }),
  () => ({ query: `"Fiz este vídeo com o Criador de slides do YouTube"` }),
  () => ({ query: `"I created this video with the YouTube Slideshow Creator"` }),
  () => ({ query: `"My tagged photos in Pummelvision"` }),
  () => ({ query: `"Created using the one true media"` }),
  () => ({ query: `"Slideagram"` }),
  () => ({ query: `"Created with iTimelapse"` }),
  () => ({ query: `Flipagram ${pick(MONTHS)} ${ri(2014, 2018)}` }),
  () => ({ query: `"My Vidrhythm"` }),
]

const oddballs: Gen[] = [
  () => ({ query: `bmdjAAAF`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Com Oculus Vrshell"`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Com Oculus Metacam"`, sort: 'date', map: MAP1 }),
  () => ({ query: `Recording gvo`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Portrait Video Nanny Canon"`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Video Assignment"`, sort: 'date', map: MAP1 }),
  () => ({ query: `"Test upload"` }),
  () => ({ query: `"Recovered Autosave"` }),
  () => ({ query: `"vlcsnap"` }),
  () => ({ query: `"Generated File"` }),
  () => ({ query: `"Dvgrab"` }),
  () => ({ query: `"Ring FrontDoor"` }),
  () => ({ query: `"RingVideo"` }),
  () => ({ query: `"100MEDIA"` }),
  () => ({ query: `"DVD_VIDEO_RECORDER"` }),
  () => ({ query: `"VR_MOVIE.VRO"` }),
  () => ({ query: `NVEExport` }),
  () => ({ query: `"HNI 0${pad(ri(0, 100), 3)}"` }),
  () => ({ query: `"My Project ${ri(0, 50)}"` }),
  () => ({ query: `"Meeting in General"` }),
  () => ({ query: `"SSP${pad(ri(1, 2000), 5)}"` }),
  () => ({ query: `"ZOOM0${pad(ri(1, 800), 3)}"` }),
  () => ({ query: `"im000${pad(ri(1, 899), 3)}"` }),
  () => ({ query: `"Axon Body 2 Video"` }),
  () => ({ query: `"MicrosoftTeams Video"` }),
  () => ({ query: `"Moviemakeronline com"` }),
  () => ({ query: `"My Video HD ${ri(1, 100)}"` }),
  () => ({ query: `"Kava Injected"` }),
]

// ————— a kerék —————

const RED = '#c1121f'
const BLACK = '#191c26'
const GREEN = '#1f7a4d'

type SegDef = {
  id: string
  label: string
  emoji: string
  desc: string
  pool: Gen[]
  map: string
  tip: string
}

const DEFS: SegDef[] = [
  {
    id: 'fresh', label: 'Friss', emoji: '🍼',
    desc: 'Percekkel ezelőtt feltöltött videók, nulla megtekintésre ítélve',
    pool: fresh, map: MAP1,
    tip: 'A találatok feltöltési idő szerint vannak rendezve — lehet, hogy te vagy az első ember, aki valaha látja őket.',
  },
  {
    id: 'digicam', label: 'Digikamera', emoji: '📷',
    desc: '2000-es évekbeli digitális fényképezőgépek alapértelmezett fájlnevei',
    pool: digicam, map: MAP2,
    tip: 'Görgess túl mindenen, ami népszerű — a temető pár találattal lejjebb kezdődik.',
  },
  {
    id: 'ancient', label: 'Őskor', emoji: '🦖',
    desc: '2009 előtti kamerás mobilok, MMS-ek és Flip kamerák',
    pool: ancient, map: MAP3,
    tip: 'Ezek 2006–2008-as kövületek. Külön respekt mindenért, ami ennyi év után is 0 megtekintésen áll.',
  },
  {
    id: 'gamer', label: 'Gamer', emoji: '🕹️',
    desc: 'Elfeledett Roblox-, Bandicam- és CoD-felvételek',
    pool: gamer, map: MAP2,
    tip: 'Automatikusan elnevezett játékfelvételek, amiknek soha senki nem adott címet. Tiszta 2012.',
  },
  {
    id: 'chat', label: 'Chat', emoji: '💬',
    desc: 'WhatsApp-, KakaoTalk- és Messenger-exportok',
    pool: chatApps, map: MAP2,
    tip: 'Videók, amik valakinek a csoportcsetjéből egyenesen a YouTube-ra szöktek.',
  },
  {
    id: 'camcorder', label: 'Kamkorder', emoji: '📼',
    desc: 'Kazettás kamerák, DVD-rippek és VTS-fájlok',
    pool: camcorder, map: MAP2,
    tip: 'Egyenesen egy MiniDV-kazettáról vagy egy otthon írt DVD-ről.',
  },
  {
    id: 'webcam', label: 'Webkamera', emoji: '🎥',
    desc: 'Szemcsés webkamerás feltöltések 2008–2016-ból',
    pool: webcams, map: MAP2,
    tip: 'A hálószobai webkamerás monológok aranykora.',
  },
  {
    id: 'world', label: 'Nagyvilág', emoji: '🌍',
    desc: 'Alapértelmezett fájlnevek más nyelveken',
    pool: worldTour, map: MAP2,
    tip: 'A lomtár globális. Bónuszpont, ha a címet sem tudod elolvasni.',
  },
  {
    id: 'screen', label: 'Képernyő', emoji: '🖥️',
    desc: 'OBS-, Loom-, mobizen- és képernyőfelvételek',
    pool: screenRecs, map: MAP2,
    tip: 'Valaki felvette a képernyőjét, aztán elfelejtette, minek.',
  },
  {
    id: 'phones', label: 'Régi mobil', emoji: '📱',
    desc: 'BlackBerry-, Motorola- és korai Android-feltöltések',
    pool: oldPhones, map: MAP2,
    tip: 'Olyan telefonról feltöltve, aminek még gombjai voltak.',
  },
  {
    id: 'editors', label: 'Szerkesztő', emoji: '🎬',
    desc: 'Clipchamp, Magisto, Filmora alapértelmezett címek',
    pool: editors, map: MAP2,
    tip: 'Megnyitottak egy vágóprogramot, alapnéven exportáltak, és eltűntek.',
  },
  {
    id: 'drones', label: 'Drónok', emoji: '🚁',
    desc: 'DJI-, GoPro- és akciókamera-fájlok',
    pool: drones, map: MAP2,
    tip: 'Sosem látott légifelvétel a Föld egy pontjáról.',
  },
  {
    id: 'dates', label: 'Dátumok', emoji: '📅',
    desc: 'Csupasz ÉÉÉÉHHNN dátumcímek',
    pool: dateStamps, map: MAP2,
    tip: 'Egy cím, ami csak egy dátum. Mi történt aznap? Egy módon derül ki.',
  },
  {
    id: 'ext', label: 'Fájltípus', emoji: '🧩',
    desc: 'Nyers fájlkiterjesztés-címek (.MP4, .3gp, .VOB)',
    pool: fileExt, map: MAP2,
    tip: 'Ha a teljes cím egy fájlkiterjesztés, ott senki nem hajtott a nézettségre.',
  },
  {
    id: 'slides', label: 'Diavetítés', emoji: '💾',
    desc: 'Stupeflix, Animoto és a diavetítő-gépek',
    pool: slideshows, map: MAP2,
    tip: 'Automata fotó-diavetítések jogdíjmentes zenével. Színtiszta nosztalgia.',
  },
  {
    id: 'wild', label: 'Joker', emoji: '🔮',
    desc: 'Bármi a teljes lomtárból — vagy valami még furább',
    pool: [], // lentebb töltjük fel
    map: MAP2,
    tip: 'A zöld nulla. Bármi lehet az egész temetőből.',
  },
]

const allPools = DEFS.filter((d) => d.id !== 'wild').map((d) => d.pool)
DEFS[DEFS.length - 1].pool = [
  ...oddballs,
  ...oddballs, // a fura kifejezések 2x súllyal a teljes merítéshez képest
  () => pick(pick(allPools))(),
]

export const SEGMENTS: Segment[] = DEFS.map((d, i) => ({
  id: d.id,
  label: d.label,
  emoji: d.emoji,
  desc: d.desc,
  color: d.id === 'wild' ? GREEN : i % 2 === 0 ? RED : BLACK,
  gen: () => {
    const g = pick(d.pool)()
    const map = g.map ?? d.map
    const sort = g.sort ?? (map === MAP1 ? 'date' : 'none')
    return { query: g.query, sort: sort as SortMode, map, tip: d.tip }
  },
}))
