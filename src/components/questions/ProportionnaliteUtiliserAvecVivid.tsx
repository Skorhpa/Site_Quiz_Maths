import { useState } from 'react';
import {
  checkQuotient,
  fmtNum,
  generateEtiquetteExercise,
  generateFullTableExercise,
  generateLotExercise,
  generateUniteDirecteExercise,
  generateUniteInverseExercise,
  type EtiquetteExercise,
  type FullTableExercise,
  type LotExercise,
  type UniteDirecteExercise,
  type UniteInverseExercise,
} from './ProportionnaliteHub';
import {
  AnswerRow, C, CardFooter, CardShell, GridTable, Good, Inp, Scene, SectionLabel, StepsCorrection, Tip,
  VividHero, VividPage, iconFor, isBlank, useStringArray,
  type AnswerState, type CardTheme,
} from './ProportionnaliteVividKit';

/**
 * 6ème · Proportionnalité · « Utiliser » · « Avec tableau » — redesigned page, same exercise set and
 * validation rules as the 5ème quiz (lot, étiquette nutritionnelle, passage par l'unité ×2, tableau complet).
 */

const round2 = (n: number) => Math.round(n * 100) / 100;
const TBL_COLORS = [C.blue, C.orange, C.green] as const;

type UtiliserExercise =
  | { exKind: 'lot'; data: LotExercise }
  | { exKind: 'etiquette'; data: EtiquetteExercise }
  | { exKind: 'unite-directe'; data: UniteDirecteExercise }
  | { exKind: 'unite-inverse'; data: UniteInverseExercise }
  | { exKind: 'full-table'; data: FullTableExercise };

function buildExercises(): UtiliserExercise[] {
  return [
    { exKind: 'lot', data: generateLotExercise() },
    { exKind: 'etiquette', data: generateEtiquetteExercise() },
    { exKind: 'unite-directe', data: generateUniteDirecteExercise() },
    { exKind: 'unite-inverse', data: generateUniteInverseExercise() },
    { exKind: 'full-table', data: generateFullTableExercise() },
  ];
}

