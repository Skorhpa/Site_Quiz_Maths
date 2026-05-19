import { useState, type ReactNode } from 'react';
import type { ThalesReciproqueExercise } from '@/types';

const ACCENT = '#FB923C'; // c4

// ── Helpers ───────────────────────────────────────────────────────────────────

function normLetters(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, '').split('').sort().join('');
}
function matchSet(input: string, expected: string): boolean {
  return normLetters(input) === normLetters(expected);
}

// ── Small display components ──────────────────────────────────────────────────

function Frac({ n, d, color }: { n: string; d: string; color?: string }) {
  const c = color ?? 'var(--text)';
  return (
    <span className="frac" style={{ color: c, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
      <span className="fn">{n}</span>
      <span className="fd">{d}</span>
    </span>
  );
}

function EqSign({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', margin: '0 2px' }}>{children}</span>;
}

// ── Inline input ──────────────────────────────────────────────────────────────

interface InpProps {
  id: string;
  get: (id: string) => string;
  set: (id: string, v: string) => void;
  disabled: boolean;
  w?: number;
  ph?: string;
}
function Inp({ id, get, set, disabled, w = 44, ph = '…' }: InpProps) {
  return (
    <input
      type="text"
      value={get(id)}
      placeholder={ph}
      disabled={disabled}
      onChange={e => set(id, e.target.value)}
      style={{
        width: w,
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        fontWeight: 700,
        padding: '3px 4px',
        borderRadius: 6,
        border: '1px solid var(--border2)',
        background: 'var(--bg)',
        color: 'var(--text)',
        textAlign: 'center',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}

// Fraction with two stacked inputs
function FracInp({ idN, idD, get, set, disabled, w = 38 }: {
  idN: string; idD: string;
  get: (id: string) => string; set: (id: string, v: string) => void;
  disabled: boolean; w?: number;
}) {
  return (
    <span className="frac-inp" style={{ verticalAlign: 'middle' }}>
      <input
        type="text" value={get(idN)} placeholder="…" disabled={disabled}
        onChange={e => set(idN, e.target.value)}
        style={{ width: w }}
      />
      <span className="frac-line" style={{ width: w }} />
      <input
        type="text" value={get(idD)} placeholder="…" disabled={disabled}
        onChange={e => set(idD, e.target.value)}
        style={{ width: w }}
      />
    </span>
  );
}

// ── Correction display ────────────────────────────────────────────────────────

function CorrFrac({ n, d }: { n: string; d: string }) {
  return (
    <Frac n={n} d={d} color={ACCENT} />
  );
}

function Correction({ ex }: { ex: ThalesReciproqueExercise }) {
  const { apex, ptL, ptR, ptM, ptN, sM, sA, sN, sB, r1n, r1d, r2n, r2d, isParallel, altRatio } = ex;
  const sym = isParallel ? '=' : '≠';
  const line = (label: string, content: ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
      {label && <span style={{ color: 'var(--muted)', fontSize: 12, minWidth: 110 }}>{label}</span>}
      {content}
    </div>
  );
  const r2NumLabel = altRatio ? `${ptM}${ptN}` : `${apex}${ptN}`;
  const r2DenLabel = altRatio ? `${ptL}${ptR}` : `${apex}${ptR}`;
  const r2NumVal = altRatio ? altRatio.mn : sN;
  const r2DenVal = altRatio ? altRatio.ab : sB;
  return (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 2.1, paddingTop: 4 }}>
      {ex.variant === 'complement' && (
        <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>
          On calcule d'abord les longueurs totales :<br />
          <span style={{ color: 'var(--text)' }}>
            {apex}{ptL} = {apex}{ptM} + {ptM}{ptL} = {sM} + {sA - sM} = {sA} cm
            &nbsp;·&nbsp;
            {apex}{ptR} = {apex}{ptN} + {ptN}{ptR} = {sN} + {sB - sN} = {sB} cm
          </span>
        </div>
      )}
      {line('Dans le triangle', <span style={{ color: 'var(--text)' }}>
        <strong>{apex}{ptL}{ptR}</strong>, on a <strong>{ptM}</strong> ∈ [<strong>{apex}{ptL}</strong>] et <strong>{ptN}</strong> ∈ [<strong>{apex}{ptR}</strong>]
      </span>)}
      {line("D'une part :", <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <CorrFrac n={`${apex}${ptM}`} d={`${apex}${ptL}`} />
        <EqSign>=</EqSign>
        <CorrFrac n={String(sM)} d={String(sA)} />
        <EqSign>=</EqSign>
        <CorrFrac n={String(r1n)} d={String(r1d)} />
      </span>)}
      {line("D'autre part :", <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <CorrFrac n={r2NumLabel} d={r2DenLabel} />
        <EqSign>=</EqSign>
        <CorrFrac n={String(r2NumVal)} d={String(r2DenVal)} />
        <EqSign>=</EqSign>
        <CorrFrac n={String(r2n)} d={String(r2d)} />
      </span>)}
      {line('Donc :', <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <CorrFrac n={`${apex}${ptM}`} d={`${apex}${ptL}`} />
        <span style={{ color: isParallel ? '#4ADE80' : '#F87171', fontWeight: 700, fontSize: 16 }}>{sym}</span>
        <CorrFrac n={r2NumLabel} d={r2DenLabel} />
      </span>)}
      <div style={{ color: 'var(--text)', marginTop: 4 }}>
        {isParallel
          ? <>Donc, d'après la <strong style={{ color: '#4ADE80' }}>réciproque</strong> du théorème de Thalès, les droites <strong>({ptM}{ptN})</strong> et <strong>({ptL}{ptR})</strong> sont <strong>parallèles</strong>.</>
          : <>Donc, d'après la <strong style={{ color: '#F87171' }}>contraposée</strong> du théorème de Thalès, les droites <strong>({ptM}{ptN})</strong> et <strong>({ptL}{ptR})</strong> <strong>ne sont pas parallèles</strong>.</>
        }
      </div>
    </div>
  );
}

// ── Props & AnswerState ───────────────────────────────────────────────────────

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey?: number;
}

interface Props {
  index: number;
  exercise: ThalesReciproqueExercise;
  answer: AnswerState;
  onSubmit: (correct?: boolean) => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function ThalesReciproqueQuestion({ index, exercise: ex, answer, onSubmit }: Props) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [conc, setConc] = useState<'reciproque' | 'contraposee' | ''>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [corrOpen, setCorrOpen] = useState(false);

  const disabled = answer.status !== 'pending';
  const revealed = answer.status === 'revealed' || answer.status === 'wrong';

  const get = (id: string) => fields[id] ?? '';
  const set = (id: string, v: string) => setFields(f => ({ ...f, [id]: v }));

  const inp = (id: string, w = 44) => <Inp id={id} get={get} set={set} disabled={disabled} w={w} />;
  const fracInp = (idN: string, idD: string, w = 38) => (
    <FracInp idN={idN} idD={idD} get={get} set={set} disabled={disabled} w={w} />
  );

  const { apex, ptL, ptR, ptM, ptN, sM, sA, sN, sB, r1n, r1d, r2n, r2d, isParallel, variant, altRatio } = ex;

  const r2NumLabel = altRatio ? `${ptM}${ptN}` : `${apex}${ptN}`;
  const r2DenLabel = altRatio ? `${ptL}${ptR}` : `${apex}${ptR}`;
  const r2NumVal = altRatio ? altRatio.mn : sN;
  const r2DenVal = altRatio ? altRatio.ab : sB;

  // ── Validation ──────────────────────────────────────────────────────────────
  const handleValidate = () => {
    if (disabled) return;
    const errs: string[] = [];

    // Triangle name
    if (!matchSet(get('tri'), apex + ptL + ptR)) {
      errs.push(`Nom du triangle : attend les lettres ${apex}, ${ptL}, ${ptR} (ex : ${apex}${ptL}${ptR})`);
    }
    // M ∈ [segment]
    if (!matchSet(get('mem1pt'), ptM)) {
      errs.push(`Premier point : attend ${ptM}`);
    }
    if (!matchSet(get('mem1seg'), apex + ptL)) {
      errs.push(`${ptM} ∈ [?] : attend [${apex}${ptL}] (ou [${ptL}${apex}])`);
    }
    // N ∈ [segment]
    if (!matchSet(get('mem2pt'), ptN)) {
      errs.push(`Deuxième point : attend ${ptN}`);
    }
    if (!matchSet(get('mem2seg'), apex + ptR)) {
      errs.push(`${ptN} ∈ [?] : attend [${apex}${ptR}] (ou [${ptR}${apex}])`);
    }
    // D'une part — letter fraction
    if (!matchSet(get('r1ln'), apex + ptM)) {
      errs.push(`D'une part — numérateur (lettres) : attend ${apex}${ptM} (ou ${ptM}${apex})`);
    }
    if (!matchSet(get('r1ld'), apex + ptL)) {
      errs.push(`D'une part — dénominateur (lettres) : attend ${apex}${ptL} (ou ${ptL}${apex})`);
    }
    // D'une part — number fraction
    if (parseInt(get('r1nn')) !== sM) {
      errs.push(`D'une part — numérateur (valeur) : attend ${sM}`);
    }
    if (parseInt(get('r1nd')) !== sA) {
      if (variant === 'complement') {
        errs.push(`D'une part — dénominateur (valeur) : ${apex}${ptL} = ${apex}${ptM} + ${ptM}${ptL} = ${sM} + ${sA - sM} = ${sA}`);
      } else {
        errs.push(`D'une part — dénominateur (valeur) : attend ${sA}`);
      }
    }
    // D'une part — simplified fraction value
    const vn1 = parseInt(get('r1vn')); const vd1 = parseInt(get('r1vd'));
    if (isNaN(vn1) || isNaN(vd1) || vd1 === 0 || vn1 !== r1n || vd1 !== r1d) {
      errs.push(`D'une part — fraction irréductible : attend ${r1n}/${r1d}`);
    }
    // D'autre part — letter fraction
    if (!matchSet(get('r2ln'), r2NumLabel)) {
      errs.push(`D'autre part — numérateur (lettres) : attend ${r2NumLabel}`);
    }
    if (!matchSet(get('r2ld'), r2DenLabel)) {
      errs.push(`D'autre part — dénominateur (lettres) : attend ${r2DenLabel}`);
    }
    // D'autre part — number fraction
    if (parseInt(get('r2nn')) !== r2NumVal) {
      errs.push(`D'autre part — numérateur (valeur) : attend ${r2NumVal}`);
    }
    if (parseInt(get('r2nd')) !== r2DenVal) {
      if (!altRatio && variant === 'complement') {
        errs.push(`D'autre part — dénominateur (valeur) : ${apex}${ptR} = ${apex}${ptN} + ${ptN}${ptR} = ${sN} + ${sB - sN} = ${sB}`);
      } else {
        errs.push(`D'autre part — dénominateur (valeur) : attend ${r2DenVal}`);
      }
    }
    // D'autre part — simplified fraction value
    const vn2 = parseInt(get('r2vn')); const vd2 = parseInt(get('r2vd'));
    if (isNaN(vn2) || isNaN(vd2) || vd2 === 0 || vn2 !== r2n || vd2 !== r2d) {
      errs.push(`D'autre part — fraction irréductible : attend ${r2n}/${r2d}`);
    }
    // Comparison symbol
    const expectedSym = isParallel ? '=' : '≠';
    if (get('cmp') !== expectedSym) {
      errs.push(`Symbole de comparaison : attend « ${expectedSym} » car les deux rapports sont ${isParallel ? 'égaux' : 'différents'}`);
    }
    // Conclusion
    const expectedConc = isParallel ? 'reciproque' : 'contraposee';
    if (conc !== expectedConc) {
      errs.push(`Conclusion : choisir « ${isParallel ? 'réciproque' : 'contraposée'} »`);
    }
    // Line names
    const expLines = [normLetters(ptM + ptN), normLetters(ptL + ptR)].sort();
    const gotLines = [normLetters(get('d1')), normLetters(get('d2'))].sort();
    if (gotLines[0] !== expLines[0] || gotLines[1] !== expLines[1]) {
      errs.push(`Noms des droites : attend (${ptM}${ptN}) et (${ptL}${ptR}) (dans n'importe quel ordre)`);
    }

    if (errs.length === 0) {
      setErrors([]);
      onSubmit(true);
    } else {
      setErrors(errs);
      // Do NOT call onSubmit(false): let the student fix and try again
    }
  };

  // ── Status class & border ───────────────────────────────────────────────────
  const cardClass = answer.status === 'correct'
    ? 'eqcard correct-card'
    : (answer.status === 'wrong' || answer.status === 'revealed') ? 'eqcard wrong-card'
    : 'eqcard';

  // Open correction automatically when revealed
  const corrIsOpen = corrOpen || revealed;

  // ── Render ──────────────────────────────────────────────────────────────────
  const proofLine = (content: ReactNode) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      marginBottom: 10, fontSize: 14,
    }}>
      {content}
    </div>
  );

  return (
    <div className={cardClass} style={answer.status === 'pending' ? { borderLeftColor: ACCENT } : undefined}>
      {/* Header */}
      <div className="eqcard-top">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Réciproque / contraposée
        </span>
      </div>

      {/* Figure + data */}
      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
        <div
          dangerouslySetInnerHTML={{ __html: ex.fig }}
          style={{ flex: '0 0 auto', width: 130 }}
        />
        <div style={{ flex: 1, fontSize: 13 }}>
          <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Données
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", color: ACCENT, lineHeight: 1.9 }}>
            {ex.dataLabel}
          </div>
          {variant === 'complement' && (
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
              💡 Calcule d'abord {apex}{ptL} = {apex}{ptM} + {ptM}{ptL} et {apex}{ptR} = {apex}{ptN} + {ptN}{ptR}
            </div>
          )}
          <div style={{ marginTop: 8, fontWeight: 600, fontSize: 13 }}>
            Les droites <span style={{ fontFamily: "'DM Mono', monospace", color: ACCENT }}>({ptM}{ptN})</span> et <span style={{ fontFamily: "'DM Mono', monospace", color: ACCENT }}>({ptL}{ptR})</span> sont-elles parallèles ?
          </div>
        </div>
      </div>

      {/* Proof */}
      <div style={{ padding: '0.8rem 0', borderTop: '1px solid var(--border)' }}>

        {/* Line 1: Triangle + membership */}
        {proofLine(<>
          <span>Dans le triangle</span>
          {inp('tri', 52)}
          <span>, on a</span>
          {inp('mem1pt', 26)}
          <span>∈ [</span>
          {inp('mem1seg', 36)}
          <span>] et</span>
          {inp('mem2pt', 26)}
          <span>∈ [</span>
          {inp('mem2seg', 36)}
          <span>]</span>
        </>)}

        {/* Line 2: D'une part */}
        {proofLine(<>
          <span style={{ color: 'var(--muted)', minWidth: 100 }}>D'une part :</span>
          {fracInp('r1ln', 'r1ld')}
          <EqSign>=</EqSign>
          {fracInp('r1nn', 'r1nd')}
          <EqSign>=</EqSign>
          {fracInp('r1vn', 'r1vd')}
        </>)}

        {/* Line 3: D'autre part */}
        {proofLine(<>
          <span style={{ color: 'var(--muted)', minWidth: 100 }}>D'autre part :</span>
          {fracInp('r2ln', 'r2ld')}
          <EqSign>=</EqSign>
          {fracInp('r2nn', 'r2nd')}
          <EqSign>=</EqSign>
          {fracInp('r2vn', 'r2vd')}
        </>)}

        {/* Line 4: Donc comparison */}
        {proofLine(<>
          <span>Donc</span>
          <Frac n={`${apex}${ptM}`} d={`${apex}${ptL}`} />
          <select
            value={get('cmp')}
            disabled={disabled}
            onChange={e => set('cmp', e.target.value)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 16,
              fontWeight: 700,
              padding: '3px 6px',
              borderRadius: 6,
              border: '1px solid var(--border2)',
              background: 'var(--bg)',
              color: get('cmp') === '' ? 'var(--muted)' : 'var(--text)',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            <option value="">?</option>
            <option value="=">=</option>
            <option value="≠">≠</option>
          </select>
          <Frac n={r2NumLabel} d={r2DenLabel} />
        </>)}

        {/* Line 5: Conclusion radio */}
        <div style={{ fontSize: 14, lineHeight: 2.4, marginTop: 4 }}>
          <div style={{ marginBottom: 4 }}>Donc, d'après :</div>
          {(['reciproque', 'contraposee'] as const).map(choice => (
            <div
              key={choice}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginLeft: 16, marginBottom: 4,
                opacity: disabled && conc !== '' && conc !== choice ? 0.4 : 1,
              }}
            >
              <input
                type="radio"
                name={`conc-${index}`}
                value={choice}
                checked={conc === choice}
                disabled={disabled}
                onChange={() => setConc(choice)}
                style={{ accentColor: ACCENT, cursor: disabled ? 'default' : 'pointer' }}
              />
              <span style={{ cursor: disabled ? 'default' : 'pointer' }} onClick={() => { if (!disabled) setConc(choice); }}>
                la <strong>{choice === 'reciproque' ? 'réciproque' : 'contraposée'}</strong> du théorème de Thalès
                {choice === 'reciproque'
                  ? <> → les droites <strong>sont parallèles</strong></>
                  : <> → les droites <strong>ne sont pas parallèles</strong></>}
              </span>
            </div>
          ))}
          {/* Line names — separate from radio labels */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6, marginLeft: 16 }}>
            <span>Noms des droites : (</span>
            {inp('d1', 40)}
            <span>) et (</span>
            {inp('d2', 40)}
            <span>)</span>
          </div>
        </div>
      </div>

      {/* Validate */}
      {!disabled && (
        <div style={{ marginTop: 10 }}>
          <button
            className="btn-primary"
            style={{ background: ACCENT, color: '#0F1117' }}
            onClick={handleValidate}
          >
            Vérifier
          </button>
        </div>
      )}

      {/* Correct feedback */}
      {answer.status === 'correct' && (
        <div className="feedback ok" style={{ marginTop: 10 }}>
          ✓ Correct — {isParallel
            ? `d'après la réciproque, (${ptM}${ptN}) ∥ (${ptL}${ptR})`
            : `d'après la contraposée, (${ptM}${ptN}) n'est pas ∥ à (${ptL}${ptR})`}
        </div>
      )}

      {/* Error list */}
      {errors.length > 0 && !disabled && (
        <div style={{
          marginTop: 10, background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 8, padding: '10px 14px',
        }}>
          <div style={{ fontWeight: 700, color: '#F87171', marginBottom: 6, fontSize: 12 }}>
            {errors.length} erreur{errors.length > 1 ? 's' : ''} — corrige et réessaie :
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text)', lineHeight: 1.9 }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Correction toggle */}
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="hint-toggle"
          onClick={() => setCorrOpen(v => !v)}
        >
          <span>{corrIsOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${corrIsOpen ? ' open' : ''}`} style={{ padding: '12px 14px' }}>
          <Correction ex={ex} />
        </div>
      </div>
    </div>
  );
}
