# 🎰 YT Rulett — Zero-View Bingo

A party game for digging through **YouTube's Recycle Bin**: the millions of videos
with default filenames, no real titles, and ~0 views that the algorithm will never
show anyone. The TV spins the wheel and unearths forgotten videos; everyone plays
bingo on their own phone.

Based on the community-researched keyphrase maps from the "YouTube's Recycle Bin"
project (default camera filenames, ancient picture-mail uploads, editor default
titles, etc.).

## Run it

```sh
npm install
npm run dev
```

- **TV / host**: open the `Local` URL (http://localhost:3000) and screen-share it.
- **Phones**: must be on the same Wi-Fi. Each player scans their personal QR code
  shown on the TV (it points at your LAN IP, e.g. `http://192.168.x.x:3000/#/p/<id>`).

Built with Next.js: the UI is a client-side React app served from `src/app/page.tsx`,
the game API lives in `src/app/api/*/route.ts`, and the shared in-memory state
(`src/server/game.ts`) is saved to `.game/state.json` on every change, so a
restart doesn't lose the game.

## How a night goes

1. **Setup (TV)**: add every player by name. A QR code appears per player.
2. **Cards (phones)**: each player scans their QR and **writes their own 5×5
   card** — 24 predictions of what they'll see in the depths of YouTube
   ("a birthday party", "exactly 0 views", "someone's cat"…). `✨ Fill blanks`
   tops up with random suggestions. Center square is free.
3. **Spin (TV)**: hit start, take turns spinning. The wheel lands on a category
   (digicams, camcorders, ancient web, gamer ghosts, wildcard…) and generates a
   concrete search — e.g. `"IMG 3201"` or `Webcam video from March 4, 2012` —
   usually with the date baked into the keyphrase itself; fresh-upload categories
   are pre-sorted newest-first.
4. **Dig**: open the search on the TV, scroll past anything popular, pick a
   buried video, watch it together.
5. **Mark (phones)**: players tap squares they can justify. The host can tap any
   player on the TV to peek at their card and referee.
6. **BINGO**: the moment someone completes a row/column/diagonal, the TV erupts
   in a full-screen celebration (phones get a banner too).

## House rules (pick your poison)

- **Strict**: only the player who spun may mark squares from that video.
- **Chill**: everyone marks from every video (faster games).
- **Judge's call**: the group votes on borderline squares — the TV's card
  inspector exists for exactly this.
- **Sudden death**: tie? Both players spin Wildcard; first to find a true
  0-view video wins.
- **Curator**: keep a shared playlist of the best finds of the night.