const ICONS: [RegExp, string][] = [
  // lots
  [/papier peint/, '🧻'], [/bouteilles d'eau/, '💧'], [/bonbons/, '🍬'], [/cartes/, '🃏'], [/mouchoirs/, '🤧'], [/chocolat/, '🍫'],
  // étiquettes
  [/orange/, '🍊'], [/lait demi/, '🥛'], [/compote/, '🥣'], [/citron/, '🍋'],
  // unité directe
  [/jonquille/, '🌼'], [/rose/, '🌹'], [/tulipe/, '🌷'], [/cahier/, '📓'], [/stylo/, '🖊️'], [/carnet/, '📒'],
  // unité inverse
  [/pulls/, '🧥'], [/fromage/, '🧀'], [/vêtements/, '👕'], [/pains/, '🍞'],
  // tableau complet
  [/imprimante/, '🖨️'], [/robinet/, '🚰'], [/ouvriers/, '🏭'], [/cycliste/, '🚴'], [/sucre/, '🍰'], [/photocopies/, '📠'], [/essence/, '🚗'],
];

function themeFor(ex: UtiliserExercise): CardTheme {
  switch (ex.exKind) {
    case 'lot':
      return { color: C.orange, icon: iconFor(ex.data.itemPlural, ICONS, '🛍️'), deco: '×', tag: 'Échauffement', stars: 1, title: 'Vente par lot : utilise le coefficient', short: 'Vente par lot' };
    case 'etiquette':
      return { color: C.green, icon: iconFor(ex.data.product, ICONS, '🥤'), deco: '%', tag: 'Entraînement', stars: 2, title: 'Étiquette nutritionnelle : plusieurs lignes à compléter', short: 'Étiquette nutritionnelle' };
    case 'unite-directe':
      return { color: C.sky, icon: iconFor(ex.data.singular, ICONS, '💐'), deco: '1', tag: 'Entraînement', stars: 2, title: 'Passage par l\'unité : d\'abord le prix d\'un seul', short: 'Passage par l\'unité' };
    case 'unite-inverse':
      return { color: C.violet, icon: iconFor(ex.data.itemPlural, ICONS, '🏭'), deco: '÷', tag: 'Défi', stars: 3, title: 'Passage par l\'unité : dans l\'autre sens', short: 'Unité (sens inverse)' };
    default:
      return { color: C.pink, icon: iconFor(ex.data.text, ICONS, '🧮'), deco: '=', tag: 'Défi', stars: 3, title: 'Complète tout le tableau à partir de l\'énoncé', short: 'Tableau complet' };
  }
}

// ── Questions ─────────────────────────────────────────────────────────────────

function LotCard({ index, exercise: e, theme, answer, onSubmit }: {
  index: number; exercise: LotExercise; theme: CardTheme; answer: AnswerState; onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVal] = useStringArray(2); // [priceA, qtyB]
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const okA = checkQuotient(vals[0]!, e.priceA);
  const okB = checkQuotient(vals[1]!, e.qtyB);
  const submit = () => {
    if (disabled) return;
    if (vals.some(isBlank)) { setTried(true); return; }
    onSubmit(okA && okB);
  };
  const fa = e.qtyA / e.lotSize;
  const fb = e.moneyB / e.lotPrice;
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.blue}>🧮 Complète le tableau avec les questions a et b</Tip>}>
        Des {e.itemPlural} sont vendus par lot de <strong>{e.lotSize}</strong>, au prix de <strong>{fmtNum(e.lotPrice)} €</strong> le lot.
        <br />a. Quel est le prix de {e.qtyA} {e.itemPlural} ?
        <br />b. Combien de {e.itemPlural} aurai-je pour {fmtNum(e.moneyB)} € ?
      </Scene>
      <GridTable
        rowLabels={[`Nombre de ${e.itemPlural}`, 'Prix (€)']}
        colColors={TBL_COLORS}
        rows={[
          [e.lotSize, e.qtyA, <Inp value={vals[1]!} onChange={(v) => setVal(1, v)} disabled={disabled} color={C.green} label="Nombre obtenu" />],
          [fmtNum(e.lotPrice), <Inp value={vals[0]!} onChange={(v) => setVal(0, v)} disabled={disabled} color={C.orange} label="Prix" />, fmtNum(e.moneyB)],
        ]}
        status={disabled ? [[null, null, okB], [null, okA, null]] : undefined}
      />
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && vals.some(isBlank)} />
      <StepsCorrection
        color={theme.color}
        labels={['a', 'b']}
        steps={[
          <>{e.qtyA} = {e.lotSize} × {fa}, donc le prix est {fmtNum(e.lotPrice)} × {fa} = <Good>{fmtNum(e.priceA)} €</Good>.</>,
          <>Pour {fmtNum(e.moneyB)} €, on paye {fb} fois plus que {fmtNum(e.lotPrice)} €, donc on obtient {fb} fois plus de {e.itemPlural}, soit <Good>{e.qtyB}</Good>.</>,
        ]}
      />
    </CardShell>
  );
}

