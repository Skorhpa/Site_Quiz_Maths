# CLAUDE.md — SiteMath project conventions

This file locks in the contract for adding content and code to SiteMath. Read it
before touching anything. The goal is that **every new quiz, level, and renderer
plugs into the same pattern, with no per-page CSS or one-off React state**.

The 4ᵉ port is **the canonical reference**. When adding content for another
level, mirror the structure, palette, and behaviour established by the 4ᵉ
quizzes in [`src/data/quizzes/4eme/`](src/data/quizzes/4eme/) and the renderers
in [`src/components/questions/`](src/components/questions/).

---

## Stack

- **Astro 5** for routing and the static build (`output: "static"`).
- **React 19 islands** for interactive quiz components only (`client:load`).
- **TypeScript strict** (extends `astro/tsconfigs/strict`).
- **Vite** under the hood (Astro's bundler).
- **Static-first**: deployable to Vercel / Netlify / GitHub Pages with no
  server. No backend, no auth, no rate limiting today (see `docs/FUTURE.md`).

If a feature would require server code, **don't add it inline** — document it in
`docs/FUTURE.md` and keep the static build green.

---

## Directory layout

```
SiteMath/
├── CLAUDE.md                          # this file
├── README.md                          # human-facing setup
├── astro.config.mjs                   # React integration, site URL
├── tsconfig.json                      # @/* path alias to src/*
├── docs/
│   └── FUTURE.md                      # parked features (login, progress, rate limiting…)
└── src/
    ├── types.ts                       # the QuizDefinition / Exercise / GeneratorSpec contract
    ├── styles/global.css              # all CSS — no per-component CSS files
    ├── layouts/BaseLayout.astro       # <html><head><body><slot/></body></html>
    ├── pages/
    │   ├── index.astro                # / — level picker, redirects to single available level
    │   ├── [level]/index.astro        # /<level> — topic grid
    │   └── [level]/[topic].astro      # /<level>/<topic> — hosts the <Quiz> island
    ├── components/
    │   ├── Quiz.tsx                   # the only quiz shell — never duplicate
    │   └── questions/
    │       └── <Kind>Question.tsx     # one renderer per RendererKind
    └── data/
        ├── levels.ts                  # registry of LevelDefinition
        └── quizzes/
            └── <level>/
                ├── index.ts           # `topics: Topic[]` for that level
                └── <topic>.ts         # one QuizDefinition per file
```

Rules:

- **Never** create per-page `.astro` files for quizzes; everything goes through
  `[level]/[topic].astro`.
- **Never** add per-component `.css`, `.module.css`, or styled-components.
  `src/styles/global.css` is the single stylesheet.
- **Never** save markdown, working files, or tests at the repo root other than
  `CLAUDE.md`, `README.md`, and `docs/`.

### About `docs/FUTURE.md`

`docs/FUTURE.md` is the **parking lot for deferred features and design notes
that need to survive across sessions** — anything we know we want eventually
but don't want to build today, plus things that are temporarily disabled with
a clear path back. It's not a TODO list; it's a roadmap + dormant-feature log.

Use it for:

- Features deliberately scoped out of v1 (login, progress tracking,
  rate-limiting, AI hints, PWA, teacher dashboard, …).
- **Architectural anchors that are intentionally dormant** so the next
  contributor knows the door is open: the level picker, the multi-level
  topbar, the `topicsModule` lazy-import slot, etc.
- Per-quiz follow-ups that don't block release (e.g. "port the
  `fractions-complex` sub-quiz when ready, then enable the 'Calculs complexes
  →' button on `fractions.ts`").

When you flip a feature back on (e.g. a new level becomes `available`),
**remove the corresponding entry from `docs/FUTURE.md`** so the document stays
trustworthy. When you scope something out, add it there with enough context
that a future reader knows *why* it was deferred and *how* to wire it back.

---

## Canonical colour palette (locked)

These are the only accent colours allowed. Pick the one that matches the topic
when defining a `QuizDefinition.accent`.

| Token | Hex      | Used by                                  |
|-------|----------|------------------------------------------|
| c1    | `#6EE7C0` | Calcul / Entiers relatifs                |
| c2    | `#60A5FA` | Géométrie / Théorème de Pythagore        |
| c3    | `#A78BFA` | Algèbre / Résolution d'équations         |
| c4    | `#FB923C` | Géométrie / Théorème de Thalès           |
| c5    | `#F472B6` | Calcul / Arrondis                        |
| c6    | `#34D399` | Calcul / Fractions (calculs & comp.)     |
| c7    | `#E879F9` | Algèbre / Calcul littéral                |
| c8    | `#38BDF8` | Algèbre / Programmes de calcul           |
| c9    | `#4ADE80` | Algèbre / Produire une expression        |
| car   | `#FB7185` | Algèbre / Arithmétique                   |
| crp   | `#A78BFA` | Géométrie / Réciproque de Pythagore      |

Card stripe colours (the 4-px left bar on `NumberQuestion` cards) are also
fixed:

- `add` → `#4CAF84` (green)
- `sub` → `#D07548` (orange)
- `mul` → `#4A7CC9` (blue)
- `div` → `#E879F9` (magenta)

State colours: `--correct: #4ADE80`, `--wrong: #F87171`. Surface tokens are in
`global.css` (`--bg`, `--surface`, `--surface2`, `--text`, `--muted`, …) — use
them, never hard-code greys/blacks.

---

## Page structure (locked)

Every quiz page renders this exact sequence inside `<Quiz>`. Don't reorder, don't
inline anything new without extending `QuizDefinition` first.

1. **Topbar** (in the `.astro` page, not `<Quiz>`):
   - On `/<level>`: `← Niveaux | / <Level label>`. "Niveaux" links to `/`.
   - On `/<level>/<topic>`: `← Accueil | / <Topic title>`. "Accueil" links to
     `/<level>` (the level's topic grid). "Accueil" always returns to the
     topic picker for the active level — never directly to the level picker.
2. **Header** — `er-title` with the gradient (`linear-gradient(135deg, #F0EDE8
   40%, accent)`) over the prefix and a muted span over `titleSub` if present;
   `er-sub` underneath.
3. **(optional) typePills row** — outlined pills, one per exercise category
   (e.g. `Addition / Soustraction / Multiplication`, or `Au dixième / au
   centième / au millième`). This is the **only** legend pattern — small-dot
   legends are not used anywhere. Set `typePills` on the QuizDefinition.
4. **Scoreboard** — Justes / Faux / Restants, accent colour for the numerals.
5. **Progress bar** — accent-coloured fill.
6. **Controls** — `Tout corriger` (primary, accent bg) / `Recommencer`
   (secondary) / `Nouvelle série` (secondary, only shown when
   `generator.length > 0`).
7. **Question grid** — renderer-specific (`er-grid`, `eq-list`, `questions-list`…).
8. **End-banner** — appears only when `answered === total`. Smooth-scrolls into
   view on completion.

---

## QuizDefinition contract

Defined in `src/types.ts`. A topic on a level is one of:

- `TopicStub` — locked card on the topic grid (icon, title, description, tags,
  accent, `available: false`). No quiz behind it.
- `QuizDefinition` — fully working quiz, `available: true`.

Required fields on a `QuizDefinition`:

| Field         | Notes                                                              |
|---------------|--------------------------------------------------------------------|
| `id`          | URL slug (`entiers`, `arrondis`, …) — must be unique per level.    |
| `available`   | `true` for live quizzes.                                           |
| `title`       | Full title, used in `<title>`, breadcrumbs, and the styled header. |
| `category`    | `"Calcul" \| "Géométrie" \| "Algèbre"` — colours the eyebrow label.|
| `accent`      | One of the canonical hexes above.                                  |
| `icon`        | Single character or short emoji.                                   |
| `description` | One-line card description.                                         |
| `tags`        | Short labels for the card (`"30 questions"`, `"Génération aléatoire"`). |
| `renderer`    | One of `RendererKind` — picks the question component.              |
| `exercises`   | The static fallback shown on first load. Must never be empty.      |

Optional fields:

| Field        | Notes                                                              |
|--------------|--------------------------------------------------------------------|
| `titleSub`   | Suffix of `title` to render in muted colour (e.g. `"relatifs"`).   |
| `subtitle`   | The `er-sub` line below the title.                                 |
| `accentSecondary` | Second stop of the progress-bar gradient. Each quiz defines its own pair (e.g. Entiers `c1→c3`, Arrondis `c5→#c084fc`). |
| `typePillsMarginBottom` | Inline override for the `.types-row` margin-bottom (default `2.5rem`; Arrondis uses `2rem`). |
| `generator`  | A `GeneratorSpec[]` — drives the "Nouvelle série" button.          |
| `typePills`  | Pill-shaped legend rendered just below the subtitle.               |

**`typePills` is the only legend pattern.** Don't reintroduce a small-dot
`.legend` style — Entiers relatifs has been normalised to the pill shape so
every quiz looks consistent.

---

## Generator pattern (must be JSON-serialisable)

The Astro→React boundary serialises props to JSON, so **`generator` cannot be a
function**. Use a `GeneratorSpec[]` instead — pure data describing how to
randomise. The runtime that turns specs into exercises lives inside `Quiz.tsx`.

Adding a new generator kind:

1. Add a typed variant to `GeneratorSpec` in `src/types.ts`.
2. Extend `runGenerator` in `Quiz.tsx` with a branch for the new `kind`.
3. Use it from quiz definitions: `generator: [{ kind: '…', … }, …]`.

If randomisation can't be expressed declaratively, push it to build time
(generate a static array in the data module) rather than smuggling a function
across the boundary.

---

## Renderer pattern

A renderer is one React component under `src/components/questions/`. To add a
new one (e.g. `FractionQuestion`):

1. Add the exercise interface to `src/types.ts` (e.g. `FractionExercise extends
   BaseExercise`) and union it into `Exercise`.
2. Add a value to `RendererKind` (e.g. `'fraction'`).
3. Create `src/components/questions/FractionQuestion.tsx`. Props convention:
   ```ts
   interface XYQuestionProps {
     index: number;
     exercise: XYExercise;
     answer: AnswerState;        // shared with Quiz.tsx
     accent: string;
     onChange(value: string): void;
     onSubmit(): void;
   }
   ```
4. Add a branch in `Quiz.tsx` (`{quiz.renderer === 'fraction' && (...)}`).
5. Add a branch in `Quiz.tsx`'s `checkAnswer` for the new exercise shape.
6. Reuse the `qcard` / `card` / `er-grid` / `questions-list` styles in
   `global.css`. Add new CSS only if the renderer needs a layout that doesn't
   exist (e.g. the SVG-figure layout for Pythagore).

---

## Behavioural rules (locked)

These have all been requested explicitly — don't regress them.

- **Empty input is wrong**, even when the answer is `0`. Use a `value.trim() ===
  ''` guard before any `Number()` parse (because `Number('') === 0`).
- **"Tout corriger"** marks every unanswered exercise as wrong (or `revealed`,
  which renders the same red but without the `✗` prefix), then smooth-scrolls
  to the end-banner.
- **"Recommencer"** clears answers on the *current* exercise set (don't reset to
  `quiz.exercises`) and smooth-scrolls to the top.
- **"Nouvelle série"** runs the generator, replaces exercises, clears answers,
  and smooth-scrolls to the top. Hidden if no generator.
- **Number inputs hide the up/down spinner** (CSS already does this globally
  for `.input-row input[type='number']`).
- **End-banner smooth-scrolls into view** when `answered === total`.

---

## Routing rules

- `src/pages/index.astro` redirects to the only available level when exactly
  one level is `available`. The picker auto-restores when a second level flips
  to `available: true` — don't comment it out, don't hard-code the redirect.
- `src/pages/[level]/index.astro` renders all topics for the level. Locked
  stubs (`available: false`) get the `Bientôt` tag and no link.
- `src/pages/[level]/[topic].astro`'s `getStaticPaths` filters to
  `topic.available === true` so locked topics don't generate empty pages.

Topbar pattern (two-level navigation):

- Level page → `← Niveaux | / <Level>` — **currently suppressed**: the topbar
  on `[level]/index.astro` is hidden whenever exactly one level is `available`,
  because "Niveaux" would just bounce back via the `/` redirect. The topbar
  auto-restores once a second level flips to `available: true`. Suppression
  flag: `const showLevelTopbar = LEVELS.filter(l => l.available).length > 1`.
- Quiz page → `← Accueil | / <Topic>` (where "Accueil" = the level page).
  Always shown — the link to `/<level>` is meaningful regardless of how many
  levels exist.

### Multi-level architecture (dormant — preserved for the future)

Even though only **4ème** is currently available, the routing supports the
full collège-to-lycée hierarchy:

- The level picker page (`src/pages/index.astro`) iterates `LEVELS` and
  renders one card per level (active or locked-with-`Bientôt`-tag). It is
  bypassed today via the auto-redirect, but **the picker code is intact** —
  flipping a second level's `available` to `true` reactivates it
  automatically, no edits required.
- The level page (`src/pages/[level]/index.astro`) is generated for every
  entry in `LEVELS` (whether available or not), so paths like `/3eme`,
  `/2nde`, etc. already exist as "Bientôt disponible" placeholders. Once a
  level is filled in, its topic grid lights up.
- The level-page topbar (`← Niveaux`) reactivates from the same flag.
- `LevelDefinition` in `src/types.ts` already has the `topicsModule` lazy
  import slot — adding `topicsModule: () => import('./quizzes/<level>/index')`
  to a level definition is the only step needed to wire up its content.

In other words: the multi-level UI (level picker + per-level topbar +
breadcrumb back-arrow to `/`) is **fully built and tested**, just gated
behind a single boolean check. Don't refactor it away.

---

## Adding a new quiz to an existing level

1. **Find the closest 4ᵉ analogue** in [`src/data/quizzes/4eme/`](src/data/quizzes/4eme/)
   and use it as a template. Note the colour, icon, title format (prefix +
   muted suffix), subtitle, type pills, exercise count, and any
   hints/explanations.
2. **Pick the renderer**:
   - Pure number answer (integers or decimals) → `NumberQuestion`.
   - Decimal with comma + tolerance + per-question explanation →
     `RoundingQuestion`.
   - Algebraic-expression text answer → `TextQuestion`.
   - Question + figure (SVG) + text answer → `FigureTextQuestion`.
   - Multi-input forms (radios / multiple text fields) → `ArithQuestion` or
     a new dedicated renderer.
   - Anything new → add a renderer first (see above).
3. Create `src/data/quizzes/<level>/<id>.ts` exporting one `QuizDefinition`.
4. Register it in `src/data/quizzes/<level>/index.ts` (replace the matching
   `TopicStub` if one exists, keeping all other stubs intact).
5. Run `npx astro check && npx astro build`. Both must be 0 errors / 0 warnings.
6. Refresh the dev server, click through the quiz: type a wrong answer, type
   the right one, leave one blank, click "Tout corriger", click "Recommencer",
   click "Nouvelle série". All must behave per the rules above.

---

## Adding a new level

1. Flip `available: true` on the level in `src/data/levels.ts`, set
   `topicsModule: () => import('./quizzes/<level>/index')`.
2. Create `src/data/quizzes/<level>/index.ts` exporting `topics: Topic[]`.
   Start with `TopicStub` entries for every quiz on that level (descriptions
   sourced from the official curriculum), then promote stubs to
   `QuizDefinition` as you port them.
3. The `/` level picker auto-restores once 2+ levels are `available`.

---

## DON'T

- ❌ Pass functions or class instances across `Astro → React`. They won't
  survive JSON serialisation and "Nouvelle série" will silently disappear.
- ❌ Hard-code colour hexes outside the canonical palette.
- ❌ Add tracking, analytics, or external scripts without a written reason.
- ❌ Introduce a new dependency without checking the bundle impact (`npx astro
  build` reports the gzipped size of every chunk).
- ❌ Add features the task didn't ask for. Three similar lines is better than a
  premature abstraction. Don't generalise on the second occurrence — wait for
  the third.
- ❌ Commit `dist/`, `node_modules/`, or `.astro/`.

---

## Build & verify

```bash
npm install                # once
npm run dev                # http://localhost:4321
npx astro sync             # regenerate .astro/types.d.ts after touching types.ts
npx astro check            # type-check Astro + React + TS, must be 0/0/0
npx astro build            # produces ./dist (deploy this)
npm run preview            # serve ./dist locally
```

Before declaring a quiz ported, both `npx astro check` and `npx astro build`
must finish with **0 errors / 0 warnings / 0 hints**, and the quiz must pass
all six behavioural rules above.
