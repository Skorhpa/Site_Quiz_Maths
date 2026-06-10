import type { QuizDefinition, AutoQCMExercise, AutoCalcExercise } from '@/types';

type AEx = AutoQCMExercise | AutoCalcExercise;

const fr = (n: number | string, d: number | string, col = 'var(--text)') =>
  `<span class="frac" style="color:${col}"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;
const ok = (s: string) => `<strong style="color:var(--correct)">${s}</strong>`;

// Chapeau sur les lettres d'un angle (∧ centré au-dessus des lettres)
const hat = (s: string) =>
  `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.2;vertical-align:middle;margin:0 1px;font-style:normal"><span style="font-size:0.6em;align-self:stretch;text-align:center;line-height:1">∧</span><span>${s}</span></span>`;

// ── SVG helpers ───────────────────────────────────────────────────────────────

// Triangle rectangle générique : B = angle droit (bas-gauche), A = haut-gauche, C = bas-droit
function rtriSVG(opts: {
  ax: number; ay: number; bx: number; by: number; cx: number; cy: number;
  lA?: string; lB?: string; lC?: string;
  sAB?: string; sBC?: string; sAC?: string;
  angA?: string; angC?: string;
  W?: number; H?: number;
}): string {
  const { ax, ay, bx, by, cx, cy } = opts;
  const sq = 9;
  const daX = ax - bx, daY = ay - by;
  const dcX = cx - bx, dcY = cy - by;
  const lenA = Math.sqrt(daX * daX + daY * daY);
  const lenC = Math.sqrt(dcX * dcX + dcY * dcY);
  const uaX = daX / lenA, uaY = daY / lenA;
  const ucX = dcX / lenC, ucY = dcY / lenC;
  const sq1X = (bx + uaX * sq).toFixed(1), sq1Y = (by + uaY * sq).toFixed(1);
  const sq2X = (bx + ucX * sq).toFixed(1), sq2Y = (by + ucY * sq).toFixed(1);
  const sq3X = (bx + uaX * sq + ucX * sq).toFixed(1), sq3Y = (by + uaY * sq + ucY * sq).toFixed(1);
  const W = opts.W ?? 180, H = opts.H ?? 140;
  const midAC_x = ((ax + cx) / 2).toFixed(1), midAC_y = ((ay + cy) / 2).toFixed(1);
  return `<div style="display:flex;justify-content:center;margin:6px 0">
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="none" stroke="var(--text)" stroke-width="1.5"/>
  <path d="M${sq1X},${sq1Y} L${sq3X},${sq3Y} L${sq2X},${sq2Y}" fill="none" stroke="var(--text)" stroke-width="1"/>
  ${opts.lA ? `<text x="${ax}" y="${ay - 7}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">${opts.lA}</text>` : ''}
  ${opts.lB ? `<text x="${bx - 12}" y="${by + 6}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">${opts.lB}</text>` : ''}
  ${opts.lC ? `<text x="${cx + 12}" y="${cy + 6}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">${opts.lC}</text>` : ''}
  ${opts.sAB ? `<text x="${(ax + bx) / 2 - 18}" y="${(ay + by) / 2 + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${opts.sAB}</text>` : ''}
  ${opts.sBC ? `<text x="${(bx + cx) / 2}" y="${by + 17}" text-anchor="middle" font-size="11" fill="var(--muted)">${opts.sBC}</text>` : ''}
  ${opts.sAC ? `<text x="${parseFloat(midAC_x) + 14}" y="${parseFloat(midAC_y) - 5}" text-anchor="start" font-size="11" fill="var(--muted)">${opts.sAC}</text>` : ''}
  ${opts.angA ? `<text x="${ax + 17}" y="${ay + 20}" font-size="10" fill="var(--muted)">${opts.angA}</text>` : ''}
  ${opts.angC ? `<text x="${cx - 22}" y="${cy - 12}" font-size="10" fill="var(--muted)">${opts.angC}</text>` : ''}
</svg></div>`;
}

// Triangle de Thalès : apex en haut, droite parallèle à la base
function thalesSVG(opts: {
  lApex?: string; lBL?: string; lBR?: string; lML?: string; lMR?: string;
  s1?: string; s2?: string; sBase?: string; sMid?: string;
  ratio?: number; W?: number; H?: number;
}): string {
  const r = opts.ratio ?? 0.5;
  const W = opts.W ?? 175, H = opts.H ?? 145;
  const ax = W / 2, ay = 18;
  const blx = 18, bly = H - 22;
  const brx = W - 18, bry = H - 22;
  const mlx = ax + (blx - ax) * r, mly = ay + (bly - ay) * r;
  const mrx = ax + (brx - ax) * r, mry = ay + (bry - ay) * r;
  return `<div style="display:flex;justify-content:center;margin:6px 0">
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <polygon points="${ax},${ay} ${blx},${bly} ${brx},${bry}" fill="none" stroke="var(--text)" stroke-width="1.5"/>
  <line x1="${mlx.toFixed(1)}" y1="${mly.toFixed(1)}" x2="${mrx.toFixed(1)}" y2="${mry.toFixed(1)}" stroke="var(--c2)" stroke-width="1.5"/>
  ${opts.lApex ? `<text x="${ax}" y="${ay - 7}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">${opts.lApex}</text>` : ''}
  ${opts.lBL ? `<text x="${blx - 10}" y="${bly + 10}" font-size="13" font-weight="600" fill="var(--text)">${opts.lBL}</text>` : ''}
  ${opts.lBR ? `<text x="${brx + 4}" y="${bry + 10}" font-size="13" font-weight="600" fill="var(--text)">${opts.lBR}</text>` : ''}
  ${opts.lML ? `<text x="${mlx - 10}" y="${mly + 4}" text-anchor="end" font-size="13" font-weight="600" fill="var(--text)">${opts.lML}</text>` : ''}
  ${opts.lMR ? `<text x="${mrx + 4}" y="${mry + 4}" font-size="13" font-weight="600" fill="var(--text)">${opts.lMR}</text>` : ''}
  ${opts.s1 ? `<text x="${(ax + mlx) / 2 - 14}" y="${(ay + mly) / 2 + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${opts.s1}</text>` : ''}
  ${opts.s2 ? `<text x="${(mlx + blx) / 2 - 14}" y="${(mly + bly) / 2 + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${opts.s2}</text>` : ''}
  ${opts.sBase ? `<text x="${(blx + brx) / 2}" y="${bly + 16}" text-anchor="middle" font-size="11" fill="var(--muted)">${opts.sBase}</text>` : ''}
  ${opts.sMid ? `<text x="${(mlx + mrx) / 2}" y="${mly - 8}" text-anchor="middle" font-size="11" fill="var(--c2)">${opts.sMid}</text>` : ''}
</svg></div>`;
}

// Carré avec disque inscrit (Q38)
const squareDiskSVG = (): string =>
  `<div style="display:flex;justify-content:center;margin:6px 0">
<svg width="118" height="112" viewBox="0 0 118 112">
  <rect x="9" y="8" width="80" height="80" fill="var(--surface2)" stroke="var(--text)" stroke-width="1.5"/>
  <circle cx="49" cy="48" r="40" fill="var(--bg)" stroke="var(--text)" stroke-width="1.5"/>
  <line x1="9" y1="98" x2="89" y2="98" stroke="var(--muted)" stroke-width="0.8"/>
  <line x1="9" y1="95" x2="9" y2="101" stroke="var(--muted)" stroke-width="0.8"/>
  <line x1="89" y1="95" x2="89" y2="101" stroke="var(--muted)" stroke-width="0.8"/>
  <text x="49" y="110" text-anchor="middle" font-size="11" fill="var(--muted)">10 cm</text>
</svg></div>`;

// ═══════════════════════════════════════════════════════════════════════════
// SÉRIE 1 — Q1 à Q10
// ═══════════════════════════════════════════════════════════════════════════

const S1: AEx[] = [
  // Q1 Fractions
  {
    type: 'default', exKind: 'auto-calc', qnum: 1, category: 'Fractions',
    questionHtml: `Calculer &nbsp;<em>A</em> = ${fr(3, 4)} − ${fr(2, 5)}.`,
    parts: [{
      label: 'A =',
      answer: '7/20',
      stepsHtml: `<div>Réduire au même dénominateur (ppcm de 4 et 5 = 20) :</div>
        <div style="margin-top:6px">A = ${fr(3,4)} − ${fr(2,5)} = ${fr(15,20)} − ${fr(8,20)} = ${ok('7/20')}</div>`,
    }],
  },
  // Q2 Équations
  {
    type: 'default', exKind: 'auto-calc', qnum: 2, category: 'Équations',
    questionHtml: `Résoudre l'équation &nbsp;<strong>3(2x − 4) = 2x + 8</strong>.`,
    parts: [{
      label: 'x =',
      answer: '5',
      stepsHtml: `<div>3(2x − 4) = 2x + 8</div>
        <div style="margin-top:4px">6x − 12 = 2x + 8</div>
        <div style="margin-top:4px">4x = 20</div>
        <div style="margin-top:4px">x = ${ok('5')}</div>
        <div style="margin-top:6px;color:var(--muted);font-size:12px">Vérif. : 3(10 − 4) = 18 et 10 + 8 = 18 ✓</div>`,
    }],
  },
  // Q3 Statistiques
  {
    type: 'default', exKind: 'auto-calc', qnum: 3, category: 'Statistiques',
    questionHtml: `Voici une série de dix valeurs : <strong>5 ; 14 ; 8 ; 20 ; 8 ; 3 ; 17 ; 8 ; 11 ; 6</strong>.<br>Déterminer la médiane et le mode de cette série.`,
    parts: [
      {
        label: 'Médiane =',
        answer: '8',
        stepsHtml: `<div>Série triée : 3 ; 5 ; 6 ; 8 ; <strong>8 ; 8</strong> ; 11 ; 14 ; 17 ; 20</div>
          <div style="margin-top:6px">n = 10 valeurs → médiane = (5ᵉ + 6ᵉ) ÷ 2 = (8 + 8) ÷ 2 = ${ok('8')}</div>`,
      },
      {
        label: 'Mode =',
        answer: '8',
        stepsHtml: `<div>La valeur 8 apparaît 3 fois → mode = ${ok('8')}</div>`,
      },
    ],
  },
  // Q4 Probabilités (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 4, category: 'Probabilités',
    questionHtml: `Un dé équilibré à 6 faces est lancé. Quelle est la probabilité d'obtenir un nombre <strong>pair strictement supérieur à 2</strong> ?`,
    choices: [fr(1,3), fr(1,2), fr(2,3), fr(1,6)],
    correctIndex: 0,
    stepsHtml: `<div>Nombres pairs strictement supérieurs à 2 parmi 1 à 6 : <strong>4 et 6</strong> → 2 issues favorables sur 6.</div>
      <div style="margin-top:6px">P = ${fr(2,6)} = ${ok(fr(1,3,'var(--correct)'))}</div>`,
  },
  // Q5 Pythagore
  {
    type: 'default', exKind: 'auto-calc', qnum: 5, category: 'Pythagore',
    questionHtml: `Dans le triangle ABC rectangle en B représenté ci-dessous, <strong>AB = 6 cm</strong> et <strong>AC = 10 cm</strong>.
      <br><em>a.</em> Calculer BC. &nbsp; <em>b.</em> Calculer le périmètre du triangle.
      ${rtriSVG({ ax:30,ay:20, bx:30,by:92, cx:120,cy:92, lA:'A', lB:'B', lC:'C', sAB:'6 cm', sBC:'?', sAC:'10 cm', W:158, H:115 })}`,
    parts: [
      {
        label: 'BC (cm) =',
        answer: '8',
        stepsHtml: `<div>BC² = AC² − AB² = 100 − 36 = 64</div>
          <div style="margin-top:6px">BC = ${ok('8')} cm</div>`,
      },
      {
        label: 'Périmètre (cm) =',
        answer: '24',
        stepsHtml: `<div>Périmètre = AB + BC + AC = 6 + 8 + 10 = ${ok('24')} cm</div>`,
      },
    ],
  },
  // Q6 Trigonométrie
  {
    type: 'default', exKind: 'auto-calc', qnum: 6, category: 'Trigonométrie',
    questionHtml: `Dans le triangle ABC rectangle en B représenté ci-dessous, <strong>AB = 5 cm</strong> et <strong>${hat('BAC')} = 35°</strong>.
      <br><em>a.</em> Écrire la relation trigonométrique permettant de calculer BC. &nbsp; <em>b.</em> Calculer ${hat('BCA')}.
      ${rtriSVG({ ax:30,ay:18, bx:30,by:90, cx:80,cy:90, lA:'A', lB:'B', lC:'C', sAB:'5 cm', sBC:'?', angA:'35°', W:118, H:112 })}`,
    parts: [
      {
        label: 'BC =',
        answer: '5tan35',
        altAnswers: ['5*tan35', '5*tan(35)', '5×tan35', '5×tan(35)', 'tan(35)*5', 'tan35*5'],
        stepsHtml: `<div>tan(${hat('BAC')}) = BC / AB &nbsp;⟹&nbsp; BC = AB × tan(${hat('BAC')})</div>
          <div style="margin-top:6px">BC = ${ok('5 × tan(35°)')} ≈ 3,5 cm</div>`,
      },
      {
        label: `${hat('BCA')} (°) =`,
        answer: '55',
        stepsHtml: `<div>${hat('BCA')} = 180° − 90° − 35° = ${ok('55°')}</div>`,
      },
    ],
  },
  // Q7 Pourcentages
  {
    type: 'default', exKind: 'auto-calc', qnum: 7, category: 'Pourcentages',
    questionHtml: `Un article coûte <strong>120 €</strong>. Son prix baisse de <strong>15 %</strong>, puis le nouveau prix augmente de <strong>10 %</strong>.<br>
      <em>a.</em> Quel est le coefficient multiplicateur global ? &nbsp; <em>b.</em> Quel est le prix final ?`,
    parts: [
      {
        label: 'Coefficient multiplicateur =',
        answer: '0,935',
        altAnswers: ['0.935'],
        stepsHtml: `<div>0,85 × 1,10 = ${ok('0,935')}</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Soit une réduction globale de 6,5 %</div>`,
      },
      {
        label: 'Prix final (€) =',
        answer: '112,20',
        altAnswers: ['112.20', '112,2', '112.2'],
        stepsHtml: `<div>120 × 0,935 = ${ok('112,20')} €</div>`,
      },
    ],
  },
  // Q8 Notation scientifique
  {
    type: 'default', exKind: 'auto-calc', qnum: 8, category: 'Notation scientifique',
    questionHtml: `Exprimer sous forme de notation scientifique :<br>
      <strong>a.</strong> &nbsp;4,5 × 10⁴ × 3 × 10³ &nbsp;&nbsp;&nbsp; <strong>b.</strong> &nbsp;${fr('9 × 10⁷', '3 × 10²')}`,
    parts: [
      {
        label: 'a. =',
        answer: '1,35×10^8',
        altAnswers: ['1.35×10^8', '1,35*10^8', '1.35*10^8', '1,35×10⁸'],
        stepsHtml: `<div>4,5 × 3 = 13,5 &nbsp;et&nbsp; 10⁴ × 10³ = 10⁷</div>
          <div style="margin-top:4px">13,5 × 10⁷ = ${ok('1,35 × 10⁸')}</div>`,
      },
      {
        label: 'b. =',
        answer: '3×10^5',
        altAnswers: ['3*10^5', '3×10⁵'],
        stepsHtml: `<div>${fr(9,3)} × 10^(7−2) = 3 × 10⁵ = ${ok('3 × 10⁵')}</div>`,
      },
    ],
  },
  // Q9 Fonctions
  {
    type: 'default', exKind: 'auto-calc', qnum: 9, category: 'Fonctions',
    questionHtml: `On considère <em>g</em> : x ↦ −2x + 7.<br>
      <em>a.</em> Calculer g(0) et g(3). &nbsp; <em>b.</em> Déterminer l'antécédent de −3 par g.`,
    parts: [
      {
        label: 'g(0) =',
        answer: '7',
        stepsHtml: `<div>g(0) = −2 × 0 + 7 = ${ok('7')}</div>`,
      },
      {
        label: 'g(3) =',
        answer: '1',
        stepsHtml: `<div>g(3) = −2 × 3 + 7 = −6 + 7 = ${ok('1')}</div>`,
      },
      {
        label: 'Antécédent de −3 : x =',
        answer: '5',
        stepsHtml: `<div>−2x + 7 = −3 &nbsp;⟹&nbsp; −2x = −10 &nbsp;⟹&nbsp; x = ${ok('5')}</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : g(5) = −10 + 7 = −3 ✓</div>`,
      },
    ],
  },
  // Q10 Programmation
  {
    type: 'default', exKind: 'auto-calc', qnum: 10, category: 'Programmation',
    questionHtml: `Un programme dessine un <strong>pentagone régulier</strong> de côté 60 pas.<br>
      <em>a.</em> Combien de fois l'instruction « avancer de 60 pas » est-elle répétée ?<br>
      <em>b.</em> De combien de degrés le lutin tourne-t-il à chaque étape ?<br>
      <em>(Rappel : la somme des angles extérieurs d'un polygone convexe est 360°.)</em>`,
    parts: [
      {
        label: 'Nombre de répétitions =',
        answer: '5',
        stepsHtml: `<div>Un pentagone a 5 côtés → l'instruction est répétée ${ok('5')} fois.</div>`,
      },
      {
        label: 'Angle de rotation (°) =',
        answer: '72',
        stepsHtml: `<div>Angle extérieur = 360° ÷ 5 = ${ok('72°')} à chaque étape.</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SÉRIE 2 — Q11 à Q20
// ═══════════════════════════════════════════════════════════════════════════

const S2: AEx[] = [
  // Q11 Fractions
  {
    type: 'default', exKind: 'auto-calc', qnum: 11, category: 'Fractions',
    questionHtml: `Calculer &nbsp;<em>C</em> = ${fr(5,6)} × ${fr(3,10)}.`,
    parts: [{
      label: 'C =',
      answer: '1/4',
      stepsHtml: `<div>${fr(5,6)} × ${fr(3,10)} = ${fr(15,60)} = ${ok(fr(1,4,'var(--correct)'))}</div>
        <div style="margin-top:4px;color:var(--muted);font-size:12px">Raccourci : ${fr(5,10)} × ${fr(3,6)} = ${fr(1,2)} × ${fr(1,2)} = ${fr(1,4)}</div>`,
    }],
  },
  // Q12 Statistiques
  {
    type: 'default', exKind: 'auto-calc', qnum: 12, category: 'Statistiques',
    questionHtml: `La moyenne d'une série de 6 nombres est 12. On ajoute la valeur 18 à la série.<br>Quelle est la nouvelle moyenne des 7 nombres ?`,
    parts: [{
      label: 'Nouvelle moyenne =',
      answer: '12,86',
      altAnswers: ['12.86', '90/7', '12,857'],
      stepsHtml: `<div>Somme initiale : 6 × 12 = 72</div>
        <div style="margin-top:4px">Nouvelle somme : 72 + 18 = 90</div>
        <div style="margin-top:4px">Nouvelle moyenne : 90 ÷ 7 ≈ ${ok('12,86')}</div>`,
    }],
  },
  // Q13 Repérage (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 13, category: 'Repérage',
    questionHtml: `La droite d'équation <strong>y = 3x − 2</strong> passe par le point :`,
    choices: ['(0 ; −2)', '(1 ; 2)', '(2 ; 3)', '(−1 ; 5)'],
    correctIndex: 0,
    stepsHtml: `<div>On vérifie y = 3x − 2 en chaque point :</div>
      <div style="margin-top:4px"><strong>(0 ; −2)</strong> : 3 × 0 − 2 = −2 ✓</div>
      <div>(1 ; 2) : 3 × 1 − 2 = 1 ≠ 2 &nbsp;|&nbsp; (2 ; 3) : 4 ≠ 3 &nbsp;|&nbsp; (−1 ; 5) : −5 ≠ 5</div>
      <div style="margin-top:6px">${ok('Réponse : (0 ; −2)')}</div>`,
  },
  // Q14 Thalès
  {
    type: 'default', exKind: 'auto-calc', qnum: 14, category: 'Thalès',
    questionHtml: `Sur la figure ci-dessous, <strong>(EF) ∥ (BC)</strong>, AE = EB = 4 cm et BC = 9 cm. On sait que AC = 10 cm.
      ${thalesSVG({ lApex:'A', lBL:'B', lBR:'C', lML:'E', lMR:'F', s1:'4', s2:'4', sBase:'9 cm', ratio:0.5, W:170, H:140 })}
      <em>a.</em> Calculer EF. &nbsp; <em>b.</em> Calculer AF, sachant que AC = 10 cm.`,
    parts: [
      {
        label: 'EF (cm) =',
        answer: '4,5',
        altAnswers: ['4.5'],
        stepsHtml: `<div>AE = EB = 4 cm donc AB = 8 cm. Rapport : AE/AB = 4/8 = 1/2</div>
          <div style="margin-top:6px">EF = BC × (1/2) = 9 × (1/2) = ${ok('4,5')} cm</div>`,
      },
      {
        label: 'AF (cm) =',
        answer: '5',
        stepsHtml: `<div>AF = AC × (1/2) = 10 × (1/2) = ${ok('5')} cm</div>`,
      },
    ],
  },
  // Q15 Fonctions
  {
    type: 'default', exKind: 'auto-calc', qnum: 15, category: 'Fonctions',
    questionHtml: `On donne <em>f</em>(x) = (x − 2)(x + 5).<br>
      <em>a.</em> Calculer f(3). &nbsp; <em>b.</em> Déterminer les antécédents de 0 par f.`,
    parts: [
      {
        label: 'f(3) =',
        answer: '8',
        stepsHtml: `<div>f(3) = (3 − 2)(3 + 5) = 1 × 8 = ${ok('8')}</div>`,
      },
      {
        label: 'Antécédents de 0 :',
        answer: '2 et -5',
        altAnswers: ['-5 et 2', '2 et −5', '−5 et 2', 'x=2 et x=-5', '2,-5', '-5,2'],
        stepsHtml: `<div>f(x) = 0 ⟺ x − 2 = 0 &nbsp;ou&nbsp; x + 5 = 0</div>
          <div style="margin-top:6px">Antécédents de 0 : ${ok('x = 2 &nbsp;et&nbsp; x = −5')}</div>`,
      },
    ],
  },
  // Q16 Proportionnalité
  {
    type: 'default', exKind: 'auto-calc', qnum: 16, category: 'Proportionnalité',
    questionHtml: `Une voiture parcourt <strong>336 km</strong> avec <strong>28 litres</strong> d'essence.<br>
      <em>a.</em> Quelle est sa consommation aux 100 km ?<br>
      <em>b.</em> Combien de litres faut-il pour parcourir 450 km ?`,
    parts: [
      {
        label: 'Consommation (L/100 km) ≈',
        answer: '8,33',
        altAnswers: ['8.33', '25/3', '8,3', '8.3'],
        stepsHtml: `<div>28 × 100 ÷ 336 = 2800 ÷ 336 = 25/3 ≈ ${ok('8,33')} L/100 km</div>`,
      },
      {
        label: 'Litres nécessaires pour 450 km =',
        answer: '37,5',
        altAnswers: ['37.5'],
        stepsHtml: `<div>28 × 450 ÷ 336 = 12 600 ÷ 336 = ${ok('37,5')} L</div>`,
      },
    ],
  },
  // Q17 Divisibilité (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 17, category: 'Divisibilité',
    questionHtml: `Parmi les nombres suivants, lequel est <strong>premier</strong> ?`,
    choices: ['51', '57', '61', '91'],
    correctIndex: 2,
    stepsHtml: `<div>51 = 3 × 17 &nbsp;|&nbsp; 57 = 3 × 19 &nbsp;|&nbsp; 91 = 7 × 13 : non premiers.</div>
      <div style="margin-top:6px"><strong>61</strong> : non divisible par 2, 3, 5, 7 (jusqu'à √61 ≈ 7,8). ${ok('61 est premier.')}</div>`,
  },
  // Q18 Volumes
  {
    type: 'default', exKind: 'auto-calc', qnum: 18, category: 'Volumes',
    questionHtml: `Un cylindre a un rayon de base de <strong>3 cm</strong> et une hauteur de <strong>8 cm</strong>.<br>
      <em>a.</em> Donner son volume exact (en fonction de π).<br>
      <em>b.</em> Donner la valeur approchée à l'unité (π ≈ 3,14).`,
    parts: [
      {
        label: 'Volume exact (cm³) =',
        answer: '72π',
        altAnswers: ['72pi'],
        stepsHtml: `<div>V = π × r² × h = π × 3² × 8 = ${ok('72π')} cm³</div>`,
      },
      {
        label: 'Valeur approchée (cm³) ≈',
        answer: '226',
        altAnswers: ['226,08'],
        stepsHtml: `<div>72 × 3,14 = 226,08 ≈ ${ok('226')} cm³</div>`,
      },
    ],
  },
  // Q19 Vitesses
  {
    type: 'default', exKind: 'auto-calc', qnum: 19, category: 'Vitesses',
    questionHtml: `Un cycliste roule à <strong>18 km/h</strong>.<br>
      <em>a.</em> Combien de temps met-il pour parcourir 27 km ?<br>
      <em>b.</em> Quelle distance parcourt-il en 1 h 20 min ?`,
    parts: [
      {
        label: 'Temps =',
        answer: '1h30',
        altAnswers: ['1h30min', '1 h 30 min', '90min', '90 min', '1,5h', '1.5h'],
        stepsHtml: `<div>t = d ÷ v = 27 ÷ 18 = 3/2 h = ${ok('1 h 30 min')}</div>`,
      },
      {
        label: 'Distance (km) =',
        answer: '24',
        stepsHtml: `<div>1 h 20 min = 4/3 h &nbsp;→&nbsp; d = 18 × (4/3) = ${ok('24')} km</div>`,
      },
    ],
  },
  // Q20 Calcul littéral
  {
    type: 'default', exKind: 'auto-calc', qnum: 20, category: 'Calcul littéral',
    questionHtml: `Développer et réduire &nbsp;<em>E</em> = (x + 3)² − 9.`,
    parts: [{
      label: 'E =',
      answer: 'x^2+6x',
      altAnswers: ['x²+6x', '6x+x^2', '6x+x²', 'x(x+6)', 'x*(x+6)'],
      stepsHtml: `<div>(x + 3)² − 9 = x² + 6x + 9 − 9 = ${ok('x² + 6x')}</div>
        <div style="margin-top:4px;color:var(--muted);font-size:12px">On peut aussi factoriser : x² + 6x = x(x + 6)</div>`,
    }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SÉRIE 3 — Q21 à Q30
// ═══════════════════════════════════════════════════════════════════════════

const S3: AEx[] = [
  // Q21 Fractions (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 21, category: 'Fractions',
    questionHtml: `Laquelle de ces fractions est égale à ${fr(15,24)} sous forme irréductible ?`,
    choices: [fr(3,4), fr(5,8), fr(5,6), fr(15,24)],
    correctIndex: 1,
    stepsHtml: `<div>pgcd(15, 24) = 3 &nbsp;→&nbsp; ${fr(15,24)} = ${ok(fr(5,8,'var(--correct)'))}</div>`,
  },
  // Q22 Probabilités
  {
    type: 'default', exKind: 'auto-calc', qnum: 22, category: 'Probabilités',
    questionHtml: `Une urne contient <strong>30 jetons</strong> : 12 rouges, 10 bleus et 8 verts. On tire un jeton au hasard.<br>
      <em>a.</em> Quelle est la probabilité de tirer un jeton rouge ou bleu ?<br>
      <em>b.</em> Si on retire les jetons verts de l'urne, quelle est la probabilité de tirer un jeton rouge ?`,
    parts: [
      {
        label: 'P(rouge ou bleu) =',
        answer: '11/15',
        stepsHtml: `<div>${fr('12+10','30')} = ${fr(22,30)} = ${ok(fr(11,15,'var(--correct)'))}</div>`,
      },
      {
        label: 'P(rouge) après retrait des verts =',
        answer: '6/11',
        stepsHtml: `<div>Après retrait des 8 verts : 22 jetons restants, dont 12 rouges.</div>
          <div style="margin-top:6px">${fr(12,22)} = ${ok(fr(6,11,'var(--correct)'))}</div>`,
      },
    ],
  },
  // Q23 Trigonométrie (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 23, category: 'Trigonométrie',
    questionHtml: `Dans le triangle PQR rectangle en R représenté ci-dessous, <strong>QR = 7 cm</strong> et <strong>${hat('PQR')} = 40°</strong>.<br>
      Recopier la formule donnant QP parmi les quatre propositions :
      ${rtriSVG({ ax:25,ay:18, bx:25,by:110, cx:140,cy:110, lA:'P', lB:'R', lC:'Q', sAB:'QP = ?', sBC:'7 cm', angC:'40°', W:168, H:130 })}`,
    choices: [fr(7,'cos 40°'), `7 cos 40°`, fr(7,'sin 40°'), `7 sin 40°`],
    correctIndex: 0,
    stepsHtml: `<div>L'angle ${hat('PQR')} est en Q. QR est le côté adjacent, QP est l'hypoténuse.</div>
      <div style="margin-top:6px">cos(${hat('PQR')}) = QR / QP &nbsp;⟹&nbsp; QP = ${ok(fr(7,'cos 40°','var(--correct)'))}</div>`,
  },
  // Q24 Repérage
  {
    type: 'default', exKind: 'auto-calc', qnum: 24, category: 'Repérage',
    questionHtml: `Dans le repère ci-dessous, on a placé les points <strong>M(2 ; −3)</strong> et <strong>N(−4 ; 1)</strong>.<br>
      <em>a.</em> Donner les coordonnées du milieu de [MN].<br>
      <em>b.</em> Quelle est l'ordonnée du point de la droite (MN) situé sur l'axe des ordonnées ?`,
    parts: [
      {
        label: 'Milieu de [MN] :',
        answer: '(-1;-1)',
        altAnswers: ['(-1,-1)', '-1;-1', '-1,-1', '(-1 ; -1)'],
        stepsHtml: `<div>x<sub>I</sub> = (2 + (−4)) ÷ 2 = −1 &nbsp;&nbsp; y<sub>I</sub> = (−3 + 1) ÷ 2 = −1</div>
          <div style="margin-top:6px">Milieu = ${ok('(−1 ; −1)')}</div>`,
      },
      {
        label: 'Ordonnée sur l\'axe des ordonnées :',
        answer: '-5/3',
        stepsHtml: `<div>${'→'}MN = (−6 ; 4). Pour x = 0 : 2 − 6t = 0 ⟹ t = 1/3</div>
          <div style="margin-top:4px">y = −3 + 4 × (1/3) = −3 + 4/3 = ${ok('−5/3')}</div>`,
      },
    ],
  },
  // Q25 Géométrie (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 25, category: 'Géométrie',
    questionHtml: `On considère le quadrilatère ABCD dont les diagonales se coupent en leur milieu et sont de <strong>longueurs égales</strong>. Quelle est sa nature ?`,
    choices: ['Losange', 'Rectangle', 'Carré', 'Trapèze'],
    correctIndex: 1,
    stepsHtml: `<div>Diagonales qui se coupent en leur milieu ⟹ parallélogramme.</div>
      <div style="margin-top:4px">Diagonales de longueurs égales ⟹ rectangle.</div>
      <div style="margin-top:6px">${ok('Rectangle')}</div>`,
  },
  // Q26 Conversions
  {
    type: 'default', exKind: 'auto-calc', qnum: 26, category: 'Conversions',
    questionHtml: `Convertir :<br><em>a.</em> 2,5 km en cm. &nbsp;&nbsp; <em>b.</em> 4,8 × 10⁶ m en km.`,
    parts: [
      {
        label: '2,5 km = _____ cm',
        answer: '250000',
        altAnswers: ['250 000', '2,5×10^5', '2.5×10^5'],
        stepsHtml: `<div>1 km = 10⁵ cm &nbsp;→&nbsp; 2,5 km = 2,5 × 10⁵ = ${ok('250 000')} cm</div>`,
      },
      {
        label: '4,8 × 10⁶ m = _____ km',
        answer: '4800',
        altAnswers: ['4 800', '4,8×10^3'],
        stepsHtml: `<div>1 m = 10⁻³ km &nbsp;→&nbsp; 4,8 × 10⁶ m = 4,8 × 10³ = ${ok('4 800')} km</div>`,
      },
    ],
  },
  // Q27 Programme de calcul
  {
    type: 'default', exKind: 'auto-calc', qnum: 27, category: 'Programme de calcul',
    questionHtml: `Programme : <em>choisir x ; ajouter 3 ; multiplier par 2 ; retrancher 1</em>.<br>
      <em>a.</em> Écrire l'expression du résultat en fonction de x.<br>
      <em>b.</em> Pour quelle valeur de x le résultat est-il égal à 11 ?`,
    parts: [
      {
        label: 'Résultat =',
        answer: '2x+5',
        altAnswers: ['2x + 5', '5+2x'],
        stepsHtml: `<div>x → x+3 → 2(x+3) → 2(x+3) − 1 = 2x + 6 − 1 = ${ok('2x + 5')}</div>`,
      },
      {
        label: 'x =',
        answer: '3',
        stepsHtml: `<div>2x + 5 = 11 ⟹ 2x = 6 ⟹ x = ${ok('3')}</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : 2 × 3 + 5 = 11 ✓</div>`,
      },
    ],
  },
  // Q28 Facteurs premiers / PGCD
  {
    type: 'default', exKind: 'auto-calc', qnum: 28, category: 'Facteurs premiers',
    questionHtml: `On cherche le PGCD de <strong>84</strong> et <strong>56</strong>.<br>
      <em>a.</em> Décomposer 84 et 56 en produit de facteurs premiers.<br>
      <em>b.</em> En déduire leur PGCD.`,
    parts: [
      {
        label: '84 =',
        answer: '2^2*3*7',
        altAnswers: ['2²×3×7', '2^2×3×7', '2²*3*7', '4×3×7', '4*3*7'],
        stepsHtml: `<div>84 ÷ 2 = 42 ; 42 ÷ 2 = 21 ; 21 ÷ 3 = 7</div>
          <div style="margin-top:4px">84 = ${ok('2² × 3 × 7')}</div>`,
      },
      {
        label: '56 =',
        answer: '2^3*7',
        altAnswers: ['2³×7', '2^3×7', '2³*7', '8×7', '8*7'],
        stepsHtml: `<div>56 ÷ 2 = 28 ; 28 ÷ 2 = 14 ; 14 ÷ 2 = 7</div>
          <div style="margin-top:4px">56 = ${ok('2³ × 7')}</div>`,
      },
      {
        label: 'PGCD(84, 56) =',
        answer: '28',
        stepsHtml: `<div>Facteurs communs avec le plus petit exposant : 2² × 7 = 4 × 7 = ${ok('28')}</div>`,
      },
    ],
  },
  // Q29 Fonctions-tableau
  {
    type: 'default', exKind: 'auto-calc', qnum: 29, category: 'Fonctions',
    questionHtml: `Voici le tableau de valeurs de <em>h</em> :<br>
      <table style="border-collapse:collapse;margin:8px 0;font-size:13px">
        <tr><td style="border:1px solid var(--border2);padding:4px 10px"><em>x</em></td><td style="border:1px solid var(--border2);padding:4px 10px">−2</td><td style="border:1px solid var(--border2);padding:4px 10px">−1</td><td style="border:1px solid var(--border2);padding:4px 10px">0</td><td style="border:1px solid var(--border2);padding:4px 10px">1</td><td style="border:1px solid var(--border2);padding:4px 10px">2</td></tr>
        <tr><td style="border:1px solid var(--border2);padding:4px 10px"><em>h</em>(x)</td><td style="border:1px solid var(--border2);padding:4px 10px">8</td><td style="border:1px solid var(--border2);padding:4px 10px">3</td><td style="border:1px solid var(--border2);padding:4px 10px">0</td><td style="border:1px solid var(--border2);padding:4px 10px">−1</td><td style="border:1px solid var(--border2);padding:4px 10px">0</td></tr>
      </table>
      <em>a.</em> Quelle est l'image de −1 par h ? &nbsp; <em>b.</em> Quels sont les antécédents de 0 par h ?`,
    parts: [
      {
        label: 'h(−1) =',
        answer: '3',
        stepsHtml: `<div>D'après le tableau, h(−1) = ${ok('3')}</div>`,
      },
      {
        label: 'Antécédents de 0 :',
        answer: '0 et 2',
        altAnswers: ['2 et 0', '0;2', '2;0', 'x=0 et x=2', '0,2'],
        stepsHtml: `<div>h(x) = 0 pour x = 0 et x = 2 → antécédents de 0 : ${ok('0 et 2')}</div>`,
      },
    ],
  },
  // Q30 Statistiques
  {
    type: 'default', exKind: 'auto-calc', qnum: 30, category: 'Statistiques',
    questionHtml: `Un élève a obtenu les notes suivantes : <strong>11 ; 14 ; 9 ; 16 ; 13</strong>.<br>
      <em>a.</em> Calculer sa moyenne.<br>
      <em>b.</em> Quelle note doit-il obtenir au prochain contrôle pour que sa moyenne sur 6 contrôles soit 13 ?`,
    parts: [
      {
        label: 'Moyenne =',
        answer: '12,6',
        altAnswers: ['12.6', '63/5'],
        stepsHtml: `<div>Somme = 11 + 14 + 9 + 16 + 13 = 63</div>
          <div style="margin-top:4px">Moyenne = 63 ÷ 5 = ${ok('12,6')}</div>`,
      },
      {
        label: 'Note requise =',
        answer: '15',
        stepsHtml: `<div>Somme nécessaire pour la moyenne 13 : 13 × 6 = 78</div>
          <div style="margin-top:4px">Note = 78 − 63 = ${ok('15')}</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SÉRIE 4 — Q31 à Q40
// ═══════════════════════════════════════════════════════════════════════════

const S4: AEx[] = [
  // Q31 Notation scientifique
  {
    type: 'default', exKind: 'auto-calc', qnum: 31, category: 'Notation scientifique',
    questionHtml: `Calculer <em>D</em> = 3,6 × 10³ + 4,2 × 10². Donner le résultat sous <strong>forme décimale</strong>.`,
    parts: [{
      label: 'D =',
      answer: '4020',
      stepsHtml: `<div>3,6 × 10³ = 3 600 &nbsp;et&nbsp; 4,2 × 10² = 420</div>
        <div style="margin-top:4px">D = 3 600 + 420 = ${ok('4 020')}</div>`,
    }],
  },
  // Q32 Notation scientifique (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 32, category: 'Notation scientifique',
    questionHtml: `Parmi ces quatre nombres, lequel est le <strong>plus grand</strong> ?`,
    choices: ['3,2 × 10⁵', '4,1 × 10⁴', '0,9 × 10⁶', '2,8 × 10⁵'],
    correctIndex: 2,
    stepsHtml: `<div>3,2 × 10⁵ = 320 000 &nbsp;|&nbsp; 4,1 × 10⁴ = 41 000</div>
      <div>0,9 × 10⁶ = 900 000 &nbsp;|&nbsp; 2,8 × 10⁵ = 280 000</div>
      <div style="margin-top:6px">Le plus grand est ${ok('0,9 × 10⁶ = 9 × 10⁵')}</div>`,
  },
  // Q33 Thalès
  {
    type: 'default', exKind: 'auto-calc', qnum: 33, category: 'Thalès',
    questionHtml: `Dans le triangle ABC représenté ci-dessous, <strong>(DE) ∥ (BC)</strong> avec D sur [AB] et E sur [AC],<br>AD = 3 cm, DB = 2 cm et BC = 7,5 cm. Calculer DE.
      ${thalesSVG({ lApex:'A', lBL:'B', lBR:'C', lML:'D', lMR:'E', s1:'3', s2:'2', sBase:'7,5 cm', ratio:0.6, W:170, H:140 })}`,
    parts: [{
      label: 'DE (cm) =',
      answer: '4,5',
      altAnswers: ['4.5'],
      stepsHtml: `<div>AD = 3 cm, DB = 2 cm ⟹ AB = 5 cm. Rapport : AD/AB = 3/5</div>
        <div style="margin-top:6px">DE = BC × (3/5) = 7,5 × 3/5 = 22,5/5 = ${ok('4,5')} cm</div>`,
    }],
  },
  // Q34 Proportionnalité-Échelle (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 34, category: 'Proportionnalité',
    questionHtml: `Un plan est à l'échelle <strong>1/200</strong>. Une pièce mesure <strong>6 cm</strong> sur le plan. Quelle est sa longueur réelle ?`,
    choices: ['0,3 m', '1,2 m', '12 m', '3 m'],
    correctIndex: 2,
    stepsHtml: `<div>Échelle 1/200 : 6 cm sur plan → 6 × 200 = 1 200 cm = ${ok('12 m')} en réalité.</div>`,
  },
  // Q35 Cosinus (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 35, category: 'Cosinus',
    questionHtml: `Dans le triangle ABC rectangle en B représenté ci-dessous, AB = 8 cm, BC = 6 cm et AC = 10 cm.<br>
      Recopier la formule qui permet de calculer cos(${hat('BAC')}) :
      ${rtriSVG({ ax:30,ay:20, bx:30,by:98, cx:102,cy:98, lA:'A', lB:'B', lC:'C', sAB:'8 cm', sBC:'6 cm', sAC:'10 cm', W:140, H:120 })}`,
    choices: [fr(6,10), fr(8,10), fr(6,8), fr(8,6)],
    correctIndex: 1,
    stepsHtml: `<div>cos(${hat('BAC')}) = côté adjacent / hypoténuse = AB / AC = ${ok(fr(8,10,'var(--correct)'))}</div>
      <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. Pythagore : 8² + 6² = 64 + 36 = 100 = 10² ✓</div>`,
  },
  // Q36 Proportionnalité-tableau (TABLE CORRIGÉE)
  {
    type: 'default', exKind: 'auto-calc', qnum: 36, category: 'Proportionnalité',
    questionHtml: `Compléter la valeur manquante dans le tableau ci-dessous, puis indiquer si les deux grandeurs sont proportionnelles.
      <table style="border-collapse:collapse;margin:10px 0;font-size:13px">
        <tr>
          <td style="border:1px solid var(--border2);padding:5px 12px">Durée (h)</td>
          <td style="border:1px solid var(--border2);padding:5px 12px">2</td>
          <td style="border:1px solid var(--border2);padding:5px 12px">5</td>
          <td style="border:1px solid var(--border2);padding:5px 12px">8</td>
          <td style="border:1px solid var(--border2);padding:5px 12px">12</td>
        </tr>
        <tr>
          <td style="border:1px solid var(--border2);padding:5px 12px">Consommation (kWh)</td>
          <td style="border:1px solid var(--border2);padding:5px 12px">0,6</td>
          <td style="border:1px solid var(--border2);padding:5px 12px">1,5</td>
          <td style="border:1px solid var(--border2);padding:5px 12px"><strong>?</strong></td>
          <td style="border:1px solid var(--border2);padding:5px 12px">3,6</td>
        </tr>
      </table>`,
    parts: [
      {
        label: 'Valeur manquante pour 8 h (kWh) =',
        answer: '2,4',
        altAnswers: ['2.4'],
        stepsHtml: `<div>Coefficient k = 0,6 ÷ 2 = 0,3 kWh/h</div>
          <div style="margin-top:4px">Pour 8 h : 0,3 × 8 = ${ok('2,4')} kWh</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : 0,3 × 5 = 1,5 ✓ &nbsp;|&nbsp; 0,3 × 12 = 3,6 ✓</div>`,
      },
      {
        label: 'Les deux grandeurs sont-elles proportionnelles ?',
        isYesNo: true,
        ansYesNo: true,
        answer: 'oui',
        stepsHtml: `<div>Le coefficient k = 0,3 est constant → ${ok('Oui')}, les grandeurs sont proportionnelles.</div>`,
      },
    ],
  },
  // Q37 Facteurs premiers
  {
    type: 'default', exKind: 'auto-calc', qnum: 37, category: 'Facteurs premiers',
    questionHtml: `Décomposer <strong>252</strong> en produit de facteurs premiers.`,
    parts: [{
      label: '252 =',
      answer: '2^2*3^2*7',
      altAnswers: ['2²×3²×7', '2^2×3^2×7', '2²*3²*7', '4×9×7', '4*9*7'],
      stepsHtml: `<div>252 ÷ 2 = 126 &nbsp;|&nbsp; 126 ÷ 2 = 63 &nbsp;|&nbsp; 63 ÷ 3 = 21 &nbsp;|&nbsp; 21 ÷ 3 = 7</div>
        <div style="margin-top:6px">252 = ${ok('2² × 3² × 7')}</div>`,
    }],
  },
  // Q38 Aires
  {
    type: 'default', exKind: 'auto-calc', qnum: 38, category: 'Aires',
    questionHtml: `On dispose d'un carré de côté <strong>10 cm</strong> dans lequel est inscrit un disque de <strong>diamètre 10 cm</strong> (voir figure ci-dessous).<br>
      Calculer l'aire de la surface grisée (entre le carré et le disque), arrondie au dixième de cm². (π ≈ 3,14)
      ${squareDiskSVG()}`,
    parts: [{
      label: 'Aire grisée (cm²) ≈',
      answer: '21,5',
      altAnswers: ['21.5'],
      stepsHtml: `<div>Aire carré = 10² = 100 cm²</div>
        <div style="margin-top:4px">Aire disque (r = 5 cm) = π × 5² = 25π ≈ 25 × 3,14 = 78,5 cm²</div>
        <div style="margin-top:4px">Aire grisée = 100 − 78,5 = ${ok('21,5')} cm²</div>`,
    }],
  },
  // Q39 Algorithme
  {
    type: 'default', exKind: 'auto-calc', qnum: 39, category: 'Algorithme',
    questionHtml: `Un algorithme calcule <em>f</em>(n) = n² − 3n + 2.<br>
      <em>a.</em> Quel résultat obtient-on pour n = 5 ?<br>
      <em>b.</em> Pour quelle(s) valeur(s) de n le résultat est-il nul ?`,
    parts: [
      {
        label: 'f(5) =',
        answer: '12',
        stepsHtml: `<div>f(5) = 25 − 15 + 2 = ${ok('12')}</div>`,
      },
      {
        label: 'Valeurs de n :',
        answer: '1 et 2',
        altAnswers: ['2 et 1', 'n=1 et n=2', '1;2', '2;1', '1 ou 2'],
        stepsHtml: `<div>n² − 3n + 2 = 0 ⟺ (n−1)(n−2) = 0</div>
          <div style="margin-top:6px">n = ${ok('1')} &nbsp;ou&nbsp; n = ${ok('2')}</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : 1−3+2 = 0 ✓ &nbsp;|&nbsp; 4−6+2 = 0 ✓</div>`,
      },
    ],
  },
  // Q40 Graphique-vitesses
  {
    type: 'default', exKind: 'auto-calc', qnum: 40, category: 'Vitesses',
    questionHtml: `Deux marcheurs A et B partent en même temps. A marche à <strong>5 km/h</strong> depuis le point de départ (0 km). B marche à <strong>4 km/h</strong> mais part avec <strong>2 km d'avance</strong>.<br>
      <em>a.</em> Écrire la distance parcourue depuis le départ en fonction du temps t (en h) pour chaque marcheur.<br>
      <em>b.</em> Au bout de combien de temps A rattrape-t-il B ?`,
    parts: [
      {
        label: 'd<sub>A</sub>(t) =',
        answer: '5t',
        stepsHtml: `<div>A part de 0 à 5 km/h → d<sub>A</sub> = ${ok('5t')}</div>`,
      },
      {
        label: 'd<sub>B</sub>(t) =',
        answer: '4t+2',
        altAnswers: ['2+4t', '4t + 2'],
        stepsHtml: `<div>B part avec 2 km d'avance à 4 km/h → d<sub>B</sub> = ${ok('4t + 2')}</div>`,
      },
      {
        label: 'Temps de rattrapage (h) =',
        answer: '2',
        stepsHtml: `<div>d<sub>A</sub> = d<sub>B</sub> ⟺ 5t = 4t + 2 ⟺ t = ${ok('2')} h</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : d<sub>A</sub> = 10 km, d<sub>B</sub> = 8 + 2 = 10 km ✓</div>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════

export const automatismesQuiz: QuizDefinition = {
  id: 'automatismes',
  available: true,
  title: 'Automatismes',
  titleSub: 'DNB',
  subtitle: 'Sans calculatrice · Aucune justification demandée',
  category: 'Calcul',
  accent: '#60A5FA',
  accentSecondary: '#818cf8',
  icon: '⚡',
  description: 'Entraînement intensif aux thèmes du DNB : fractions, équations, statistiques, géométrie…',
  tags: ['40 questions', '4 séries'],
  renderer: 'automatismes',
  exercises: S1,
  seriesTabs: [
    { label: 'Série 1', exercises: S1 },
    { label: 'Série 2', exercises: S2 },
    { label: 'Série 3', exercises: S3 },
    { label: 'Série 4', exercises: S4 },
  ],
};
