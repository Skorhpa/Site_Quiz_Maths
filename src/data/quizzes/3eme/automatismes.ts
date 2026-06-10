import type { QuizDefinition, AutoQCMExercise, AutoCalcExercise } from '@/types';

type AEx = AutoQCMExercise | AutoCalcExercise;

const fr = (n: number | string, d: number | string, col = 'var(--text)') =>
  `<span class="frac" style="color:${col}"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;
const ok = (s: string) => `<strong style="color:var(--correct)">${s}</strong>`;

// ═══════════════════════════════════════════════════════════════════════════
// SÉRIE 1 — Q1 à Q10
// ═══════════════════════════════════════════════════════════════════════════

const S1: AEx[] = [
  // Q1 Fractions
  {
    type: 'default', exKind: 'auto-calc', qnum: 1, category: 'Fractions',
    questionHtml: `Calculer &nbsp;<em>A</em> = ${fr(3, 4)} − ${fr(2, 5)}`,
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
    questionHtml: `Résoudre l'équation &nbsp;<strong>3(2x − 4) = 2x + 8</strong>`,
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
    questionHtml: `Série : <strong>5 ; 14 ; 8 ; 20 ; 8 ; 3 ; 17 ; 8 ; 11 ; 6</strong><br>Déterminer la <em>médiane</em> et le <em>mode</em>.`,
    parts: [
      {
        label: 'Médiane =',
        answer: '8',
        stepsHtml: `<div>Série triée : 3 ; 5 ; 6 ; 8 ; <strong>8 ; 8</strong> ; 11 ; 14 ; 17 ; 20</div>
          <div style="margin-top:6px">n = 10 valeurs paires → médiane = (5ᵉ + 6ᵉ) / 2 = (8 + 8) / 2 = ${ok('8')}</div>`,
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
    stepsHtml: `<div>Nombres pairs strictement supérieurs à 2 parmi 1…6 : <strong>4 et 6</strong> → 2 issues favorables sur 6.</div>
      <div style="margin-top:6px">P = ${fr(2,6)} = ${ok(fr(1,3,'var(--correct)'))} → <strong>Réponse A</strong></div>`,
  },
  // Q5 Pythagore
  {
    type: 'default', exKind: 'auto-calc', qnum: 5, category: 'Pythagore',
    questionHtml: `Triangle ABC rectangle en B, <strong>AB = 6 cm</strong> et <strong>AC = 10 cm</strong> (hypoténuse).`,
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
        stepsHtml: `<div>P = AB + BC + AC = 6 + 8 + 10 = ${ok('24')} cm</div>`,
      },
    ],
  },
  // Q6 Trigonométrie
  {
    type: 'default', exKind: 'auto-calc', qnum: 6, category: 'Trigonométrie',
    questionHtml: `Triangle ABC rectangle en B, <strong>AB = 5 cm</strong> et <strong>B̂AC = 35°</strong>.<br>
      <em>a.</em> Écrire la relation donnant BC (ex : 5tan35)<br>
      <em>b.</em> Calculer l'angle B̂CA.`,
    parts: [
      {
        label: 'BC =',
        answer: '5tan35',
        altAnswers: ['5*tan35', '5*tan(35)', '5×tan35', '5×tan(35)', 'tan35*5', 'tan(35)*5'],
        stepsHtml: `<div>tan(B̂AC) = BC / AB &nbsp;⟹&nbsp; BC = AB × tan(B̂AC)</div>
          <div style="margin-top:6px">BC = ${ok('5 tan(35°)')} ≈ 3,5 cm</div>`,
      },
      {
        label: 'B̂CA (°) =',
        answer: '55',
        stepsHtml: `<div>B̂CA = 180° − 90° − 35° = ${ok('55°')}</div>`,
      },
    ],
  },
  // Q7 Pourcentages
  {
    type: 'default', exKind: 'auto-calc', qnum: 7, category: 'Pourcentages',
    questionHtml: `Un article coûte <strong>120 €</strong>. Son prix baisse de <strong>15 %</strong>, puis augmente de <strong>10 %</strong>.<br>
      <em>a.</em> Coefficient multiplicateur global &nbsp; <em>b.</em> Prix final.`,
    parts: [
      {
        label: 'Coefficient =',
        answer: '0,935',
        altAnswers: ['0.935'],
        stepsHtml: `<div>0,85 × 1,10 = ${ok('0,935')}</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Soit une réduction globale de 6,5 %</div>`,
      },
      {
        label: 'Prix final (€) =',
        answer: '112,20',
        altAnswers: ['112.20', '112,2', '112.2'],
        stepsHtml: `<div>120 × 0,935 = ${ok('112,20 €')}</div>`,
      },
    ],
  },
  // Q8 Notation scientifique
  {
    type: 'default', exKind: 'auto-calc', qnum: 8, category: 'Notation scientifique',
    questionHtml: `Exprimer en notation scientifique :<br>
      <em>a.</em> 4,5 × 10⁴ × 3 × 10³ &nbsp;&nbsp; <em>b.</em> (9 × 10⁷) ÷ (3 × 10²)`,
    parts: [
      {
        label: 'a. =',
        answer: '1,35×10^8',
        altAnswers: ['1.35×10^8', '1,35*10^8', '1.35*10^8', '1,35×10⁸', '1.35×10⁸'],
        stepsHtml: `<div>4,5 × 3 = 13,5 et 10⁴ × 10³ = 10⁷</div>
          <div style="margin-top:4px">13,5 × 10⁷ = ${ok('1,35 × 10⁸')}</div>`,
      },
      {
        label: 'b. =',
        answer: '3×10^5',
        altAnswers: ['3*10^5', '3×10⁵'],
        stepsHtml: `<div>${fr('9','3')} × 10^(7−2) = 3 × 10⁵ = ${ok('3 × 10⁵')}</div>`,
      },
    ],
  },
  // Q9 Fonctions
  {
    type: 'default', exKind: 'auto-calc', qnum: 9, category: 'Fonctions',
    questionHtml: `On considère <em>g</em> : x ↦ −2x + 7.<br>
      <em>a.</em> Calculer g(0) et g(3). &nbsp; <em>b.</em> Antécédent de −3 par g.`,
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
        stepsHtml: `<div>−2x + 7 = −3 ⟹ −2x = −10 ⟹ x = ${ok('5')}</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : g(5) = −10 + 7 = −3 ✓</div>`,
      },
    ],
  },
  // Q10 Programmation
  {
    type: 'default', exKind: 'auto-calc', qnum: 10, category: 'Programmation',
    questionHtml: `Un programme dessine un <strong>pentagone régulier</strong> de côté 60 pas.<br>
      <em>a.</em> Combien de fois l'instruction « avancer de 60 pas » est-elle répétée ?<br>
      <em>b.</em> De combien de degrés le lutin tourne-t-il à chaque étape ? (somme angles extérieurs = 360°)`,
    parts: [
      {
        label: 'Répétitions =',
        answer: '5',
        stepsHtml: `<div>Un pentagone a 5 côtés → l'instruction est répétée ${ok('5')} fois.</div>`,
      },
      {
        label: 'Angle de rotation (°) =',
        answer: '72',
        stepsHtml: `<div>360° ÷ 5 = ${ok('72°')} à chaque étape.</div>`,
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
    questionHtml: `Calculer &nbsp;<em>C</em> = ${fr(5,6)} × ${fr(3,10)}`,
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
    questionHtml: `La <strong>moyenne d'une série de 6 nombres est 12</strong>. On ajoute la valeur 18.<br>Quelle est la nouvelle moyenne des 7 nombres ?`,
    parts: [{
      label: 'Nouvelle moyenne =',
      answer: '12,86',
      altAnswers: ['12.86', '90/7', '12,857', '12.857'],
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
    stepsHtml: `<div>On vérifie y = 3x − 2 pour chaque point :</div>
      <div style="margin-top:4px"><strong>A(0 ; −2)</strong> : 3 × 0 − 2 = −2 = −2 ✓</div>
      <div>B(1 ; 2) : 3 × 1 − 2 = 1 ≠ 2 &nbsp;|&nbsp; C(2 ; 3) : 4 ≠ 3 &nbsp;|&nbsp; D(−1 ; 5) : −5 ≠ 5</div>
      <div style="margin-top:6px">${ok('Réponse A : (0 ; −2)')}</div>`,
  },
  // Q14 Thalès
  {
    type: 'default', exKind: 'auto-calc', qnum: 14, category: 'Thalès',
    questionHtml: `Sur la figure, <strong>(EF) ∥ (BC)</strong>, AE = EB = 4 cm et BC = 9 cm.<br>On sait que AC = 10 cm.`,
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
      <em>a.</em> Calculer f(3). &nbsp; <em>b.</em> Antécédents de 0 par f.`,
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
        stepsHtml: `<div>f(x) = 0 ⟺ x − 2 = 0 ou x + 5 = 0</div>
          <div style="margin-top:6px">Antécédents de 0 : ${ok('x = 2 et x = −5')}</div>`,
      },
    ],
  },
  // Q16 Proportionnalité
  {
    type: 'default', exKind: 'auto-calc', qnum: 16, category: 'Proportionnalité',
    questionHtml: `Une voiture parcourt <strong>336 km avec 28 litres</strong> d'essence.<br>
      <em>a.</em> Consommation aux 100 km. &nbsp; <em>b.</em> Litres pour 450 km.`,
    parts: [
      {
        label: 'Consommation (L/100 km) ≈',
        answer: '8,33',
        altAnswers: ['8.33', '25/3', '8,3', '8.3'],
        stepsHtml: `<div>28 × 100 ÷ 336 = 2800 ÷ 336 = 25/3 ≈ ${ok('8,33')} L/100 km</div>`,
      },
      {
        label: 'Litres pour 450 km =',
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
      <div style="margin-top:6px"><strong>61</strong> : on vérifie jusqu'à √61 ≈ 7,8. Non divisible par 2, 3, 5, 7. ${ok('61 est premier')}</div>
      <div style="margin-top:6px">${ok('Réponse C')}</div>`,
  },
  // Q18 Volumes
  {
    type: 'default', exKind: 'auto-calc', qnum: 18, category: 'Volumes',
    questionHtml: `Un cylindre a un rayon de base de <strong>3 cm</strong> et une hauteur de <strong>8 cm</strong>.<br>
      <em>a.</em> Volume exact. &nbsp; <em>b.</em> Valeur approchée (π ≈ 3,14).`,
    parts: [
      {
        label: 'V exact (cm³) =',
        answer: '72π',
        altAnswers: ['72pi'],
        stepsHtml: `<div>V = π × r² × h = π × 9 × 8 = ${ok('72π')} cm³</div>`,
      },
      {
        label: 'V approché (cm³) ≈',
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
      <em>a.</em> Temps pour parcourir 27 km. &nbsp; <em>b.</em> Distance en 1 h 20 min.`,
    parts: [
      {
        label: 'Temps =',
        answer: '1h30',
        altAnswers: ['1h30min', '1 h 30 min', '90min', '90 min', '1,5h', '1.5h', '1h 30min'],
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
    questionHtml: `Développer et réduire &nbsp;<em>E</em> = (x + 3)² − 9`,
    parts: [{
      label: 'E =',
      answer: 'x^2+6x',
      altAnswers: ['x²+6x', 'x^2 + 6x', '6x+x^2', '6x+x²', 'x(x+6)', 'x*(x+6)'],
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
    stepsHtml: `<div>pgcd(15, 24) = 3 &nbsp;→&nbsp; ${fr(15,24)} = ${ok(fr(5,8,'var(--correct)'))}</div>
      <div style="margin-top:6px">${ok('Réponse B')}</div>`,
  },
  // Q22 Probabilités
  {
    type: 'default', exKind: 'auto-calc', qnum: 22, category: 'Probabilités',
    questionHtml: `Une urne contient <strong>30 jetons</strong> : 12 rouges, 10 bleus et 8 verts. On tire un jeton au hasard.<br>
      <em>a.</em> P(rouge ou bleu) &nbsp; <em>b.</em> Après retrait des verts : P(rouge).`,
    parts: [
      {
        label: 'P(rouge ou bleu) =',
        answer: '11/15',
        stepsHtml: `<div>${fr('12+10','30')} = ${fr(22,30)} = ${ok(fr(11,15,'var(--correct)'))}</div>`,
      },
      {
        label: 'P(rouge) sans les verts =',
        answer: '6/11',
        stepsHtml: `<div>Après retrait des 8 verts : 22 jetons restants, dont 12 rouges.</div>
          <div style="margin-top:6px">${fr(12,22)} = ${ok(fr(6,11,'var(--correct)'))}</div>`,
      },
    ],
  },
  // Q23 Trigonométrie (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 23, category: 'Trigonométrie',
    questionHtml: `Triangle PQR rectangle en R, <strong>QR = 7 cm</strong> et <strong>P̂QR = 40°</strong>.<br>Quelle formule donne QP ?`,
    choices: [`7 / cos(40°)`, `7 cos(40°)`, `7 / sin(40°)`, `7 sin(40°)`],
    correctIndex: 0,
    stepsHtml: `<div>L'angle P̂QR est en Q, QR est le côté adjacent et QP est l'hypoténuse.</div>
      <div style="margin-top:6px">cos(P̂QR) = QR / QP &nbsp;⟹&nbsp; QP = ${ok('7 / cos(40°)')}</div>
      <div style="margin-top:6px">${ok('Réponse A')}</div>`,
  },
  // Q24 Repérage
  {
    type: 'default', exKind: 'auto-calc', qnum: 24, category: 'Repérage',
    questionHtml: `Points M(2 ; −3) et N(−4 ; 1) dans un repère.<br>
      <em>a.</em> Coordonnées du milieu de [MN]. &nbsp; <em>b.</em> Ordonnée du point de (MN) sur l'axe des ordonnées.`,
    parts: [
      {
        label: 'Milieu de [MN] =',
        answer: '(-1;-1)',
        altAnswers: ['(-1,-1)', '-1;-1', '-1,-1', '(-1 ; -1)', 'I(-1;-1)'],
        stepsHtml: `<div>x<sub>I</sub> = (2 + (−4)) / 2 = −1 &nbsp;&nbsp; y<sub>I</sub> = (−3 + 1) / 2 = −1</div>
          <div style="margin-top:6px">Milieu = ${ok('(−1 ; −1)')}</div>`,
      },
      {
        label: 'Ordonnée à l\'axe (x=0) =',
        answer: '-5/3',
        stepsHtml: `<div>Vecteur $\\overrightarrow{MN}$ = (−6 ; 4). Point P = M + t·MN.</div>
          <div style="margin-top:4px">Pour x<sub>P</sub> = 0 : 2 − 6t = 0 ⟹ t = 1/3</div>
          <div style="margin-top:4px">y<sub>P</sub> = −3 + 4 × (1/3) = −3 + 4/3 = ${ok('−5/3')}</div>`,
      },
    ],
  },
  // Q25 Géométrie (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 25, category: 'Géométrie',
    questionHtml: `Quadrilatère ABCD dont les diagonales se coupent en leur milieu et sont de <strong>longueurs égales</strong>. Quelle est sa nature ?`,
    choices: ['Losange', 'Rectangle', 'Carré', 'Trapèze'],
    correctIndex: 1,
    stepsHtml: `<div>Diagonales qui se coupent en leur milieu ⟹ parallélogramme.</div>
      <div style="margin-top:4px">Diagonales de longueurs égales ⟹ rectangle.</div>
      <div style="margin-top:6px">${ok('Réponse B : Rectangle')}</div>`,
  },
  // Q26 Conversions
  {
    type: 'default', exKind: 'auto-calc', qnum: 26, category: 'Conversions',
    questionHtml: `Convertir :<br><em>a.</em> 2,5 km en cm &nbsp;&nbsp; <em>b.</em> 4,8 × 10⁶ m en km`,
    parts: [
      {
        label: 'a. 2,5 km = _____ cm',
        answer: '250000',
        altAnswers: ['250 000', '2,5×10^5', '2.5×10^5', '2,5*10^5'],
        stepsHtml: `<div>1 km = 10⁵ cm &nbsp;→&nbsp; 2,5 km = 2,5 × 10⁵ = ${ok('250 000')} cm</div>`,
      },
      {
        label: 'b. 4,8×10⁶ m = _____ km',
        answer: '4800',
        altAnswers: ['4 800', '4,8×10^3', '4,8*10^3'],
        stepsHtml: `<div>1 m = 10⁻³ km &nbsp;→&nbsp; 4,8 × 10⁶ m = 4,8 × 10³ = ${ok('4 800')} km</div>`,
      },
    ],
  },
  // Q27 Programme de calcul
  {
    type: 'default', exKind: 'auto-calc', qnum: 27, category: 'Programme de calcul',
    questionHtml: `Programme : <em>choisir x ; ajouter 3 ; multiplier par 2 ; retrancher 1</em>.<br>
      <em>a.</em> Expression du résultat en fonction de x. &nbsp; <em>b.</em> Valeur de x pour résultat = 11.`,
    parts: [
      {
        label: 'Résultat =',
        answer: '2x+5',
        altAnswers: ['2x + 5', '5+2x', '5 + 2x'],
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
      <em>a.</em> Décomposer 84 et 56 en facteurs premiers. &nbsp; <em>b.</em> En déduire le PGCD.`,
    parts: [
      {
        label: '84 =',
        answer: '2^2*3*7',
        altAnswers: ['2²×3×7', '2^2×3×7', '2²*3*7', '4×3×7', '4*3*7', '2²·3·7'],
        stepsHtml: `<div>84 ÷ 2 = 42 ; 42 ÷ 2 = 21 ; 21 ÷ 3 = 7</div>
          <div style="margin-top:4px">84 = ${ok('2² × 3 × 7')}</div>`,
      },
      {
        label: '56 =',
        answer: '2^3*7',
        altAnswers: ['2³×7', '2^3×7', '2³*7', '8×7', '8*7', '2³·7'],
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
    questionHtml: `Tableau de valeurs de <em>h</em> :<br>
      <table style="border-collapse:collapse;margin:8px 0;font-size:13px">
        <tr><td style="border:1px solid var(--border2);padding:4px 10px"><em>x</em></td><td style="border:1px solid var(--border2);padding:4px 10px">−2</td><td style="border:1px solid var(--border2);padding:4px 10px">−1</td><td style="border:1px solid var(--border2);padding:4px 10px">0</td><td style="border:1px solid var(--border2);padding:4px 10px">1</td><td style="border:1px solid var(--border2);padding:4px 10px">2</td></tr>
        <tr><td style="border:1px solid var(--border2);padding:4px 10px"><em>h</em>(x)</td><td style="border:1px solid var(--border2);padding:4px 10px">8</td><td style="border:1px solid var(--border2);padding:4px 10px">3</td><td style="border:1px solid var(--border2);padding:4px 10px">0</td><td style="border:1px solid var(--border2);padding:4px 10px">−1</td><td style="border:1px solid var(--border2);padding:4px 10px">0</td></tr>
      </table>
      <em>a.</em> Image de −1. &nbsp; <em>b.</em> Antécédents de 0.`,
    parts: [
      {
        label: 'h(−1) =',
        answer: '3',
        stepsHtml: `<div>D'après le tableau, h(−1) = ${ok('3')}</div>`,
      },
      {
        label: 'Antécédents de 0 :',
        answer: '0 et 2',
        altAnswers: ['2 et 0', '0;2', '2;0', 'x=0 et x=2', '0 et2', '0,2'],
        stepsHtml: `<div>h(x) = 0 pour x = 0 et x = 2 → antécédents de 0 : ${ok('0 et 2')}</div>`,
      },
    ],
  },
  // Q30 Statistiques
  {
    type: 'default', exKind: 'auto-calc', qnum: 30, category: 'Statistiques',
    questionHtml: `Notes d'un élève : <strong>11 ; 14 ; 9 ; 16 ; 13</strong>.<br>
      <em>a.</em> Calculer sa moyenne. &nbsp; <em>b.</em> Note à obtenir pour une moyenne de 13 sur 6 contrôles.`,
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
        stepsHtml: `<div>Somme nécessaire pour 13 × 6 = 78</div>
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
    stepsHtml: `<div>A = 320 000 &nbsp;|&nbsp; B = 41 000 &nbsp;|&nbsp; C = 900 000 &nbsp;|&nbsp; D = 280 000</div>
      <div style="margin-top:6px">${ok('Réponse C')} : 0,9 × 10⁶ = 9 × 10⁵ est le plus grand.</div>`,
  },
  // Q33 Thalès
  {
    type: 'default', exKind: 'auto-calc', qnum: 33, category: 'Thalès',
    questionHtml: `Dans le triangle ABC, <strong>(DE) ∥ (BC)</strong> avec D sur [AB] et E sur [AC].<br>
      AD = 3 cm, DB = 2 cm, BC = 7,5 cm. Calculer DE.`,
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
    stepsHtml: `<div>Échelle 1/200 : 6 cm sur le plan → 6 × 200 = 1 200 cm = ${ok('12 m')} en réalité.</div>
      <div style="margin-top:6px">${ok('Réponse C : 12 m')}</div>`,
  },
  // Q35 Cosinus (QCM)
  {
    type: 'default', exKind: 'auto-qcm', qnum: 35, category: 'Cosinus',
    questionHtml: `Triangle ABC rectangle en B, <strong>AB = 8 cm</strong>, BC = 6 cm, <strong>AC = 10 cm</strong>.<br>
      Quelle formule permet de calculer cos(B̂AC) ?`,
    choices: ['6/10', '8/10', '6/8', '8/6'],
    correctIndex: 1,
    stepsHtml: `<div>cos(B̂AC) = côté adjacent / hypoténuse = AB / AC = ${ok('8/10')}</div>
      <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. Pythagore : 8² + 6² = 64 + 36 = 100 = 10² ✓</div>
      <div style="margin-top:6px">${ok('Réponse B')}</div>`,
  },
  // Q36 Proportionnalité-tableau
  {
    type: 'default', exKind: 'auto-calc', qnum: 36, category: 'Proportionnalité',
    questionHtml: `<table style="border-collapse:collapse;margin:8px 0;font-size:13px">
      <tr><td style="border:1px solid var(--border2);padding:4px 10px">Durée (h)</td><td style="border:1px solid var(--border2);padding:4px 10px">2</td><td style="border:1px solid var(--border2);padding:4px 10px">5</td><td style="border:1px solid var(--border2);padding:4px 10px"><strong>?</strong></td><td style="border:1px solid var(--border2);padding:4px 10px">12</td></tr>
      <tr><td style="border:1px solid var(--border2);padding:4px 10px">Consommation (kWh)</td><td style="border:1px solid var(--border2);padding:4px 10px">0,6</td><td style="border:1px solid var(--border2);padding:4px 10px">1,5</td><td style="border:1px solid var(--border2);padding:4px 10px">8 h</td><td style="border:1px solid var(--border2);padding:4px 10px">3,6</td></tr>
    </table>
    <em>a.</em> Valeur manquante (8 h). &nbsp; <em>b.</em> Les deux grandeurs sont-elles proportionnelles ?`,
    parts: [
      {
        label: 'Valeur manquante (kWh) =',
        answer: '2,4',
        altAnswers: ['2.4'],
        stepsHtml: `<div>Coefficient k = 0,6 ÷ 2 = 0,3 kWh/h</div>
          <div style="margin-top:4px">8 h : 0,3 × 8 = ${ok('2,4')} kWh</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : 0,3 × 5 = 1,5 ✓ &nbsp;|&nbsp; 0,3 × 12 = 3,6 ✓</div>`,
      },
      {
        label: 'Les grandeurs sont-elles proportionnelles ?',
        isYesNo: true,
        ansYesNo: true,
        answer: 'oui',
        stepsHtml: `<div>Le coefficient k = 0,3 est constant → ${ok('Oui')}, les grandeurs sont bien proportionnelles.</div>`,
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
      altAnswers: ['2²×3²×7', '2^2×3^2×7', '2²*3²*7', '4×9×7', '4*9*7', '2²·3²·7'],
      stepsHtml: `<div>252 ÷ 2 = 126 &nbsp;|&nbsp; 126 ÷ 2 = 63 &nbsp;|&nbsp; 63 ÷ 3 = 21 &nbsp;|&nbsp; 21 ÷ 3 = 7</div>
        <div style="margin-top:6px">252 = ${ok('2² × 3² × 7')}</div>`,
    }],
  },
  // Q38 Aires
  {
    type: 'default', exKind: 'auto-calc', qnum: 38, category: 'Aires',
    questionHtml: `Un carré de côté <strong>10 cm</strong> contient un disque de <strong>diamètre 10 cm</strong>.<br>
      Calculer l'aire de la surface grisée (entre carré et disque). (π ≈ 3,14)`,
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
      <em>a.</em> Résultat pour n = 5. &nbsp; <em>b.</em> Valeur(s) de n donnant un résultat nul.`,
    parts: [
      {
        label: 'f(5) =',
        answer: '12',
        stepsHtml: `<div>f(5) = 25 − 15 + 2 = ${ok('12')}</div>`,
      },
      {
        label: 'Valeurs de n :',
        answer: '1 et 2',
        altAnswers: ['2 et 1', 'n=1 et n=2', 'n=2 et n=1', '1;2', '2;1', '1 ou 2', '1et2', '2et1'],
        stepsHtml: `<div>n² − 3n + 2 = 0 ⟺ (n−1)(n−2) = 0</div>
          <div style="margin-top:6px">n = ${ok('1')} ou n = ${ok('2')}</div>
          <div style="margin-top:4px;color:var(--muted);font-size:12px">Vérif. : 1−3+2 = 0 ✓ &nbsp;|&nbsp; 4−6+2 = 0 ✓</div>`,
      },
    ],
  },
  // Q40 Graphique-vitesses
  {
    type: 'default', exKind: 'auto-calc', qnum: 40, category: 'Vitesses',
    questionHtml: `Marcheur A : part de 0 km à <strong>5 km/h</strong>. Marcheur B : <strong>2 km d'avance</strong>, vitesse <strong>4 km/h</strong>.<br>
      <em>a.</em> Expressions de d<sub>A</sub>(t) et d<sub>B</sub>(t). &nbsp; <em>b.</em> Au bout de combien de temps A rattrape-t-il B ?`,
    parts: [
      {
        label: 'd<sub>A</sub>(t) =',
        answer: '5t',
        stepsHtml: `<div>A part de 0 à 5 km/h → d<sub>A</sub> = ${ok('5t')}</div>`,
      },
      {
        label: 'd<sub>B</sub>(t) =',
        answer: '4t+2',
        altAnswers: ['2+4t', '4t + 2', '2 + 4t'],
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
  description: 'Entraînement intensif aux 9 thèmes du DNB : fractions, équations, statistiques, géométrie…',
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
