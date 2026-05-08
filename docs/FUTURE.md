# Future improvements (not in scope for v1)

This file is the **parking lot for deferred features and dormant architecture**
— things we know we want or have already built but are intentionally idle until
a trigger condition is met. See `CLAUDE.md` → "About `docs/FUTURE.md`" for the
full convention.

The current site is **frontend-only** and **stateless** — every visitor gets a
fresh quiz each time. The architecture leaves room for the following features
without rewriting:

## 0. Multi-level navigation (built, dormant — flips on automatically)

The whole collège-to-lycée hierarchy is wired and tested. While only **4ème** is
`available`, two pieces of UI are gated behind a single boolean check:

- **Level picker on `/`** — `src/pages/index.astro` redirects to the only
  available level. The picker code is intact and re-renders cards for every
  entry in `LEVELS` once 2+ levels are flagged available. No edits required.
- **Level-page topbar** — `src/pages/[level]/index.astro` hides the
  `← Niveaux | / <Level>` topbar when only one level is available (the link
  would just bounce back via the redirect). Auto-restores via the same
  `LEVELS.filter(l => l.available).length > 1` check.

**To activate the multi-level UI:** flip a second level's `available` to `true`
in `src/data/levels.ts` and add `topicsModule: () => import('./quizzes/<level>/index')`.
Both the level picker and the level-page topbar wake up automatically.

The dormant pieces to be aware of:

- `src/pages/index.astro` — full level-picker grid, currently bypassed.
- `src/pages/[level]/index.astro` — topbar suppression flag (`showLevelTopbar`).
- `src/data/levels.ts` — registry of all 7 levels (6ᵉ → Terminale) with
  `available: false` placeholder entries.
- `src/pages/[level]/index.astro` — for un-`available` levels, this already
  renders a "Ce niveau sera bientôt disponible." placeholder, so direct URL
  hits (`/3eme`, `/2nde`, …) won't 404.

When the second level is added, **remove the dormant note for the level picker
and topbar from this file** — those features are no longer dormant.

## 0a. Per-quiz audit follow-ups (4ème) — *resolved 2026-05-08*

The high-priority deviations surfaced during the final 1:1 audit have been
fixed. Remaining "improvement-only" items live in section 0b below. The
following are kept as a paper trail of what changed:

- ~~Thalès title gradient: drop `titleSub`~~ ✓ done in `src/data/quizzes/4eme/thales.ts`
- ~~Pyth completer `<strong>` tags lost~~ ✓ done — `problemText` uses
  `dangerouslySetInnerHTML` now
- ~~Pyth `correctFigABC` bold missing-side~~ ✓ done with `<tspan font-weight="bold">`
- ~~Empty-input on submit~~ ✓ done — `Quiz.tsx`'s `submit` early-returns when
  the value is empty (matches the original "refocus, do nothing" behaviour);
  multi-input renderers are unaffected because they pass `correctOverride`.
- ~~Component instance state on Quiz reset~~ ✓ done via a `seriesKey` bumped on
  Recommencer / Nouvelle série, used as the React `key` on every rendered
  question so all renderers remount and clear their internal state.
- ~~Fractions-comp prime-fac Large variant styling~~ ✓ done — `primeFacExercise`
  takes a `large: boolean` and emits `opacity:.35; font-weight:600` for the
  Large variant; regular keeps `opacity:.4` no-weight.
- ~~Fractions sub-quiz "Calculs complexes →" button~~ ✓ done — `fractions-complex`
  ported as a hidden sub-quiz at `/4eme/fractions-complex` with the 12-question
  bank; bidirectional buttons wired on both fractions and fractions-complex.

## 0b. Audit follow-ups deferred (improvements / cosmetic)

These are real deviations the audit surfaced but they're either visual-only
minor differences or arguable improvements over the prior behaviour. Listed
here so they don't get lost — pick them up if/when polish becomes a priority:

