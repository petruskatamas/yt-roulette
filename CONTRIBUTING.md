# Contributing

Thanks for wanting to dig around in the graveyard with us.

## Development setup

```sh
npm install
npm run dev          # http://localhost:3000, listens on the LAN too
npm run build        # production build; also type-checks everything
npm run lint         # oxlint
```

There is no test suite. Before opening a PR, please make sure **`npm run build`
passes** (it runs TypeScript) and, if you touched the game loop, that you played
one round end to end: add a player, submit a card, spin, mark a line, start a new
round.

To reset a stuck game, delete `.game/state.json` (it is gitignored).

## What's most welcome

### New search patterns

This is the heart of the game. Patterns live in `src/data/patterns.ts`, grouped
into the 16 wheel segments. A pattern is a function returning a query:

```ts
const digicam: Gen[] = [
  () => ({ query: `"IMG ${pad(ri(0, 9999), 4)}"` }),
  () => ({ query: `"DSCN${pad(ri(0, 9999), 4)}"` }),
]
```

Helpers from `src/lib/rand.ts` stamp in randomness: `ri(min,max)`, `pad(n,len)`,
`pick(list)`, `randDate(fromYear,toYear)` plus date formatters (`compact` →
`20120304`, `spaced` → `2012 03 04`, `monthDayY` → `March 4, 2012`).

Guidelines:

- **Queries stay English.** They match filenames real people uploaded, not UI.
- Quote exact phrases (`"IMG 3201"`); leave bare words unquoted when you want
  YouTube to match loosely.
- Add `sort: 'date'` for patterns that only make sense as brand-new uploads.
- Test it on YouTube first — a pattern that returns nothing but popular videos
  isn't useful.

### Translations

See below. Every string is in one file per language.

### Bingo challenge suggestions

`src/data/challenges/<locale>.ts`. These are only *suggestions* offered while a
player writes their card — they aren't the card. Keep them observable from a
video: “A cat walks through the shot” is checkable, “a good video” isn't.

If you add or remove an entry, do it in **every** language file at the **same
index**, so the lists stay diff-able.

## Adding a language

Two files and three one-line registrations.

1. **Copy `src/messages/en.ts` to `src/messages/<code>.ts`**, translate the values,
   and change the header:

   ```ts
   import type { Messages } from '../lib/i18n'

   const nf = new Intl.NumberFormat('fr-FR')

   export const fr: Messages = {
     bcp47: 'fr-FR',
     nativeName: 'Français',
     flag: '🇫🇷',
     …
   }
   ```

   English is the typed source of truth (`type Messages = typeof en`), so the
   compiler will tell you about any key you miss or misspell. Some values are
   functions — keep the signature and let your language decide whether the word
   inflects:

   ```ts
   views: (n: number) => `${nf.format(n)} ${n === 1 ? 'vue' : 'vues'}`,
   likes: (n: number) => `${nf.format(n)} j’aime`,   // invariable in French
   ```

2. **Copy `src/data/challenges/en.ts` to `src/data/challenges/<code>.ts`** and
   translate all 105 entries **in order**. Keep the same count and index order.

3. **Register it** in three places:

   ```ts
   // src/types.ts
   export type Locale = 'en' | 'hu' | 'fr' | 'es' | '<code>'

   // src/lib/i18n.ts
   const ALL: Record<Locale, Messages> = { en, es, fr, hu, <code> }
   export const LOCALES: Locale[] = ['en', 'es', 'fr', 'hu', '<code>']

   // src/data/challenges.ts
   const LISTS: Record<Locale, string[]> = { en, es, fr, hu, <code> }
   ```

4. `npm run build` — if it compiles, you're done. The language appears in the
   setup-screen dropdown automatically.

Notes:

- Don't put emoji in message strings; the UI supplies its own icons. The one
  exception is the `flag` field used by the language dropdown.
- Numbers and dates are formatted through `Intl` from your `bcp47` value, so you
  don't need to think about separators.

## Code conventions

The project has no formatter config; match the surrounding code:

- 2-space indent, no semicolons, single quotes.
- Comments only for things the code can't say — invariants, non-obvious math,
  why an error is swallowed. No comments that restate the line below them.
- Shared types live in `src/types.ts`, which imports nothing.
- Keep the client/server boundary: `src/server/*` uses Node APIs and is imported
  only by API routes; `src/lib/gameClient.ts` is browser-only. Pure logic that
  both sides need (e.g. `hasBingo`) belongs in `src/data/`.
- API routes return locale-neutral data — numbers and ISO dates, never
  pre-formatted display strings.

## Reporting bugs

Include what you were doing on which screen (TV or phone), what you expected, and
the browser/OS. If it involves search results, paste the query the wheel produced.

If YouTube changed something and the scraper broke, that is a valid bug — say
which of `/api/search`, `/api/video` or `/api/channel` returned wrong or empty
data.
