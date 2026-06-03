import type { ProbaGroupExercise, ProbaVocabExercise } from '@/types';

const fr = (n: number | string, d: number | string, col = 'var(--text)') =>
  `<span class="frac" style="color:${col}"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;
const bar = (label: string) => `<span style="text-decoration:overline">${label}</span>`;
const ok = (n: number, d: number) => fr(n, d, 'var(--correct)');

export const probaVocabCard: ProbaVocabExercise = { type: 'default', exKind: 'proba-vocab' };

// ── Couleurs ──────────────────────────────────────────────────────────────────
const CLR: Record<string, string> = {
  rouge: '#dc2626', vert: '#16a34a', bleu: '#2563eb',
  jaune: '#ca8a04', orange: '#ea580c', violet: '#7c3aed',
};

// ── SVG : roue de loterie (camembert) ────────────────────────────────────────
function wheelSvg(sectors: Array<{ label: string; color: string; n: number }>, total: number): string {
  const r = 62, cx = 75, cy = 72;
  let a = -Math.PI / 2;
  const parts: string[] = [];
  for (const s of sectors) {
    const sweep = (s.n / total) * 2 * Math.PI;
    const a2 = a + sweep;
    const x1 = (cx + r * Math.cos(a)).toFixed(1), y1 = (cy + r * Math.sin(a)).toFixed(1);
    const x2 = (cx + r * Math.cos(a2)).toFixed(1), y2 = (cy + r * Math.sin(a2)).toFixed(1);
    parts.push(`<path d="M${cx},${cy}L${x1},${y1}A${r},${r},0,${sweep > Math.PI ? 1 : 0},1,${x2},${y2}Z" fill="${s.color}" stroke="white" stroke-width="1.5"/>`);
    const mid = a + sweep / 2;
    const lx = (cx + r * 0.6 * Math.cos(mid)).toFixed(1), ly = (cy + r * 0.6 * Math.sin(mid)).toFixed(1);
    parts.push(`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="700" fill="white">${s.label}</text>`);
    a = a2;
  }
  parts.push(`<polygon points="${cx},${cy - r - 12} ${cx - 5},${cy - r} ${cx + 5},${cy - r}" fill="#1e293b"/>`);
  return `<div style="text-align:center"><svg width="150" height="150" viewBox="0 0 150 150">${parts.join('')}</svg></div>`;
}

// ── SVG : sac avec boules colorées ───────────────────────────────────────────
function sacSvg(balls: Array<{ color: string; n: number }>): string {
  const total = balls.reduce((s, b) => s + b.n, 0);
  const cols = Math.ceil(Math.sqrt(total * 1.4));
  const dots: string[] = [];
  let idx = 0;
  for (const b of balls) {
    for (let i = 0; i < b.n; i++) {
      const col = idx % cols, row = Math.floor(idx / cols);
      dots.push(`<circle cx="${13 + col * 18}" cy="${13 + row * 18}" r="7" fill="${b.color}" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`);
      idx++;
    }
  }
  const rows = Math.ceil(total / cols);
  const W = 12 + cols * 18, H = 12 + rows * 18;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="margin:6px 0"><rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>${dots.join('')}</svg>`;
}

