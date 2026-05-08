import type { ProduitExercise } from '@/types';

const ACCENT = '#4ADE80'; // var(--c9)

const randNZ = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = Math.floor(Math.random() * (b - a + 1)) + a;
  return v;
};

type Factory = () => Omit<ProduitExercise, 'type' | 'color'>;

const BANK: Factory[] = [
  // 1. Aire région en L
  () => {
    const a = randNZ(3, 7);
    const b = randNZ(2, 5);
    const c = randNZ(2, Math.max(3, a - 1));
    const ansCoef = b;
    const ansConst = b * (a - c);
    const W = 180, H = 120;
    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" style="display:block;margin:8px 0;">
      <rect x="10" y="10" width="140" height="90" fill="rgba(74,222,128,0.07)" stroke="#4ADE80" stroke-width="1.5"/>
      <rect x="100" y="60" width="50" height="40" fill="rgba(74,222,128,0.3)" stroke="#4ADE80" stroke-width="1.5" stroke-dasharray="4,3"/>
      <text x="55" y="45" fill="#4ADE80" font-family="DM Mono,monospace" font-size="11" text-anchor="middle">Aire colorée</text>
      <text x="5" y="57" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${b}</text>
      <text x="75" y="108" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11" text-anchor="middle">${a}+x</text>
      <text x="125" y="108" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11" text-anchor="middle">${c}</text>
    </svg>`;
    const question = `La figure ci-dessous montre un grand rectangle de dimensions <strong>(${a}+x)</strong> × <strong>${b}</strong> dont on a ôté un rectangle de <strong>${c}</strong> × <strong>${b}</strong> (partie hachurée). Exprime l'aire de la partie verte en fonction de x.`;
    const steps = `<div style="color:var(--text);">Aire grand rect = (${a}+x) × ${b} = ${a * b} + ${b}x</div>
    <div style="color:var(--text);margin-top:4px;">Aire rect ôté = ${c} × ${b} = ${c * b}</div>
    <div style="color:var(--text);margin-top:4px;">Aire colorée = ${a * b} + ${b}x − ${c * b} = <strong style="color:var(--correct);">${b}x + ${ansConst}</strong></div>`;
    return {
      label: 'Aire (région)',
      question,
      svg,
      ans: `${ansCoef}x+${ansConst}`,
      steps,
      hintLine: 'Aire totale − Aire ôtée',
    };
  },

  // 2. Périmètre rectangle avec un côté x
  () => {
    const a = randNZ(3, 8);
    const b = randNZ(2, 6);
    const cst = 2 * a + 2 * b;
    const W = 190, H = 110;
    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" style="display:block;margin:8px 0;">
      <rect x="20" y="20" width="150" height="70" fill="rgba(74,222,128,0.07)" stroke="#4ADE80" stroke-width="1.5"/>
      <text x="95" y="15" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${a}+x</text>
      <text x="178" y="58" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${b}</text>
      <text x="95" y="105" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${a}+x</text>
      <text x="5" y="58" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${b}</text>
    </svg>`;
    const question = `Exprime le périmètre du rectangle ci-dessous en fonction de x.`;
    const steps = `<div style="color:var(--text);">P = 2 × longueur + 2 × largeur</div>
    <div style="color:var(--text);margin-top:4px;">P = 2 × (${a}+x) + 2 × ${b}</div>
    <div style="color:var(--text);margin-top:4px;">P = ${2 * a} + 2x + ${2 * b}</div>
    <div style="margin-top:6px;"><strong style="color:var(--correct);">P = 2x + ${cst}</strong></div>`;
    return {
      label: 'Périmètre',
      question,
      svg,
      ans: `2x+${cst}`,
      steps,
      hintLine: 'P = 2L + 2l',
    };
  },

  // 3. Aire d'un triangle base kx hauteur h
  () => {
    const k = randNZ(2, 5);
    const h = randNZ(2, 6);
    const coef = k * h;
    const ansNum = coef / 2;
    const svg = `<svg width="180" height="120" viewBox="0 0 180 120" fill="none" style="display:block;margin:8px 0;">
      <polygon points="90,10 10,100 170,100" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <line x1="90" y1="10" x2="90" y2="100" stroke="#A0A8B8" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="90" y="110" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${k}x</text>
      <text x="100" y="56" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${h}</text>
    </svg>`;
    const question = `Exprime l'aire du triangle ci-dessous en fonction de x.`;
    const steps = `<div style="color:var(--text);">A = base × hauteur ÷ 2</div>
    <div style="color:var(--text);margin-top:4px;">A = ${k}x × ${h} ÷ 2</div>
    <div style="color:var(--text);margin-top:4px;">A = ${coef}x ÷ 2${coef % 2 === 0 ? ` = ${ansNum}x` : ''}</div>
    <div style="margin-top:6px;"><strong style="color:var(--correct);">A = ${ansNum}x</strong></div>`;
    return {
      label: 'Aire (triangle)',
      question,
      svg,
      ans: `${ansNum}x`,
      steps,
      hintLine: 'A = base × hauteur ÷ 2',
    };
  },

  // 4. Aire rectangle simple (ax) × b
  () => {
    const a = randNZ(2, 5);
    const b = randNZ(2, 5);
    const svg = `<svg width="190" height="110" viewBox="0 0 190 110" fill="none" style="display:block;margin:8px 0;">
      <rect x="20" y="20" width="150" height="70" fill="rgba(74,222,128,0.07)" stroke="#4ADE80" stroke-width="1.5"/>
      <text x="95" y="15" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${a}x</text>
      <text x="178" y="58" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${b}</text>
    </svg>`;
    const question = `Exprime l'aire du rectangle ci-dessous en fonction de x.`;
    const steps = `<div style="color:var(--text);">A = longueur × largeur = ${a}x × ${b}</div>
    <div style="margin-top:6px;"><strong style="color:var(--correct);">A = ${a * b}x</strong></div>`;
    return {
      label: 'Aire (rectangle)',
      question,
      svg,
      ans: `${a * b}x`,
      steps,
      hintLine: 'A = L × l',
    };
  },

  // 5. Aire trapèze
  () => {
    const a = randNZ(2, 5);
    const b = randNZ(a + 1, a + 4);
    const h = randNZ(2, 5);
    const num = (a + b) * h;
    const ansNum = num / 2;
    const svg = `<svg width="200" height="120" viewBox="0 0 200 120" fill="none" style="display:block;margin:8px 0;">
      <polygon points="60,10 140,10 180,100 20,100" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <line x1="100" y1="10" x2="100" y2="100" stroke="#A0A8B8" stroke-width="1" stroke-dasharray="3,3"/>
      <text x="100" y="6" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${a}x</text>
      <text x="100" y="112" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${b}x</text>
      <text x="115" y="58" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${h}</text>
    </svg>`;
    const question = `Exprime l'aire du trapèze ci-dessous en fonction de x.`;
    const steps = `<div style="color:var(--text);">A = (grande base + petite base) × hauteur ÷ 2</div>
    <div style="color:var(--text);margin-top:4px;">A = (${b}x + ${a}x) × ${h} ÷ 2</div>
    <div style="color:var(--text);margin-top:4px;">A = ${a + b}x × ${h} ÷ 2 = ${num}x ÷ 2 = <strong style="color:var(--correct);">${ansNum}x</strong></div>`;
    return {
      label: 'Aire (trapèze)',
      question,
      svg,
      ans: `${ansNum}x`,
      steps,
      hintLine: 'A = (B+b) × h ÷ 2',
    };
  },

  // 6. Somme de 3 entiers consécutifs
  () => {
    const svg = `<svg width="220" height="60" viewBox="0 0 220 60" fill="none" style="display:block;margin:8px 0;">
      <rect x="10" y="15" width="55" height="30" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <rect x="82" y="15" width="55" height="30" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <rect x="154" y="15" width="55" height="30" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <text x="37" y="35" fill="#4ADE80" font-family="DM Mono,monospace" font-size="13" text-anchor="middle">n</text>
      <text x="109" y="35" fill="#4ADE80" font-family="DM Mono,monospace" font-size="13" text-anchor="middle">n+1</text>
      <text x="181" y="35" fill="#4ADE80" font-family="DM Mono,monospace" font-size="13" text-anchor="middle">n+2</text>
      <text x="68" y="35" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="16" text-anchor="middle">+</text>
      <text x="140" y="35" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="16" text-anchor="middle">+</text>
    </svg>`;
    const question = `Soit n un entier. Calcule la somme des trois entiers consécutifs représentés ci-dessous, puis factorise le résultat.`;
    const steps = `<div style="color:var(--text);">n + (n+1) + (n+2) = n + n + 1 + n + 2 = 3n + 3</div>
    <div style="color:var(--text);margin-top:4px;">3n + 3 = 3 × (n + 1)</div>
    <div style="margin-top:6px;color:var(--muted);font-size:12px;">La somme de 3 entiers consécutifs est le triple de celui du milieu.</div>
    <div style="margin-top:4px;"><strong style="color:var(--correct);">= 3(n+1)</strong></div>`;
    return {
      label: 'Entiers consécutifs',
      question,
      svg,
      ans: '3(n+1)',
      steps,
      hintLine: 'Regroupe les n, puis factorise',
    };
  },

  // 7. Somme de 4 entiers consécutifs
  () => {
    const svg = `<svg width="280" height="60" viewBox="0 0 280 60" fill="none" style="display:block;margin:8px 0;">
      <rect x="5" y="15" width="52" height="30" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <rect x="72" y="15" width="52" height="30" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <rect x="139" y="15" width="52" height="30" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <rect x="206" y="15" width="60" height="30" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ADE80" stroke-width="1.5"/>
      <text x="31" y="35" fill="#4ADE80" font-family="DM Mono,monospace" font-size="13" text-anchor="middle">n</text>
      <text x="98" y="35" fill="#4ADE80" font-family="DM Mono,monospace" font-size="13" text-anchor="middle">n+1</text>
      <text x="165" y="35" fill="#4ADE80" font-family="DM Mono,monospace" font-size="13" text-anchor="middle">n+2</text>
      <text x="236" y="35" fill="#4ADE80" font-family="DM Mono,monospace" font-size="13" text-anchor="middle">n+3</text>
      <text x="59" y="35" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="16" text-anchor="middle">+</text>
      <text x="126" y="35" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="16" text-anchor="middle">+</text>
      <text x="193" y="35" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="16" text-anchor="middle">+</text>
    </svg>`;
    const question = `Soit n le premier de quatre entiers consécutifs. Calcule leur somme et simplifie.`;
    const steps = `<div style="color:var(--text);">n + (n+1) + (n+2) + (n+3) = 4n + 6</div>
    <div style="color:var(--text);margin-top:4px;">= 2(2n + 3)</div>
    <div style="margin-top:6px;color:var(--muted);font-size:12px;">La somme de 4 entiers consécutifs est toujours paire.</div>
    <div style="margin-top:4px;"><strong style="color:var(--correct);">= 4n + 6</strong></div>`;
    return {
      label: 'Entiers consécutifs',
      question,
      svg,
      ans: '4n+6',
      steps,
      hintLine: 'Regroupe les n puis les constantes',
    };
  },

  // 8. Périmètre triangle avec côtés x, kx, c
  () => {
    const k = randNZ(2, 4);
    const c = randNZ(3, 8);
    const coef = 1 + k;
    const svg = `<svg width="190" height="130" viewBox="0 0 190 130" fill="none" style="display:block;margin:8px 0;">
      <polygon points="95,10 10,115 180,115" fill="rgba(74,222,128,0.07)" stroke="#4ADE80" stroke-width="1.5"/>
      <text x="40" y="72" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12">x</text>
      <text x="140" y="72" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12">${k}x</text>
      <text x="90" y="127" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">${c}</text>
    </svg>`;
    const question = `Exprime le périmètre du triangle ci-dessous en fonction de x.`;
    const steps = `<div style="color:var(--text);">P = x + ${k}x + ${c}</div>
    <div style="color:var(--text);margin-top:4px;">P = (1 + ${k})x + ${c}</div>
    <div style="margin-top:6px;"><strong style="color:var(--correct);">P = ${coef}x + ${c}</strong></div>`;
    return {
      label: 'Périmètre',
      question,
      svg,
      ans: `${coef}x+${c}`,
      steps,
      hintLine: 'Additionne les trois côtés',
    };
  },

  // 9. Aire région (grand triangle − petit)
  () => {
    const bGrand = randNZ(4, 7);
    const bPetit = randNZ(2, Math.max(3, bGrand - 1));
    const h = randNZ(3, 6);
    const diff = bGrand - bPetit;
    const num = diff * h;
    const ansNum = num / 2;
    const svg = `<svg width="200" height="130" viewBox="0 0 200 130" fill="none" style="display:block;margin:8px 0;">
      <polygon points="100,10 10,115 190,115" fill="rgba(74,222,128,0.08)" stroke="#4ADE80" stroke-width="1.5"/>
      <polygon points="100,10 52,115 148,115" fill="rgba(74,222,128,0.3)" stroke="#4ADE80" stroke-width="1.5" stroke-dasharray="4,3"/>
      <text x="100" y="127" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11" text-anchor="middle">${bGrand}x</text>
      <text x="100" y="100" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11" text-anchor="middle">${bPetit}x</text>
      <text x="160" y="65" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${h}</text>
    </svg>`;
    const question = `La figure montre un grand triangle de base <strong>${bGrand}x</strong> et un petit triangle intérieur (hachuré) de base <strong>${bPetit}x</strong>. Les deux ont la même hauteur <strong>${h}</strong>. Exprime l'aire de la partie verte.`;
    const steps = `<div style="color:var(--text);">Aire grand = ${bGrand}x × ${h} ÷ 2 = ${(bGrand * h) / 2}x</div>
    <div style="color:var(--text);margin-top:4px;">Aire petit = ${bPetit}x × ${h} ÷ 2 = ${(bPetit * h) / 2}x</div>
    <div style="color:var(--text);margin-top:4px;">Aire verte = ${(bGrand * h) / 2}x − ${(bPetit * h) / 2}x = <strong style="color:var(--correct);">${ansNum}x</strong></div>`;
    return {
      label: 'Aire (région)',
      question,
      svg,
      ans: `${ansNum}x`,
      steps,
      hintLine: 'Aire grand triangle − Aire petit',
    };
  },

  // 10. Démonstration n² − (n−1)² impair
  () => {
    const svg = `<svg width="200" height="90" viewBox="0 0 200 90" fill="none" style="display:block;margin:8px 0;">
      <rect x="10" y="10" width="170" height="65" rx="6" fill="rgba(74,222,128,0.07)" stroke="#4ADE80" stroke-width="1.5"/>
      <text x="100" y="34" fill="#4ADE80" font-family="DM Mono,monospace" font-size="14" text-anchor="middle">n² − (n−1)²</text>
      <text x="100" y="58" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="12" text-anchor="middle">= ?</text>
    </svg>`;
    const question = `Soit n un entier. Démontre que <strong>n² − (n−1)²</strong> est toujours un nombre impair.`;
    const steps = `<div style="color:var(--text);">n² − (n−1)² = n² − (n² − 2n + 1)</div>
    <div style="color:var(--text);margin-top:4px;">= n² − n² + 2n − 1</div>
    <div style="color:var(--text);margin-top:4px;">= 2n − 1</div>
    <div style="margin-top:6px;color:var(--muted);font-size:12px;">2n est toujours pair, donc 2n − 1 est toujours impair.</div>
    <div style="margin-top:4px;"><strong style="color:var(--correct);">= 2n − 1</strong></div>`;
    return {
      label: 'Démonstration',
      question,
      svg,
      ans: '2n-1',
      steps,
      hintLine: 'Développe (n−1)² = n² − 2n + 1',
    };
  },
];

export function generateProduitSeries(): ProduitExercise[] {
  const pool = [...BANK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, 10).map((fn) => ({ type: 'default', color: ACCENT, ...fn() }));
}