function EtiquetteCard({ index, exercise: e, theme, answer, onSubmit }: {
  index: number; exercise: EtiquetteExercise; theme: CardTheme; answer: AnswerState; onSubmit: (ok: boolean) => void;
}) {
  const [v1, setV1] = useStringArray(e.rows.length);
  const [v2, setV2] = useStringArray(e.rows.length);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const ok1 = (i: number) => checkQuotient(v1[i]!, e.rows[i]!.val1);
  const ok2 = (i: number) => checkQuotient(v2[i]!, e.rows[i]!.val2);
  const missing = v1.some(isBlank) || v2.some(isBlank);
  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(e.rows.every((_, i) => ok1(i) && ok2(i)));
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.blue}>🧮 Calculatrice autorisée</Tip>}>
        Voici les valeurs nutritionnelles pour <strong>{e.baseQty} mL</strong> de {e.product}. Complète le tableau pour{' '}
        <strong>{e.qty1} mL</strong> et <strong>{e.qty2} mL</strong>.
      </Scene>
      <GridTable
        colHeaders={[`${e.baseQty} mL`, `${e.qty1} mL`, `${e.qty2} mL`]}
        rowLabels={e.rows.map((r) => r.label)}
        colColors={TBL_COLORS}
        rows={e.rows.map((r, i) => [
          fmtNum(r.perBase),
          <Inp value={v1[i]!} onChange={(v) => setV1(i, v)} disabled={disabled} color={C.orange} label={`${r.label} pour ${e.qty1} mL`} />,
          <Inp value={v2[i]!} onChange={(v) => setV2(i, v)} disabled={disabled} color={C.green} label={`${r.label} pour ${e.qty2} mL`} />,
        ])}
        status={disabled ? e.rows.map((_, i) => [null, ok1(i), ok2(i)]) : undefined}
      />
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing} />
      <StepsCorrection
        color={theme.color}
        steps={e.rows.map((r) => (
          <>{r.label} : <Good>{fmtNum(r.val1)}</Good> pour {e.qty1} mL, <Good>{fmtNum(r.val2)}</Good> pour {e.qty2} mL.</>
        ))}
      />
    </CardShell>
  );
}

function UniteDirecteCard({ index, exercise: e, theme, answer, onSubmit }: {
  index: number; exercise: UniteDirecteExercise; theme: CardTheme; answer: AnswerState; onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVal] = useStringArray(2); // [unitP, price2]
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const okUnit = checkQuotient(vals[0]!, e.unitPrice);
  const okP2 = checkQuotient(vals[1]!, e.price2);
  const submit = () => {
    if (disabled) return;
    if (vals.some(isBlank)) { setTried(true); return; }
    onSubmit(okUnit && okP2);
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>
        <strong>{e.qty1} {e.plural}</strong> coûtent <strong>{fmtNum(e.price1)} €</strong>. Calcule le prix de{' '}
        <strong>{e.qty2} {e.plural}</strong>.
      </Scene>
      <GridTable
        rowLabels={[`Nombre de ${e.plural}`, 'Prix (€)']}
        colColors={[C.blue, C.orange]}
        rows={[
          [e.qty1, e.qty2],
          [fmtNum(e.price1), <Inp value={vals[1]!} onChange={(v) => setVal(1, v)} disabled={disabled} color={C.orange} label="Prix demandé" />],
        ]}
        status={disabled ? [[null, null], [null, okP2]] : undefined}
      />
      <SectionLabel color={theme.color}>✏️ Passe d'abord par l'unité</SectionLabel>
      <div className="pv-calcs">
        <AnswerRow color={theme.color} letter="1" status={disabled ? okUnit : null}>
          <span className="pv-calc-label">1 {e.singular} →</span>
          <Inp value={vals[0]!} onChange={(v) => setVal(0, v)} disabled={disabled} color={theme.color} label="Prix d'un seul" />
          <span className="pv-unit">€</span>
        </AnswerRow>
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && vals.some(isBlank)} />
      <StepsCorrection
        color={theme.color}
        steps={[
          <>{e.qty1} {e.plural} → {fmtNum(e.price1)} €</>,
          <>1 {e.singular} → {fmtNum(e.price1)} € ÷ {e.qty1} = <Good>{fmtNum(e.unitPrice)} €</Good></>,
          <>{e.qty2} {e.plural} → {e.qty2} × {fmtNum(e.unitPrice)} € = <Good>{fmtNum(e.price2)} €</Good></>,
        ]}
      />
    </CardShell>
  );
}