// ── SVG : boules avec lettre ──────────────────────────────────────────────────
function bouleLettresSvg(balls: Array<{ color: string; letter: string; n: number }>): string {
  const total = balls.reduce((s, b) => s + b.n, 0);
  const cols = Math.ceil(Math.sqrt(total * 1.4));
  const dots: string[] = [];
  let idx = 0;
  for (const b of balls) {
    for (let i = 0; i < b.n; i++) {
      const col = idx % cols, row = Math.floor(idx / cols);
      const cx = 14 + col * 20, cy = 14 + row * 20;
      dots.push(`<circle cx="${cx}" cy="${cy}" r="8" fill="${b.color}" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`);
      dots.push(`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="700" fill="white">${b.letter}</text>`);
      idx++;
    }
  }
  const rows = Math.ceil(total / cols);
  const W = 13 + cols * 20, H = 13 + rows * 20;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="margin:6px 0"><rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="var(--surface2)" stroke="var(--border2)" stroke-width="1.5"/>${dots.join('')}</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Groupe 1 — Lancé de dé (5 variantes)
// ═══════════════════════════════════════════════════════════════════════════════

const DE_VARIANTS: ProbaGroupExercise[] = [
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Lancé de dé',
    context: `On lance un dé cubique à 6 faces numérotées de 1 à 6. Le dé est <strong>équilibré</strong> (non truqué),
      donc chaque face a autant de chances d'apparaître : les 6 issues sont <strong>équiprobables</strong>.`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Obtenir le nombre 5.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 1, d: 6 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Le dé est équilibré : les 6 faces ont la même chance.</div>
          <div style="margin-top:8px;">Les 6 issues sont : 1, 2, 3, 4, 5, 6.</div>
          <div style="margin-top:8px;">L'événement A contient <strong>1 issue favorable</strong> : le 5.</div>
          <div style="margin-top:8px;">P(A) = ${ok(1, 6)}</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Obtenir un nombre impair.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 3, d: 6 }, isComplement: false,
        steps: `<div>Les nombres <strong>impairs</strong> dans 1 à 6 sont : 1, 3, 5 → <strong>3 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(B) = ${fr(3, 6, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 5, d: 6 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « ne pas obtenir le 5 ».</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(1, 6)} = ${ok(5, 6)}</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Lancé de dé',
    context: `On lance un dé cubique à 6 faces numérotées de 1 à 6, <strong>équilibré</strong>. Les 6 issues sont <strong>équiprobables</strong>.`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Obtenir un nombre pair.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 3, d: 6 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Le dé est équilibré : les 6 faces ont la même chance.</div>
          <div style="margin-top:8px;">Les nombres <strong>pairs</strong> dans 1 à 6 sont : 2, 4, 6 → <strong>3 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(A) = ${fr(3, 6, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Obtenir un multiple de 3.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 2, d: 6 }, isComplement: false,
        steps: `<div>Les <strong>multiples de 3</strong> dans 1 à 6 sont : 3 et 6 → <strong>2 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(B) = ${fr(2, 6, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 3, d: 6 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « obtenir un nombre impair » (1, 3, 5 → 3 issues).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(3, 6)} = ${fr(3, 6, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Lancé de dé',
    context: `On lance un dé cubique à 6 faces numérotées de 1 à 6, <strong>équilibré</strong>. Les 6 issues sont <strong>équiprobables</strong>.`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Obtenir un nombre strictement supérieur à 4.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 2, d: 6 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Le dé est équilibré : les 6 faces ont la même chance.</div>
          <div style="margin-top:8px;">Les nombres <strong>strictement supérieurs à 4</strong> dans 1 à 6 sont : 5 et 6 → <strong>2 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(A) = ${fr(2, 6, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Obtenir un nombre inférieur ou égal à 2.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 2, d: 6 }, isComplement: false,
        steps: `<div>Les nombres <strong>inférieurs ou égaux à 2</strong> dans 1 à 6 sont : 1 et 2 → <strong>2 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(B) = ${fr(2, 6, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 4, d: 6 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « obtenir un nombre inférieur ou égal à 4 » (1, 2, 3, 4 → 4 issues).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(2, 6)} = ${fr(4, 6, 'var(--c6)')} = ${ok(2, 3)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Lancé de dé',
    context: `On lance un dé cubique à 6 faces numérotées de 1 à 6, <strong>équilibré</strong>. Les 6 issues sont <strong>équiprobables</strong>.`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Obtenir le nombre 1.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 1, d: 6 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Le dé est équilibré : les 6 faces ont la même chance.</div>
          <div style="margin-top:8px;">Les 6 issues sont : 1, 2, 3, 4, 5, 6.</div>
          <div style="margin-top:8px;">L'événement A contient <strong>1 issue favorable</strong> : le 1.</div>
          <div style="margin-top:8px;">P(A) = ${ok(1, 6)}</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Obtenir un nombre strictement supérieur à 3.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 3, d: 6 }, isComplement: false,
        steps: `<div>Les nombres <strong>strictement supérieurs à 3</strong> dans 1 à 6 sont : 4, 5 et 6 → <strong>3 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(B) = ${fr(3, 6, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 5, d: 6 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « ne pas obtenir le 1 » (2, 3, 4, 5, 6 → 5 issues).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(1, 6)} = ${ok(5, 6)}</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Lancé de dé',
    context: `On lance un dé cubique à 6 faces numérotées de 1 à 6, <strong>équilibré</strong>. Les 6 issues sont <strong>équiprobables</strong>.`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Obtenir un multiple de 2.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 3, d: 6 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Le dé est équilibré : les 6 faces ont la même chance.</div>
          <div style="margin-top:8px;">Les <strong>multiples de 2</strong> dans 1 à 6 sont : 2, 4 et 6 → <strong>3 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(A) = ${fr(3, 6, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Obtenir un nombre strictement inférieur à 3.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 2, d: 6 }, isComplement: false,
        steps: `<div>Les nombres <strong>strictement inférieurs à 3</strong> dans 1 à 6 sont : 1 et 2 → <strong>2 issues favorables</strong>.</div>
          <div style="margin-top:8px;">P(B) = ${fr(2, 6, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 3, d: 6 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « obtenir un nombre impair » (1, 3, 5 → 3 issues).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(3, 6)} = ${fr(3, 6, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Groupe 2 — Sac (jetons / billes / cartons) — 5 variantes
// ═══════════════════════════════════════════════════════════════════════════════

const SAC_VARIANTS: ProbaGroupExercise[] = [
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Sac de jetons',
    context: `Un sac contient <strong>10 jetons</strong> tous identiques au toucher :
      <strong>4 rouges</strong>, <strong>3 bleus</strong> et <strong>3 verts</strong>. On tire un jeton au hasard.
      ${sacSvg([{ color: CLR.rouge, n: 4 }, { color: CLR.bleu, n: 3 }, { color: CLR.vert, n: 3 }])}`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer un jeton rouge.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 4, d: 10 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Les jetons sont identiques au toucher : chaque jeton a la même chance.</div>
          <div style="margin-top:8px;">Il y a <strong>10 issues</strong> au total et <strong>4 issues favorables</strong> (jetons rouges).</div>
          <div style="margin-top:8px;">P(A) = ${fr(4, 10, 'var(--c6)')} = ${ok(2, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer un jeton vert.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 3, d: 10 }, isComplement: false,
        steps: `<div>Il y a <strong>3 jetons verts</strong> sur 10 au total.</div>
          <div style="margin-top:8px;">P(B) = ${ok(3, 10)}</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 6, d: 10 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « ne pas tirer un jeton rouge » (bleus + verts : 3 + 3 = 6).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(4, 10)} = ${fr(6, 10, 'var(--c6)')} = ${ok(3, 5)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Sac de billes',
    context: `Un sac contient <strong>12 billes</strong> toutes identiques au toucher :
      <strong>5 rouges</strong>, <strong>4 bleues</strong> et <strong>3 jaunes</strong>. On tire une bille au hasard.
      ${sacSvg([{ color: CLR.rouge, n: 5 }, { color: CLR.bleu, n: 4 }, { color: CLR.jaune, n: 3 }])}`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer une bille rouge.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 5, d: 12 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Les billes sont identiques au toucher : chaque bille a la même chance.</div>
          <div style="margin-top:8px;">Il y a <strong>12 issues</strong> au total et <strong>5 issues favorables</strong> (billes rouges).</div>
          <div style="margin-top:8px;">P(A) = ${ok(5, 12)}</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une bille jaune.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 3, d: 12 }, isComplement: false,
        steps: `<div>Il y a <strong>3 billes jaunes</strong> sur 12 au total.</div>
          <div style="margin-top:8px;">P(B) = ${fr(3, 12, 'var(--c6)')} = ${ok(1, 4)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 7, d: 12 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « ne pas tirer une bille rouge » (bleues + jaunes : 4 + 3 = 7).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(5, 12)} = ${ok(7, 12)}</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Sac de cartons',
    context: `Un sac contient <strong>8 cartons</strong> tous identiques au toucher :
      <strong>3 rouges</strong>, <strong>4 bleus</strong> et <strong>1 vert</strong>. On tire un carton au hasard.
      ${sacSvg([{ color: CLR.rouge, n: 3 }, { color: CLR.bleu, n: 4 }, { color: CLR.vert, n: 1 }])}`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer un carton rouge.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 3, d: 8 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Les cartons sont identiques au toucher : chaque carton a la même chance.</div>
          <div style="margin-top:8px;">Il y a <strong>8 issues</strong> au total et <strong>3 issues favorables</strong> (cartons rouges).</div>
          <div style="margin-top:8px;">P(A) = ${ok(3, 8)}</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer un carton bleu.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 4, d: 8 }, isComplement: false,
        steps: `<div>Il y a <strong>4 cartons bleus</strong> sur 8 au total.</div>
          <div style="margin-top:8px;">P(B) = ${fr(4, 8, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 5, d: 8 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « ne pas tirer un carton rouge » (bleus + vert : 4 + 1 = 5).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(3, 8)} = ${ok(5, 8)}</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Sac de jetons',
    context: `Un sac contient <strong>15 jetons</strong> tous identiques au toucher :
      <strong>6 rouges</strong>, <strong>5 bleus</strong> et <strong>4 jaunes</strong>. On tire un jeton au hasard.
      ${sacSvg([{ color: CLR.rouge, n: 6 }, { color: CLR.bleu, n: 5 }, { color: CLR.jaune, n: 4 }])}`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer un jeton rouge.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 6, d: 15 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Les jetons sont identiques au toucher : chaque jeton a la même chance.</div>
          <div style="margin-top:8px;">Il y a <strong>15 issues</strong> au total et <strong>6 issues favorables</strong> (jetons rouges).</div>
          <div style="margin-top:8px;">P(A) = ${fr(6, 15, 'var(--c6)')} = ${ok(2, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer un jeton jaune.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 4, d: 15 }, isComplement: false,
        steps: `<div>Il y a <strong>4 jetons jaunes</strong> sur 15 au total.</div>
          <div style="margin-top:8px;">P(B) = ${ok(4, 15)}</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 9, d: 15 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « ne pas tirer un jeton rouge » (bleus + jaunes : 5 + 4 = 9).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(6, 15)} = ${fr(9, 15, 'var(--c6)')} = ${ok(3, 5)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Sac de billes',
    context: `Un sac contient <strong>20 billes</strong> toutes identiques au toucher :
      <strong>8 rouges</strong>, <strong>7 vertes</strong> et <strong>5 bleues</strong>. On tire une bille au hasard.
      ${sacSvg([{ color: CLR.rouge, n: 8 }, { color: CLR.vert, n: 7 }, { color: CLR.bleu, n: 5 }])}`,
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer une bille verte.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 7, d: 20 }, isComplement: false,
        steps: `<div><strong>Pourquoi équiprobabilité ?</strong> Les billes sont identiques au toucher : chaque bille a la même chance.</div>
          <div style="margin-top:8px;">Il y a <strong>20 issues</strong> au total et <strong>7 issues favorables</strong> (billes vertes).</div>
          <div style="margin-top:8px;">P(A) = ${ok(7, 20)}</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une bille bleue.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 5, d: 20 }, isComplement: false,
        steps: `<div>Il y a <strong>5 billes bleues</strong> sur 20 au total.</div>
          <div style="margin-top:8px;">P(B) = ${fr(5, 20, 'var(--c6)')} = ${ok(1, 4)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 13, d: 20 }, isComplement: true,
        steps: `<div>L'événement contraire de A est « ne pas tirer une bille verte » (rouges + bleues : 8 + 5 = 13).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(7, 20)} = ${ok(13, 20)}</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Groupe 3 — Boules colorées (problème, countQuestion) — 5 variantes
// ═══════════════════════════════════════════════════════════════════════════════

const BOULES_VARIANTS: ProbaGroupExercise[] = [
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules colorées',
    context: `Un sac contient des boules toutes indiscernables au toucher :
      <strong>4 rouges</strong>, <strong>3 bleues</strong> et <strong>5 vertes</strong>. On tire une boule au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 12,
      steps: `<div>4 + 3 + 5 = <strong>12 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule rouge.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 4, d: 12 }, isComplement: false,
        steps: `<div>Les boules sont indiscernables : les <strong>12 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>4 boules rouges</strong> → 4 issues favorables.</div>
          <div style="margin-top:8px;">P(A) = ${fr(4, 12, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une boule verte.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 5, d: 12 }, isComplement: false,
        steps: `<div><strong>5 boules vertes</strong> sur 12 → 5 issues favorables.</div>
          <div style="margin-top:8px;">P(B) = ${ok(5, 12)}</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 8, d: 12 }, isComplement: true,
        steps: `<div>Contraire de A : « ne pas tirer une boule rouge » (bleues + vertes : 3 + 5 = 8).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − ${fr(4, 12)} = ${fr(8, 12, 'var(--c6)')} = ${ok(2, 3)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules colorées',
    context: `Un sac contient des boules toutes indiscernables au toucher :
      <strong>6 rouges</strong>, <strong>4 bleues</strong> et <strong>2 vertes</strong>. On tire une boule au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 12,
      steps: `<div>6 + 4 + 2 = <strong>12 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule rouge.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 6, d: 12 }, isComplement: false,
        steps: `<div>Les boules sont indiscernables : les <strong>12 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>6 boules rouges</strong> → 6 issues favorables.</div>
          <div style="margin-top:8px;">P(A) = ${fr(6, 12, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une boule bleue.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 4, d: 12 }, isComplement: false,
        steps: `<div><strong>4 boules bleues</strong> sur 12 → 4 issues favorables.</div>
          <div style="margin-top:8px;">P(B) = ${fr(4, 12, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 6, d: 12 }, isComplement: true,
        steps: `<div>Contraire de A : « ne pas tirer une boule rouge » (bleues + vertes : 4 + 2 = 6).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − ${fr(6, 12)} = ${fr(6, 12, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules colorées',
    context: `Un sac contient des boules toutes indiscernables au toucher :
      <strong>3 rouges</strong>, <strong>6 bleues</strong> et <strong>3 vertes</strong>. On tire une boule au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 12,
      steps: `<div>3 + 6 + 3 = <strong>12 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule bleue.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 6, d: 12 }, isComplement: false,
        steps: `<div>Les boules sont indiscernables : les <strong>12 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>6 boules bleues</strong> → 6 issues favorables.</div>
          <div style="margin-top:8px;">P(A) = ${fr(6, 12, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une boule verte.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 3, d: 12 }, isComplement: false,
        steps: `<div><strong>3 boules vertes</strong> sur 12 → 3 issues favorables.</div>
          <div style="margin-top:8px;">P(B) = ${fr(3, 12, 'var(--c6)')} = ${ok(1, 4)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 6, d: 12 }, isComplement: true,
        steps: `<div>Contraire de A : « ne pas tirer une boule bleue » (rouges + vertes : 3 + 3 = 6).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − ${fr(6, 12)} = ${fr(6, 12, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules colorées',
    context: `Un sac contient des boules toutes indiscernables au toucher :
      <strong>5 rouges</strong>, <strong>3 bleues</strong> et <strong>7 vertes</strong>. On tire une boule au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 15,
      steps: `<div>5 + 3 + 7 = <strong>15 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule rouge.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 5, d: 15 }, isComplement: false,
        steps: `<div>Les boules sont indiscernables : les <strong>15 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>5 boules rouges</strong> → 5 issues favorables.</div>
          <div style="margin-top:8px;">P(A) = ${fr(5, 15, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une boule verte.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 7, d: 15 }, isComplement: false,
        steps: `<div><strong>7 boules vertes</strong> sur 15 → 7 issues favorables.</div>
          <div style="margin-top:8px;">P(B) = ${ok(7, 15)}</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 10, d: 15 }, isComplement: true,
        steps: `<div>Contraire de A : « ne pas tirer une boule rouge » (bleues + vertes : 3 + 7 = 10).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − ${fr(5, 15)} = ${fr(10, 15, 'var(--c6)')} = ${ok(2, 3)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules colorées',
    context: `Un sac contient des boules toutes indiscernables au toucher :
      <strong>4 rouges</strong>, <strong>5 bleues</strong> et <strong>6 vertes</strong>. On tire une boule au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 15,
      steps: `<div>4 + 5 + 6 = <strong>15 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule verte.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 6, d: 15 }, isComplement: false,
        steps: `<div>Les boules sont indiscernables : les <strong>15 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>6 boules vertes</strong> → 6 issues favorables.</div>
          <div style="margin-top:8px;">P(A) = ${fr(6, 15, 'var(--c6)')} = ${ok(2, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une boule bleue.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 5, d: 15 }, isComplement: false,
        steps: `<div><strong>5 boules bleues</strong> sur 15 → 5 issues favorables.</div>
          <div style="margin-top:8px;">P(B) = ${fr(5, 15, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 9, d: 15 }, isComplement: true,
        steps: `<div>Contraire de A : « ne pas tirer une boule verte » (rouges + bleues : 4 + 5 = 9).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − ${fr(6, 15)} = ${fr(9, 15, 'var(--c6)')} = ${ok(3, 5)} (simplifié)</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Groupe 4 — Roue de loterie — 5 variantes
// ═══════════════════════════════════════════════════════════════════════════════

const ROUE_VARIANTS: ProbaGroupExercise[] = [
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Roue de loterie',
    context: `Une roue est divisée en <strong>8 secteurs égaux</strong> :
      3 secteurs <strong>« Gagné »</strong>, 4 secteurs <strong>« Rejoue »</strong> et 1 secteur <strong>« Perdu »</strong>.
      Chaque secteur a autant de chances d'être désigné par la flèche.
      ${wheelSvg([{ label: 'Gagné', color: '#16a34a', n: 3 }, { label: 'Rejoue', color: '#d97706', n: 4 }, { label: 'Perdu', color: '#dc2626', n: 1 }], 8)}`,
    subquestions: [
      {
        eventLabel: 'G', eventDesc: 'Gagner.',
        question: 'Détermine la probabilité de l\'événement G.',
        ans: { n: 3, d: 8 }, isComplement: false,
        steps: `<div>La roue a <strong>8 secteurs égaux</strong> → les 8 issues sont équiprobables.</div>
          <div style="margin-top:8px;"><strong>3 secteurs « Gagné »</strong> → 3 issues favorables.</div>
          <div style="margin-top:8px;">P(G) = ${ok(3, 8)}</div>`,
      },
      {
        eventLabel: 'R', eventDesc: 'Rejouer.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 4, d: 8 }, isComplement: false,
        steps: `<div><strong>4 secteurs « Rejoue »</strong> sur 8.</div>
          <div style="margin-top:8px;">P(R) = ${fr(4, 8, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('G'),
        question: 'Calcule la probabilité de l\'événement contraire de G.',
        ans: { n: 5, d: 8 }, isComplement: true,
        steps: `<div>Contraire de G : « ne pas gagner » (Rejoue + Perdu : 4 + 1 = 5 secteurs).</div>
          <div style="margin-top:8px;">Formule : P(${bar('G')}) = 1 − P(G) = 1 − ${fr(3, 8)} = ${ok(5, 8)}</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Roue de loterie',
    context: `Une roue est divisée en <strong>10 secteurs égaux</strong> :
      4 secteurs <strong>« Gagné »</strong>, 3 secteurs <strong>« Rejoue »</strong> et 3 secteurs <strong>« Perdu »</strong>.
      Chaque secteur a autant de chances d'être désigné par la flèche.
      ${wheelSvg([{ label: 'Gagné', color: '#16a34a', n: 4 }, { label: 'Rejoue', color: '#d97706', n: 3 }, { label: 'Perdu', color: '#dc2626', n: 3 }], 10)}`,
    subquestions: [
      {
        eventLabel: 'G', eventDesc: 'Gagner.',
        question: 'Détermine la probabilité de l\'événement G.',
        ans: { n: 4, d: 10 }, isComplement: false,
        steps: `<div>La roue a <strong>10 secteurs égaux</strong> → les 10 issues sont équiprobables.</div>
          <div style="margin-top:8px;"><strong>4 secteurs « Gagné »</strong> → 4 issues favorables.</div>
          <div style="margin-top:8px;">P(G) = ${fr(4, 10, 'var(--c6)')} = ${ok(2, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: 'P', eventDesc: 'Perdre.',
        question: 'Détermine la probabilité de l\'événement P.',
        ans: { n: 3, d: 10 }, isComplement: false,
        steps: `<div><strong>3 secteurs « Perdu »</strong> sur 10.</div>
          <div style="margin-top:8px;">P(P) = ${ok(3, 10)}</div>`,
      },
      {
        eventLabel: bar('G'),
        question: 'Calcule la probabilité de l\'événement contraire de G.',
        ans: { n: 6, d: 10 }, isComplement: true,
        steps: `<div>Contraire de G : « ne pas gagner » (Rejoue + Perdu : 3 + 3 = 6 secteurs).</div>
          <div style="margin-top:8px;">Formule : P(${bar('G')}) = 1 − P(G) = 1 − ${fr(4, 10)} = ${fr(6, 10, 'var(--c6)')} = ${ok(3, 5)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Roue de loterie',
    context: `Une roue est divisée en <strong>12 secteurs égaux</strong> :
      5 secteurs <strong>« Gagné »</strong>, 4 secteurs <strong>« Rejoue »</strong> et 3 secteurs <strong>« Perdu »</strong>.
      Chaque secteur a autant de chances d'être désigné par la flèche.
      ${wheelSvg([{ label: 'Gagné', color: '#16a34a', n: 5 }, { label: 'Rejoue', color: '#d97706', n: 4 }, { label: 'Perdu', color: '#dc2626', n: 3 }], 12)}`,
    subquestions: [
      {
        eventLabel: 'G', eventDesc: 'Gagner.',
        question: 'Détermine la probabilité de l\'événement G.',
        ans: { n: 5, d: 12 }, isComplement: false,
        steps: `<div>La roue a <strong>12 secteurs égaux</strong> → les 12 issues sont équiprobables.</div>
          <div style="margin-top:8px;"><strong>5 secteurs « Gagné »</strong> → 5 issues favorables.</div>
          <div style="margin-top:8px;">P(G) = ${ok(5, 12)}</div>`,
      },
      {
        eventLabel: 'R', eventDesc: 'Rejouer.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 4, d: 12 }, isComplement: false,
        steps: `<div><strong>4 secteurs « Rejoue »</strong> sur 12.</div>
          <div style="margin-top:8px;">P(R) = ${fr(4, 12, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('G'),
        question: 'Calcule la probabilité de l\'événement contraire de G.',
        ans: { n: 7, d: 12 }, isComplement: true,
        steps: `<div>Contraire de G : « ne pas gagner » (Rejoue + Perdu : 4 + 3 = 7 secteurs).</div>
          <div style="margin-top:8px;">Formule : P(${bar('G')}) = 1 − P(G) = 1 − ${fr(5, 12)} = ${ok(7, 12)}</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Roue de loterie',
    context: `Une roue est divisée en <strong>6 secteurs égaux</strong> :
      2 secteurs <strong>« Gagné »</strong>, 3 secteurs <strong>« Rejoue »</strong> et 1 secteur <strong>« Perdu »</strong>.
      Chaque secteur a autant de chances d'être désigné par la flèche.
      ${wheelSvg([{ label: 'Gagné', color: '#16a34a', n: 2 }, { label: 'Rejoue', color: '#d97706', n: 3 }, { label: 'Perdu', color: '#dc2626', n: 1 }], 6)}`,
    subquestions: [
      {
        eventLabel: 'G', eventDesc: 'Gagner.',
        question: 'Détermine la probabilité de l\'événement G.',
        ans: { n: 2, d: 6 }, isComplement: false,
        steps: `<div>La roue a <strong>6 secteurs égaux</strong> → les 6 issues sont équiprobables.</div>
          <div style="margin-top:8px;"><strong>2 secteurs « Gagné »</strong> → 2 issues favorables.</div>
          <div style="margin-top:8px;">P(G) = ${fr(2, 6, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: 'R', eventDesc: 'Rejouer.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 3, d: 6 }, isComplement: false,
        steps: `<div><strong>3 secteurs « Rejoue »</strong> sur 6.</div>
          <div style="margin-top:8px;">P(R) = ${fr(3, 6, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('G'),
        question: 'Calcule la probabilité de l\'événement contraire de G.',
        ans: { n: 4, d: 6 }, isComplement: true,
        steps: `<div>Contraire de G : « ne pas gagner » (Rejoue + Perdu : 3 + 1 = 4 secteurs).</div>
          <div style="margin-top:8px;">Formule : P(${bar('G')}) = 1 − P(G) = 1 − ${fr(2, 6)} = ${fr(4, 6, 'var(--c6)')} = ${ok(2, 3)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Roue de loterie',
    context: `Une roue est divisée en <strong>8 secteurs égaux</strong> :
      1 secteur <strong>« Jackpot »</strong>, 5 secteurs <strong>« Rejoue »</strong> et 2 secteurs <strong>« Perdu »</strong>.
      Chaque secteur a autant de chances d'être désigné par la flèche.
      ${wheelSvg([{ label: '★', color: '#7c3aed', n: 1 }, { label: 'Rejoue', color: '#d97706', n: 5 }, { label: 'Perdu', color: '#dc2626', n: 2 }], 8)}`,
    subquestions: [
      {
        eventLabel: 'J', eventDesc: 'Gagner le jackpot.',
        question: 'Détermine la probabilité de l\'événement J.',
        ans: { n: 1, d: 8 }, isComplement: false,
        steps: `<div>La roue a <strong>8 secteurs égaux</strong> → les 8 issues sont équiprobables.</div>
          <div style="margin-top:8px;"><strong>1 secteur « Jackpot »</strong> → 1 issue favorable.</div>
          <div style="margin-top:8px;">P(J) = ${ok(1, 8)}</div>`,
      },
      {
        eventLabel: 'R', eventDesc: 'Rejouer.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 5, d: 8 }, isComplement: false,
        steps: `<div><strong>5 secteurs « Rejoue »</strong> sur 8.</div>
          <div style="margin-top:8px;">P(R) = ${ok(5, 8)}</div>`,
      },
      {
        eventLabel: bar('J'),
        question: 'Calcule la probabilité de l\'événement contraire de J.',
        ans: { n: 7, d: 8 }, isComplement: true,
        steps: `<div>Contraire de J : « ne pas gagner le jackpot » (Rejoue + Perdu : 5 + 2 = 7 secteurs).</div>
          <div style="margin-top:8px;">Formule : P(${bar('J')}) = 1 − P(J) = 1 − ${fr(1, 8)} = ${ok(7, 8)}</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Groupe 5 — Problèmes quotidiens — 5 variantes
// ═══════════════════════════════════════════════════════════════════════════════

const PROBLEME_VARIANTS: ProbaGroupExercise[] = [
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Une classe',
    context: `Une classe comprend <strong>25 élèves</strong> : 14 filles et 11 garçons.
      Parmi tous les élèves, <strong>10 ont les yeux bleus</strong>. On choisit un élève au hasard.`,
    subquestions: [
      {
        eventLabel: 'F', eventDesc: 'Choisir une fille.',
        question: 'Détermine la probabilité de l\'événement F.',
        ans: { n: 14, d: 25 }, isComplement: false,
        steps: `<div>On choisit parmi <strong>25 élèves</strong> → les 25 issues sont équiprobables.</div>
          <div style="margin-top:8px;"><strong>14 filles</strong> → 14 issues favorables.</div>
          <div style="margin-top:8px;">P(F) = ${ok(14, 25)}</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Choisir un élève aux yeux bleus.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 10, d: 25 }, isComplement: false,
        steps: `<div><strong>10 élèves</strong> ont les yeux bleus sur 25.</div>
          <div style="margin-top:8px;">P(B) = ${fr(10, 25, 'var(--c6)')} = ${ok(2, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('F'),
        question: 'Calcule la probabilité de l\'événement contraire de F.',
        ans: { n: 11, d: 25 }, isComplement: true,
        steps: `<div>Contraire de F : « ne pas choisir une fille », soit choisir un garçon (11 garçons).</div>
          <div style="margin-top:8px;">Formule : P(${bar('F')}) = 1 − P(F) = 1 − ${fr(14, 25)} = ${ok(11, 25)}</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Kermesse',
    context: `À une kermesse, un sac contient des tickets tous identiques au toucher :
      <strong>5 tickets « Gagne un livre »</strong>, <strong>10 tickets « Gagne un stylo »</strong>
      et <strong>15 tickets « Perdu »</strong>. On tire un ticket au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de tickets dans le sac au total ?', ans: 30,
      steps: `<div>5 + 10 + 15 = <strong>30 tickets</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'L', eventDesc: 'Gagner un livre.',
        question: 'Détermine la probabilité de l\'événement L.',
        ans: { n: 5, d: 30 }, isComplement: false,
        steps: `<div>Les tickets sont identiques : les <strong>30 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>5 tickets « livre »</strong> → 5 issues favorables.</div>
          <div style="margin-top:8px;">P(L) = ${fr(5, 30, 'var(--c6)')} = ${ok(1, 6)} (simplifié)</div>`,
      },
      {
        eventLabel: 'S', eventDesc: 'Gagner un stylo.',
        question: 'Détermine la probabilité de l\'événement S.',
        ans: { n: 10, d: 30 }, isComplement: false,
        steps: `<div><strong>10 tickets « stylo »</strong> sur 30.</div>
          <div style="margin-top:8px;">P(S) = ${fr(10, 30, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('L'),
        question: 'Calcule la probabilité de l\'événement contraire de L.',
        ans: { n: 25, d: 30 }, isComplement: true,
        steps: `<div>Contraire de L : « ne pas gagner un livre » (stylos + perdus : 10 + 15 = 25).</div>
          <div style="margin-top:8px;">Formule : P(${bar('L')}) = 1 − P(L) = 1 − ${fr(5, 30)} = ${fr(25, 30, 'var(--c6)')} = ${ok(5, 6)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Sachet de bonbons',
    context: `Un sachet contient des bonbons tous identiques au toucher :
      <strong>4 à la fraise</strong>, <strong>6 au citron</strong>, <strong>5 à la framboise</strong>
      et <strong>3 à l'orange</strong>. On tire un bonbon au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de bonbons dans le sachet au total ?', ans: 18,
      steps: `<div>4 + 6 + 5 + 3 = <strong>18 bonbons</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'A', eventDesc: 'Tirer un bonbon à la fraise.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 4, d: 18 }, isComplement: false,
        steps: `<div>Les bonbons sont identiques : les <strong>18 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>4 bonbons à la fraise</strong> → 4 issues favorables.</div>
          <div style="margin-top:8px;">P(A) = ${fr(4, 18, 'var(--c6)')} = ${ok(2, 9)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer un bonbon au citron.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 6, d: 18 }, isComplement: false,
        steps: `<div><strong>6 bonbons au citron</strong> sur 18.</div>
          <div style="margin-top:8px;">P(B) = ${fr(6, 18, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('A'),
        question: 'Calcule la probabilité de l\'événement contraire de A.',
        ans: { n: 14, d: 18 }, isComplement: true,
        steps: `<div>Contraire de A : « ne pas tirer un bonbon à la fraise » (citron + framboise + orange : 6 + 5 + 3 = 14).</div>
          <div style="margin-top:8px;">Formule : P(${bar('A')}) = 1 − P(A) = 1 − ${fr(4, 18)} = ${fr(14, 18, 'var(--c6)')} = ${ok(7, 9)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Bibliothèque',
    context: `Dans une bibliothèque scolaire, les livres sont rangés par genre :
      <strong>15 romans</strong>, <strong>12 bandes dessinées</strong> et <strong>13 livres de sciences</strong>.
      On choisit un livre au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de livres au total ?', ans: 40,
      steps: `<div>15 + 12 + 13 = <strong>40 livres</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'R', eventDesc: 'Choisir un roman.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 15, d: 40 }, isComplement: false,
        steps: `<div>Les livres sont choisis au hasard : les <strong>40 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>15 romans</strong> → 15 issues favorables.</div>
          <div style="margin-top:8px;">P(R) = ${fr(15, 40, 'var(--c6)')} = ${ok(3, 8)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Choisir une bande dessinée.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 12, d: 40 }, isComplement: false,
        steps: `<div><strong>12 bandes dessinées</strong> sur 40.</div>
          <div style="margin-top:8px;">P(B) = ${fr(12, 40, 'var(--c6)')} = ${ok(3, 10)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('R'),
        question: 'Calcule la probabilité de l\'événement contraire de R.',
        ans: { n: 25, d: 40 }, isComplement: true,
        steps: `<div>Contraire de R : « ne pas choisir un roman » (BD + sciences : 12 + 13 = 25).</div>
          <div style="margin-top:8px;">Formule : P(${bar('R')}) = 1 − P(R) = 1 − ${fr(15, 40)} = ${fr(25, 40, 'var(--c6)')} = ${ok(5, 8)} (simplifié)</div>`,
      },
    ],
  },
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Panier de fruits',
    context: `Un panier contient des fruits tous identiques à l'aspect extérieur :
      <strong>8 pommes</strong>, <strong>6 poires</strong> et <strong>10 oranges</strong>. On prend un fruit au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de fruits dans le panier au total ?', ans: 24,
      steps: `<div>8 + 6 + 10 = <strong>24 fruits</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'P', eventDesc: 'Prendre une pomme.',
        question: 'Détermine la probabilité de l\'événement P.',
        ans: { n: 8, d: 24 }, isComplement: false,
        steps: `<div>Les fruits sont identiques au toucher : les <strong>24 issues sont équiprobables</strong>.</div>
          <div style="margin-top:8px;"><strong>8 pommes</strong> → 8 issues favorables.</div>
          <div style="margin-top:8px;">P(P) = ${fr(8, 24, 'var(--c6)')} = ${ok(1, 3)} (simplifié)</div>`,
      },
      {
        eventLabel: 'O', eventDesc: 'Prendre une orange.',
        question: 'Détermine la probabilité de l\'événement O.',
        ans: { n: 10, d: 24 }, isComplement: false,
        steps: `<div><strong>10 oranges</strong> sur 24.</div>
          <div style="margin-top:8px;">P(O) = ${fr(10, 24, 'var(--c6)')} = ${ok(5, 12)} (simplifié)</div>`,
      },
      {
        eventLabel: bar('P'),
        question: 'Calcule la probabilité de l\'événement contraire de P.',
        ans: { n: 16, d: 24 }, isComplement: true,
        steps: `<div>Contraire de P : « ne pas prendre une pomme » (poires + oranges : 6 + 10 = 16).</div>
          <div style="margin-top:8px;">Formule : P(${bar('P')}) = 1 − P(P) = 1 − ${fr(8, 24)} = ${fr(16, 24, 'var(--c6)')} = ${ok(2, 3)} (simplifié)</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Groupe 6 — Boules avec lettre (table couleur × lettre) — 5 variantes
// 3 avec comparaison oui/non en 3ème sous-question, 2 sans (style exo proba 2)
// ═══════════════════════════════════════════════════════════════════════════════

// Helper table HTML
const thH = (s: string) =>
  `<th style="border:1px solid var(--border2);padding:5px 10px;background:var(--surface2);font-size:13px;font-weight:600">${s}</th>`;
const tdH = (n: number) =>
  `<td style="border:1px solid var(--border2);padding:5px 10px;text-align:center;font-size:13px">${n}</td>`;
const tbl = (cols: string[], rowLabels: string[], data: number[][]) =>
  `<table style="border-collapse:collapse;margin:10px 0"><tr>${thH('Lettre / Couleur')}${cols.map(thH).join('')}</tr>${rowLabels.map((r, i) => `<tr>${thH(r)}${data[i]!.map(tdH).join('')}</tr>`).join('')}</table>`;

const BOULES_LETTRES_VARIANTS: ProbaGroupExercise[] = [

  // ── Variante 1 — Comparaison OUI (exactement l'exercice du PDF) ──────────────
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules avec lettres',
    context: `On place dans un sac des boules toutes indiscernables au toucher. Sur chaque boule est inscrite une lettre.
      Le tableau suivant présente la répartition des boules.
      ${tbl(['Rouge', 'Vert', 'Bleu'], ['A', 'B'], [[3, 5, 2], [2, 2, 6]])}
      On tire une boule au hasard.
      ${bouleLettresSvg([
        { color: CLR.rouge, letter: 'A', n: 3 }, { color: CLR.vert, letter: 'A', n: 5 }, { color: CLR.bleu, letter: 'A', n: 2 },
        { color: CLR.rouge, letter: 'B', n: 2 }, { color: CLR.vert, letter: 'B', n: 2 }, { color: CLR.bleu, letter: 'B', n: 6 },
      ])}`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 20,
      steps: `<div>3 + 5 + 2 + 2 + 2 + 6 = <strong>20 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'R', eventDesc: 'Tirer une boule rouge, quelle que soit sa lettre.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 5, d: 20 }, isComplement: false,
        steps: `<div>Boules rouges : 3 (lettre A) + 2 (lettre B) = <strong>5 boules rouges</strong>.</div>
          <div style="margin-top:8px;">P(R) = ${fr(5, 20, 'var(--c6)')} = ${ok(1, 4)} (simplifié)</div>`,
      },
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule portant la lettre A, quelle que soit sa couleur.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 10, d: 20 }, isComplement: false,
        steps: `<div>Boules portant la lettre A : 3 (rouge) + 5 (vert) + 2 (bleu) = <strong>10 boules</strong>.</div>
          <div style="margin-top:8px;">P(A) = ${fr(10, 20, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: '', isYesNo: true, ansYesNo: true,
        question: 'A-t-on autant de chances de tirer une boule portant la lettre A que de tirer une boule portant la lettre B ?',
        ans: { n: 0, d: 1 }, isComplement: false,
        steps: `<div>P(lettre A) = ${fr(10, 20)} = ${fr(1, 2, 'var(--c6)')}.</div>
          <div style="margin-top:6px;">P(lettre B) = ${fr('2+2+6', 20)} = ${fr(10, 20)} = ${fr(1, 2, 'var(--c6)')}.</div>
          <div style="margin-top:6px;">P(A) = P(B) → les chances sont <strong>identiques</strong> → <strong>Oui</strong>.</div>`,
      },
    ],
  },

  // ── Variante 2 — Comparaison NON ────────────────────────────────────────────
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules avec lettres',
    context: `On place dans un sac des boules toutes indiscernables au toucher. Sur chaque boule est inscrite une lettre.
      Le tableau suivant présente la répartition des boules.
      ${tbl(['Rouge', 'Vert', 'Bleu'], ['A', 'B'], [[4, 3, 5], [2, 4, 2]])}
      On tire une boule au hasard.
      ${bouleLettresSvg([
        { color: CLR.rouge, letter: 'A', n: 4 }, { color: CLR.vert, letter: 'A', n: 3 }, { color: CLR.bleu, letter: 'A', n: 5 },
        { color: CLR.rouge, letter: 'B', n: 2 }, { color: CLR.vert, letter: 'B', n: 4 }, { color: CLR.bleu, letter: 'B', n: 2 },
      ])}`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 20,
      steps: `<div>4 + 3 + 5 + 2 + 4 + 2 = <strong>20 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'R', eventDesc: 'Tirer une boule rouge, quelle que soit sa lettre.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 6, d: 20 }, isComplement: false,
        steps: `<div>Boules rouges : 4 (lettre A) + 2 (lettre B) = <strong>6 boules</strong>.</div>
          <div style="margin-top:8px;">P(R) = ${fr(6, 20, 'var(--c6)')} = ${ok(3, 10)} (simplifié)</div>`,
      },
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule portant la lettre A.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 12, d: 20 }, isComplement: false,
        steps: `<div>Boules portant la lettre A : 4 + 3 + 5 = <strong>12 boules</strong>.</div>
          <div style="margin-top:8px;">P(A) = ${fr(12, 20, 'var(--c6)')} = ${ok(3, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: '', isYesNo: true, ansYesNo: false,
        question: 'A-t-on autant de chances de tirer une boule portant la lettre A que de tirer une boule portant la lettre B ?',
        ans: { n: 0, d: 1 }, isComplement: false,
        steps: `<div>P(lettre A) = ${fr(12, 20)} = ${fr(3, 5, 'var(--c6)')}.</div>
          <div style="margin-top:6px;">P(lettre B) = ${fr('2+4+2', 20)} = ${fr(8, 20)} = ${fr(2, 5, 'var(--c6)')}.</div>
          <div style="margin-top:6px;">P(A) ≠ P(B) → les chances sont <strong>différentes</strong> → <strong>Non</strong>.</div>`,
      },
    ],
  },

  // ── Variante 3 — Comparaison OUI (2 couleurs) ────────────────────────────────
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules avec lettres',
    context: `On place dans un sac des boules toutes indiscernables au toucher. Sur chaque boule est inscrite une lettre.
      Le tableau suivant présente la répartition des boules.
      ${tbl(['Rouge', 'Vert'], ['A', 'B'], [[7, 3], [3, 7]])}
      On tire une boule au hasard.
      ${bouleLettresSvg([
        { color: CLR.rouge, letter: 'A', n: 7 }, { color: CLR.vert, letter: 'A', n: 3 },
        { color: CLR.rouge, letter: 'B', n: 3 }, { color: CLR.vert, letter: 'B', n: 7 },
      ])}`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 20,
      steps: `<div>7 + 3 + 3 + 7 = <strong>20 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'R', eventDesc: 'Tirer une boule rouge, quelle que soit sa lettre.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 10, d: 20 }, isComplement: false,
        steps: `<div>Boules rouges : 7 (lettre A) + 3 (lettre B) = <strong>10 boules</strong>.</div>
          <div style="margin-top:8px;">P(R) = ${fr(10, 20, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule portant la lettre A.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 10, d: 20 }, isComplement: false,
        steps: `<div>Boules portant la lettre A : 7 (rouge) + 3 (vert) = <strong>10 boules</strong>.</div>
          <div style="margin-top:8px;">P(A) = ${fr(10, 20, 'var(--c6)')} = ${ok(1, 2)} (simplifié)</div>`,
      },
      {
        eventLabel: '', isYesNo: true, ansYesNo: true,
        question: 'A-t-on autant de chances de tirer une boule portant la lettre A que de tirer une boule portant la lettre B ?',
        ans: { n: 0, d: 1 }, isComplement: false,
        steps: `<div>P(lettre A) = ${fr(10, 20)} = ${fr(1, 2, 'var(--c6)')}.</div>
          <div style="margin-top:6px;">P(lettre B) = ${fr('3+7', 20)} = ${fr(10, 20)} = ${fr(1, 2, 'var(--c6)')}.</div>
          <div style="margin-top:6px;">P(A) = P(B) → les chances sont <strong>identiques</strong> → <strong>Oui</strong>.</div>`,
      },
    ],
  },

  // ── Variante 4 — Style "exo proba 2" (plus de données, sans comparaison) ────
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules avec lettres',
    context: `On place dans un sac des boules toutes indiscernables au toucher. Sur chaque boule est inscrite une lettre.
      Le tableau suivant présente la répartition des boules.
      ${tbl(['Rouge', 'Vert', 'Bleu', 'Jaune'], ['A', 'B'], [[4, 3, 2, 3], [2, 4, 5, 2]])}
      On tire une boule au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 25,
      steps: `<div>4 + 3 + 2 + 3 + 2 + 4 + 5 + 2 = <strong>25 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'R', eventDesc: 'Tirer une boule rouge, quelle que soit sa lettre.',
        question: 'Détermine la probabilité de l\'événement R.',
        ans: { n: 6, d: 25 }, isComplement: false,
        steps: `<div>Boules rouges : 4 (lettre A) + 2 (lettre B) = <strong>6 boules rouges</strong>.</div>
          <div style="margin-top:8px;">P(R) = ${ok(6, 25)}</div>`,
      },
      {
        eventLabel: 'A', eventDesc: 'Tirer une boule portant la lettre A.',
        question: 'Détermine la probabilité de l\'événement A.',
        ans: { n: 12, d: 25 }, isComplement: false,
        steps: `<div>Boules portant la lettre A : 4 + 3 + 2 + 3 = <strong>12 boules</strong>.</div>
          <div style="margin-top:8px;">P(A) = ${ok(12, 25)}</div>`,
      },
      {
        eventLabel: 'B·bleu', eventDesc: 'Tirer une boule bleue portant la lettre B.',
        question: 'Détermine la probabilité de l\'événement B·bleu.',
        ans: { n: 5, d: 25 }, isComplement: false,
        steps: `<div>Les boules <strong>bleues portant la lettre B</strong> : il y en a <strong>5</strong> (case Bleu/B).</div>
          <div style="margin-top:8px;">P(B·bleu) = ${fr(5, 25, 'var(--c6)')} = ${ok(1, 5)} (simplifié)</div>`,
      },
    ],
  },

  // ── Variante 5 — Style "exo proba 2" (grand effectif, sans comparaison) ─────
  {
    type: 'default', exKind: 'proba-group',
    groupTitle: 'Exercice — Boules avec lettres',
    context: `On place dans un sac des boules toutes indiscernables au toucher. Sur chaque boule est inscrite une lettre.
      Le tableau suivant présente la répartition des boules.
      ${tbl(['Rouge', 'Vert', 'Bleu'], ['A', 'B', 'C'], [[6, 4, 2], [3, 5, 4], [2, 3, 1]])}
      On tire une boule au hasard.`,
    countQuestion: { question: 'Combien y a-t-il de boules dans le sac au total ?', ans: 30,
      steps: `<div>6 + 4 + 2 + 3 + 5 + 4 + 2 + 3 + 1 = <strong>30 boules</strong> au total.</div>` },
    subquestions: [
      {
        eventLabel: 'V', eventDesc: 'Tirer une boule verte, quelle que soit sa lettre.',
        question: 'Détermine la probabilité de l\'événement V.',
        ans: { n: 12, d: 30 }, isComplement: false,
        steps: `<div>Boules vertes : 4 (lettre A) + 5 (lettre B) + 3 (lettre C) = <strong>12 boules vertes</strong>.</div>
          <div style="margin-top:8px;">P(V) = ${fr(12, 30, 'var(--c6)')} = ${ok(2, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: 'B', eventDesc: 'Tirer une boule portant la lettre B.',
        question: 'Détermine la probabilité de l\'événement B.',
        ans: { n: 12, d: 30 }, isComplement: false,
        steps: `<div>Boules portant la lettre B : 3 (rouge) + 5 (vert) + 4 (bleu) = <strong>12 boules</strong>.</div>
          <div style="margin-top:8px;">P(B) = ${fr(12, 30, 'var(--c6)')} = ${ok(2, 5)} (simplifié)</div>`,
      },
      {
        eventLabel: 'R·A', eventDesc: 'Tirer une boule rouge portant la lettre A.',
        question: 'Détermine la probabilité de l\'événement R·A.',
        ans: { n: 6, d: 30 }, isComplement: false,
        steps: `<div>Les boules <strong>rouges portant la lettre A</strong> : il y en a <strong>6</strong> (case Rouge/A).</div>
          <div style="margin-top:8px;">P(R·A) = ${fr(6, 30, 'var(--c6)')} = ${ok(1, 5)} (simplifié)</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_GROUPS = [DE_VARIANTS, SAC_VARIANTS, BOULES_VARIANTS, ROUE_VARIANTS, PROBLEME_VARIANTS, BOULES_LETTRES_VARIANTS];

export const PROBA_DEFAULT: ProbaGroupExercise[] = [
  DE_VARIANTS[0]!,
  SAC_VARIANTS[0]!,
  BOULES_LETTRES_VARIANTS[0]!,
  ROUE_VARIANTS[0]!,
  PROBLEME_VARIANTS[0]!,
];

export function generateProbaSeries(count: number): (ProbaVocabExercise | ProbaGroupExercise)[] {
  const shuffledGroups = [...ALL_GROUPS].sort(() => Math.random() - 0.5).slice(0, Math.min(count, ALL_GROUPS.length));
  const picked = shuffledGroups.map((group) => group[Math.floor(Math.random() * group.length)]!);
  return [probaVocabCard, ...picked];
}
