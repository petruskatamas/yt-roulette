# 🎰 YT Roulette — zero-view bingo

A local party game for digging through **YouTube's recycle bin**: the millions of
videos with default filenames, no real titles and ~0 views that the algorithm will
never show anyone.

The TV spins a roulette of default-filename search patterns (`"IMG 3201"`,
`Webcam video from March 4, 2012`, `"My Stupeflix Video"`…), everyone plays bingo
on their own phone, and the first full line wins the round.

Everything runs on your own machine — one `npm` command, no accounts, no cloud.

> The search patterns come from **YouTube's Recycle Bin**, the community research
> project started by **KVN AUST** — a catalogue of default camera filenames,
> ancient picture-mail uploads, editor default titles and other traces of videos
> nobody was ever meant to find. See [Credits](#credits).

## Quick start

```sh
npm install
npm run build && npm start     # production mode — recommended for game night
```

- **TV / host**: open <http://localhost:3000> and screen-share it.
- **Phones**: same Wi-Fi, then scan the per-player QR code shown on the TV
  (it points at your LAN address, e.g. `http://192.168.0.42:3000/#/p/<id>`).

`npm run dev` works too and hot-reloads, but it is noticeably slower on phones.

Requires Node 20+ (developed on 24). No API keys, no database.

## How a night goes

1. **Setup (TV)** — pick a language, add every player by name. Each gets a QR code.
2. **Cards (phones)** — everyone writes their own 5×5 card: 24 predictions of what
   they'll see tonight. Tap a square to edit, drag squares to swap, or auto-fill
   the blanks from a suggestion list. Drafts survive a phone reload.
3. **Spin** — on your turn a big SPIN button appears on your phone; the wheel spins
   on the TV and lands on a category, generating a concrete search query.
4. **Dig** — the built-in search opens full screen, **sorted by fewest views first**,
   so 0-view videos come top. Videos play in-app with channel info (subscribers,
   video count), like count and upload date.
5. **Mark (phones)** — tap a square when you spot it. Every mark pops up as a toast
   on the TV, so claims are public and contestable. The host can open any player's
   card to referee.
6. **Bingo** — the first full row, column or diagonal wins the round. The TV takes
   over with a celebration, shows the winning card, and offers the next round
   (keep cards or write new ones). Wins are tallied across the evening.

## Languages

English, Español, Français, Magyar — switchable from the setup screen for the
whole room. English is the source of truth; adding a language is two files.
See [CONTRIBUTING.md](CONTRIBUTING.md#adding-a-language).

## How it works

One Next.js process serves both screens and holds the game in memory:

```
src/
  app/            pages + API routes (the whole backend)
  server/         state (persistence), rules (marks/claims), http, host, yt (scraping)
  lib/            polling client, i18n, sound synthesis, helpers
  data/           search-pattern generators, bingo logic, challenge lists
  views/          HostView (TV) and PlayerView (phone) — orchestration only
  components/     everything they render
  messages/       one file per language
```

- **Shared state** is a single object mutated by the API routes and persisted to
  `.game/state.json`, so restarting the server never loses a game.
- **Sync** is short polling with a version counter: clients send the version they
  have, and the server answers `{unchanged:true}` (~40 bytes) or the full state.
  No WebSockets, no reconnect logic — a phone that sleeps just resumes.
- **The wheel** decides its outcome before it animates; the 4.4s spin is a CSS
  transition, and all sound is synthesized live with the Web Audio API (no assets).
- **YouTube data** is scraped server-side from the public results/watch/channel
  pages, always in `en-US` so there is one language to parse. Routes return
  locale-neutral data (numbers, ISO dates) and clients format it with `Intl`.

## Known limits

- **The scraper reads YouTube's page structure**, which is unofficial and can break
  if they reshape `ytInitialData`. Every screen falls back to an “open in browser”
  button when a fetch fails.
- **No authentication.** Anyone who has a player's URL can mark that player's card.
  The trust boundary is your living room; don't expose the port to the internet.
- **Single process.** Don't point two servers at the same `.game/` directory.
- **Wake lock** only works in secure contexts, so phones on plain `http://` LAN
  addresses will still dim. The TV (on `localhost`) keeps the screen awake.
- Search queries and the month names used to build them are intentionally **always
  English** — they have to match filenames people actually uploaded.

## Contributing

Issues and PRs welcome — especially **new search patterns** (the heart of the game)
and **translations**. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

This game is only a dice cup — the actual discovery work belongs to the
**YouTube's Recycle Bin** community, whose [keyphrase document][doc] every search
pattern here is derived from.

- **KVN AUST** — founder of the YouTube's Recycle Bin project, author of the
  original keyphrase maps, and creator of the
  [Non-biased Video Searcher](https://github.com/kvnaust/YouTube-NonBiasedVideoSearcher).
- **Michael (Mika_Virus)** — co-discovered the keyphrase method and did the early
  research alongside KVN AUST.
- **180+ community members** listed in the document, who each contributed the
  default filenames that make this searchable at all.

Other tools built by that community — several of which explored zero-view bingo
long before this repo existed:

| Tool                                                                                              | By              |
| ------------------------------------------------------------------------------------------------- | --------------- |
| [Sonder](https://kvnaust.falcontechnix.com/) — 267 formats, bingo mode, deep dive                 | @Chegnus        |
| [Abysstube](https://youtuube.neocities.org/abysstube) · [NoViewTube](https://www.noviewtube.com/) | @juulian97      |
| [Recycle Bin Explorer](https://thearmagan.github.io/youtube-recycle-bin/)                         | @TheArmagan     |
| [Recycle Bin Bingo Helper](https://www.youtuberecyclebin.com/)                                    | @bryanthaboi    |
| [Random 0-View Finder](https://youtube0viewfinder.com/)                                           | @TheRaineMusic  |
| [VideoLandia](https://videolandia.neocities.org/)                                                 | @frodoomsday    |
| [The YouTube Recycle Bin](https://www.smackaay.com/2024/08/05/the-youtube-recycle-bin/)           | @smackaay       |
| [Keyphrase generator](https://youtuberecyclebin.hu/)                                              | @techyarchivuma |

[doc]: https://docs.google.com/document/d/1mV5PhumaIJ8mtH8XmohqXkk5fjK_HlqcineMccPQm5A/edit

## License

[MIT](LICENSE) © Tamás Petruska