function UniteInverseCard({ index, exercise: e, theme, answer, onSubmit }: {
  index: number; exercise: UniteInverseExercise; theme: CardTheme; answer: AnswerState; onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVal] = useStringArray(2); // [rate, itemCount2]
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const okRate = checkQuotient(vals[0]!, e.rate);
  const okCount = checkQuotient(vals[1]!, e.itemCount2);
  const submit = () => {
    if (disabled) return;
    if (vals.some(isBlank)) { setTried(true); return; }
    onSubmit(okRate && okCount);
  };
  const verbInf = e.verb === 'confectionne' ? 'confectionner' : e.verb === 'fabrique' ? 'fabriquer' : e.verb;
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>
        Avec <strong>{e.unitQty1} {e.unitPlural}</strong>, on {e.verb} <strong>{e.itemCount1} {e.itemPlural}</strong>. Calcule le nombre
        de {e.itemPlural} obtenus avec <strong>{e.unitQty2} {e.unitPlural}</strong>.
      </Scene>
      <GridTable
        rowLabels={[`Nombre de ${e.itemPlural}`, `Nombre de ${e.unitPlural}`]}
        colColors={[C.blue, C.orange]}
        rows={[
          [e.itemCount1, <Inp value={vals[1]!} onChange={(v) => setVal(1, v)} disabled={disabled} color={C.orange} label="Nombre obtenu" />],
          [e.unitQty1, e.unitQty2],
        ]}
        status={disabled ? [[null, okCount], [null, null]] : undefined}
      />
      <SectionLabel color={theme.color}>✏️ Combien d'unités pour fabriquer un seul ?</SectionLabel>
      <div className="pv-calcs">
        <AnswerRow color={theme.color} letter="1" status={disabled ? okRate : null}>
          <span className="pv-calc-label">{e.unitQty1} : {e.itemCount1} =</span>
          <Inp value={vals[0]!} onChange={(v) => setVal(0, v)} disabled={disabled} color={theme.color} label="Unités par objet" />
          <span className="pv-unit">({e.unitPlural} par {e.itemSingular})</span>
        </AnswerRow>
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && vals.some(isBlank)} />
      <StepsCorrection
        color={theme.color}
        steps={[
          <>{e.unitQty1} : {e.itemCount1} = <Good>{e.rate}</Good></>,
          <>{e.unitQty2} : {e.rate} = <Good>{e.itemCount2}</Good></>,
          <>On peut {verbInf} <Good>{e.itemCount2}</Good> {e.itemPlural}.</>,
        ]}
      />
    </CardShell>
  );
}

function FullTableCard({ index, exercise: e, theme, answer, onSubmit }: {
  index: number; exercise: FullTableExercise; theme: CardTheme; answer: AnswerState; onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVal] = useStringArray(4); // [q1, q2, v1, v2]
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const expected = [e.qty1, e.qty2, e.value1, e.value2];
  const oks = vals.map((v, i) => checkQuotient(v, expected[i]!));
  const submit = () => {
    if (disabled) return;
    if (vals.some(isBlank)) { setTried(true); return; }
    onSubmit(oks.every(Boolean));
  };
  const k = fmtNum(round2(e.value1 / e.qty1));
  const colors = [C.blue, C.orange, C.blue, C.orange];
  const cell = (i: number, label: string) => (
    <Inp value={vals[i]!} onChange={(v) => setVal(i, v)} disabled={disabled} color={colors[i]!} label={label} />
  );
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.blue}>🧮 Complète tout le tableau avec l'énoncé et un calcul</Tip>}>{e.text}</Scene>
      <GridTable
        colHeaders={['Donnée 1', 'Donnée 2']}
        rowLabels={[e.qtyLabel, e.valueLabel]}
        colColors={[C.blue, C.orange]}
        rows={[
          [cell(0, `${e.qtyLabel} (1)`), cell(1, `${e.qtyLabel} (2)`)],
          [cell(2, `${e.valueLabel} (1)`), cell(3, `${e.valueLabel} (2)`)],
        ]}
        status={disabled ? [[oks[0], oks[1]], [oks[2], oks[3]]] : undefined}
      />
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && vals.some(isBlank)} />
      <StepsCorrection
        color={theme.color}
        steps={[
          <>{e.qtyLabel} : <Good>{e.qty1}</Good> et <Good>{e.qty2}</Good> (données de l'énoncé)</>,
          <>{e.valueLabel} : <Good>{fmtNum(e.value1)}</Good> (donnée de l'énoncé)</>,
          <>Coefficient : {fmtNum(e.value1)} ÷ {e.qty1} = {k}</>,
          <>{e.qty2} × {k} = <Good>{fmtNum(e.value2)}</Good></>,
        ]}
      />
    </CardShell>
  );
}