- **`<h1>` vs `<div>` for `.er-title`** — `Quiz.tsx` uses `<h1>` for
  semantics; the prior prototype used `<div>`. Visually identical via the
  shared class. Keep `<h1>`.
- **`Number()` vs `parseInt()` for integer answer parsing** — affects edge
  cases like `"3.5"` against an integer answer (port returns NaN-strict-equal,
  the prototype truncated to 3). Tighter, but a cross-cutting change.
- **`--c3` formerly undefined** — the prior prototype never declared `--c3`,
  so its inline `linear-gradient(…, var(--c3))` fell through to no-fill. Port
  declares `--c3: #A78BFA` and renders the gradient as intended. Treat as
  fix, not regression.
- **NBSP separators in Thalès completer** — the prior prototype used
  `&nbsp;/&nbsp;` inside DM Mono divs; port uses plain ` / `. Spacing slightly
  tighter.
- **`Réponse :` separator in fractions-comp reveal-all** — original shows just
  the sign for `comp`; port shows the full `${fH(a,b)} ${sign} ${fH(c,d)}`
  expression (more informative).
- **Pyth `PYTH_TRIPLES` includes `[15,20,25]` for `makeLeg`** — original
  excluded it (10 triples for legs vs 11 for hypotenuses). Trivial impact on
  question variety.
- **Arithmétique inputs over-styled** — `divisors`/`multiples`/`spotnonprime`
  inputs get `borderColor: exercise.color` in port; original has no inline
  border style on these. Cosmetic.
- **Arith pgcd textarea placeholder** — port omits the literal `Ex : ` prefix
  from the placeholder. Minor.
- **Arith Enter-key on decompo inputs** — port allows Enter to submit on
  decompo's per-line inputs; original only attached Enter to single-input
  subtypes.
- **Programme warn-color carry-over** — original keeps the yellow warn colour
  active on subsequent "Remplis toutes les cases." messages; port resets it to
  the default red. Port behaviour is arguably more correct.
- **Prime-fac Large vs regular `font-size`** — both use `font-size: 14px` per
  spec but the port previously didn't carry over the Large weight; resolved
  in 0a above.

## 1. Student accounts & login

- Add an auth provider (recommended: **Supabase Auth** or **Clerk**, both with generous free tiers).
- Wrap protected routes (e.g. `/me`) with a session check on the server side via Astro's hybrid/SSR mode.
- The current quiz components are pure-client and don't read any user identity, so they don't need to change.

## 2. Progress tracking

- Persist a row per `(user_id, level, topic, attempt_at, score, total)` in a database (Supabase Postgres, Vercel Postgres, or Cloudflare D1).
- Add a thin API endpoint (Astro endpoint or Vercel serverless function) to record attempts.
- The `<Quiz>` component already centralises score state — wiring an `onComplete(stats)` callback is enough; no refactor of question renderers needed.

## 3. Rate limiting (only if API/login is added)

- **Not needed today** — the site is fully static, no abuse vector.
- When endpoints are added: use Vercel/Cloudflare edge rate limiting, or a small middleware (e.g. `@upstash/ratelimit`).

## 4. Other ideas (parking lot)

- Per-topic difficulty modes (easy / medium / hard).
- Teacher dashboard to assign quizzes to specific students.
- Export of attempts as PDF / CSV for parents.
- AI-generated explanations for wrong answers (can hit Claude/OpenAI API server-side, with caching to control cost).
- PWA / offline mode (Astro has first-class PWA integrations).

## Architectural anchors that keep these doors open

- Routes are organised as `/<level>/<topic>` — multi-tenant by level fits naturally.
- `QuizDefinition` is a typed contract. Adding `difficulty`, `tags`, or `prerequisites` is a single-property change.
- Questions are rendered through pluggable `RendererKind` types; new question shapes (figure, fill-in-blank, radio, drag-and-drop) plug in without touching the `<Quiz>` shell.
- Static-first build: turning a page SSR (e.g. `/me`) is a per-page opt-in, not a project-wide rewrite.