// ── Hero illustration ─────────────────────────────────────────────────────────

function HeroTables() {
  const ask = <span className="pv-ask">?</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div className="pv-cap">⛽ Essence à 1,22 € le litre</div>
        <GridTable
          rowLabels={['Quantité (L)', 'Prix (€)']}
          colColors={[C.blue, C.orange, C.green]}
          rows={[[1, '5,5', ask], ['1,22', ask, 5]]}
        />
        <div className="pv-cap pv-cap-sub">5,5 × 1,22 = 6,71 € &nbsp;·&nbsp; 5 ÷ 1,22 ≈ 4,1 L</div>
      </div>
      <div>
        <div className="pv-cap">🥞 300 g de farine pour 12 crêpes</div>
        <GridTable
          rowLabels={['Crêpes', 'Farine (g)']}
          colColors={[C.blue, C.orange, C.green]}
          rows={[[12, 4, 16], [300, ask, ask]]}
        />
        <div className="pv-cap pv-cap-sub">300 ÷ 3 = 100 g &nbsp;·&nbsp; 300 + 100 = 400 g</div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ProportionnaliteUtiliserAvecVivid({ accent, onBack }: {
  accent: string;
  accentSecondary?: string;
  onBack: () => void;
}) {
  return (
    <VividPage<UtiliserExercise>
      accent={accent}
      hero={
        <VividHero
          onBack={onBack}
          crumbs={[{ label: 'Utiliser', color: C.blue }, { label: '▦ Avec tableau', color: C.green }]}
          title="Comment utiliser un tableau de proportionnalité ?"
          intro={<>Pour <strong>compléter</strong> un tableau de proportionnalité, tu as trois méthodes. Choisis la plus simple selon les nombres !</>}
          steps={[
            {
              emoji: '✖️', color: C.orange, title: 'Le coefficient',
              text: <>On passe d'une ligne à l'autre en <strong>multipliant</strong> par le coefficient (et en <strong>divisant</strong> dans l'autre sens).</>,
            },
            {
              emoji: '↔️', color: C.green, title: 'Les colonnes',
              text: <>On <strong>multiplie ou divise</strong> une colonne par un même nombre, ou on <strong>additionne / soustrait</strong> des colonnes.</>,
            },
            {
              emoji: '1️⃣', color: C.violet, title: 'L\'unité',
              text: <>On revient à <strong>1</strong> : 3 cahiers → 4,05 € ; 1 cahier → 1,35 € ; 7 cahiers → <strong>9,45 €</strong>.</>,
            },
          ]}
          videos={[{ url: 'https://www.youtube.com/watch?v=O91-Dq06k0U', label: 'Vidéo : utiliser un tableau de proportionnalité' }]}
          illusTitle="✨ Deux exemples"
          illus={<HeroTables />}
        />
      }
      tip={{ emoji: '🧠', title: 'Astuce', text: <>Pas de coefficient « rond » ? Repasse par <strong>l'unité</strong> : elle fonctionne dans tous les tableaux de proportionnalité.</> }}
      build={buildExercises}
      themeFor={themeFor}
      renderCard={(ex, i, p) => {
        if (ex.exKind === 'lot') return <LotCard index={i} exercise={ex.data} {...p} />;
        if (ex.exKind === 'etiquette') return <EtiquetteCard index={i} exercise={ex.data} {...p} />;
        if (ex.exKind === 'unite-directe') return <UniteDirecteCard index={i} exercise={ex.data} {...p} />;
        if (ex.exKind === 'unite-inverse') return <UniteInverseCard index={i} exercise={ex.data} {...p} />;
        return <FullTableCard index={i} exercise={ex.data} {...p} />;
      }}
    />
  );
}
