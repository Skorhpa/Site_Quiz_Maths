import { useState, type KeyboardEvent } from 'react';
import type { PropExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface PropQuestionProps {
  index: number;
  exercise: PropExercise;
  answer: AnswerState;
  onSubmit: (correct: boolean) => void;
}

const CARD_STATUS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

// ── shared styles ─────────────────────────────────────────────────────────────

const tdBase: React.CSSProperties = {
  padding: '9px 14px',
  border: '1px solid var(--border2)',
  textAlign: 'center',
  fontFamily: "'DM Mono', monospace",
  fontSize: 14,
  color: 'var(--text)',
};

const tdLabel: React.CSSProperties = {
  ...tdBase,
  background: 'var(--surface2)',
  fontWeight: 600,
  textAlign: 'left',
  color: 'var(--muted)',
  fontSize: 13,
};

const radioRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 12,
};

// ── helpers ───────────────────────────────────────────────────────────────────

function RadioBtn({
  id, checked, disabled, onChange, label,
}: { id: string; checked: boolean; disabled: boolean; onChange(): void; label: string }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'default' : 'pointer',
        padding: '7px 14px',
        borderRadius: 8,
        border: `1px solid ${checked ? 'var(--c6)' : 'var(--border2)'}`,
        background: checked ? 'rgba(52,211,153,0.12)' : 'transparent',
        color: checked ? 'var(--c6)' : 'var(--muted)',
        fontSize: 13,
        fontWeight: checked ? 600 : 400,
        transition: 'all 0.15s',
      }}
    >
      <input
        id={id}
        type="radio"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      {label}
    </label>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export function PropQuestion({ index, exercise, answer, onSubmit }: PropQuestionProps) {
  const [value, setValue] = useState('');
  const [yesNo, setYesNo] = useState<'yes' | 'no' | null>(null);
  const [alignment, setAlignment] = useState<'aligned_origin' | 'aligned' | 'some' | null>(null);
  const [hintOpen, setHintOpen] = useState(false);

  const disabled = answer.status !== 'pending';

  const checkCorrect = (): boolean => {
    if (exercise.subtype === 'table4') {
      const n = parseFloat(value.trim().replace(',', '.'));
      if (isNaN(n)) return false;
      const tol = exercise.t4Round ? 0.06 : 0.001;
      return Math.abs(n - (exercise.t4Ans ?? 0)) < tol;
    }
    if (exercise.subtype === 'check23') {
      return yesNo === (exercise.c23IsProp ? 'yes' : 'no');
    }
    if (exercise.subtype === 'problem') {
      const n = parseFloat(value.trim().replace(',', '.'));
      if (isNaN(n)) return false;
      return Math.abs(n - (exercise.probAns ?? 0)) < 0.06;
    }
    if (exercise.subtype === 'graph') {
      if (exercise.graphIsProp) return yesNo === 'yes' && alignment === 'aligned_origin';
      return yesNo === 'no';
    }
    return false;
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (exercise.subtype === 'table4' || exercise.subtype === 'problem') {
      if (value.trim() === '') return;
    } else if (exercise.subtype === 'check23') {
      if (yesNo === null) return;
    } else if (exercise.subtype === 'graph') {
      if (yesNo === null) return;
      if (yesNo === 'yes' && alignment === null) return;
    }
    onSubmit(checkCorrect());
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // ── answer display for feedback ────────────────────────────────────────────

  const ansDisplay = (() => {
    if (exercise.subtype === 'table4') return String(exercise.t4Ans ?? '');
    if (exercise.subtype === 'check23') return exercise.c23IsProp ? 'Oui' : 'Non';
    if (exercise.subtype === 'problem') return String(exercise.probAns ?? '');
    if (exercise.subtype === 'graph') {
      return exercise.graphIsProp
        ? "Oui → les points sont alignés avec l'origine"
        : 'Non';
    }
    return '';
  })();

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ Réponse : ${ansDisplay}`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Réponse : ${ansDisplay}`, cls: 'feedback ko' };
    return { text: '', cls: 'feedback' };
  })();

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `${exercise.color}22`,
    color: exercise.color,
  };

  const LABEL: Record<PropExercise['subtype'], string> = {
    table4: 'Produit en croix',
    check23: 'Proportionnalité ?',
    problem: 'Problème',
    graph: 'Graphique',
  };

  // ── table4 renderer ────────────────────────────────────────────────────────

  const renderTable4 = () => (
    <>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
        Le tableau ci-dessous est un tableau de proportionnalité.<br />
        Trouve la valeur manquante à l'aide d'un produit en croix.
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 14 }}>
        <tbody>
          <tr>
            <td style={tdLabel}>{exercise.t4Row1Label}</td>
            {exercise.t4Row1?.map((v, i) => (
              <td
                key={i}
                style={v === null
                  ? { ...tdBase, background: `${exercise.color}22`, color: exercise.color, fontWeight: 700, fontSize: 18 }
                  : tdBase
                }
              >
                {v === null ? '?' : v}
              </td>
            ))}
          </tr>
          <tr>
            <td style={tdLabel}>{exercise.t4Row2Label}</td>
            {exercise.t4Row2?.map((v, i) => (
              <td
                key={i}
                style={v === null
                  ? { ...tdBase, background: `${exercise.color}22`, color: exercise.color, fontWeight: 700, fontSize: 18 }
                  : tdBase
                }
              >
                {v === null ? '?' : v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <input
        type="text"
        className="lit-inp"
        value={value}
        placeholder={exercise.t4Round ? 'Valeur arrondie au dixième…' : 'Valeur exacte…'}
        autoComplete="off"
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
      />
    </>
  );

  // ── check23 renderer ───────────────────────────────────────────────────────

  const renderCheck23 = () => (
    <>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Ce tableau est-il un tableau de proportionnalité ?
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 14 }}>
        <tbody>
          <tr>
            <td style={tdLabel}>{exercise.c23Row1Label}</td>
            {exercise.c23Row1?.map((v, i) => <td key={i} style={tdBase}>{v}</td>)}
          </tr>
          <tr>
            <td style={tdLabel}>{exercise.c23Row2Label}</td>
            {exercise.c23Row2?.map((v, i) => <td key={i} style={tdBase}>{v}</td>)}
          </tr>
        </tbody>
      </table>
      <div style={radioRow}>
        <RadioBtn id={`c23-yes-${index}`} checked={yesNo === 'yes'} disabled={disabled} onChange={() => setYesNo('yes')} label="Oui" />
        <RadioBtn id={`c23-no-${index}`} checked={yesNo === 'no'} disabled={disabled} onChange={() => setYesNo('no')} label="Non" />
      </div>
    </>
  );

  // ── problem renderer ───────────────────────────────────────────────────────

  const renderProblem = () => {
    const r1 = exercise.probRow1 ?? [];
    const r2 = exercise.probRow2 ?? [];
    const cols = exercise.probColLabels ?? [];
    return (
      <>
        {exercise.probStory && (
          <div
            style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)', marginBottom: 12 }}
            dangerouslySetInnerHTML={{ __html: exercise.probStory }}
          />
        )}
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 14 }}>
          <thead>
            <tr>
              <td style={{ ...tdLabel, background: 'transparent' }}></td>
              {cols.map((c, i) => <th key={i} style={{ ...tdBase, background: 'var(--surface2)', fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdLabel}>{exercise.probRow1Label}</td>
              {r1.map((v, i) => (
                <td key={i} style={v === null
                  ? { ...tdBase, background: `${exercise.color}22`, color: exercise.color, fontWeight: 700, fontSize: 18 }
                  : exercise.probDotted ? { ...tdBase, color: 'var(--muted)', letterSpacing: 2 } : tdBase}
                >{v === null ? '?' : exercise.probDotted ? '......' : v}</td>
              ))}
            </tr>
            <tr>
              <td style={tdLabel}>{exercise.probRow2Label}</td>
              {r2.map((v, i) => (
                <td key={i} style={v === null
                  ? { ...tdBase, background: `${exercise.color}22`, color: exercise.color, fontWeight: 700, fontSize: 18 }
                  : exercise.probDotted ? { ...tdBase, color: 'var(--muted)', letterSpacing: 2 } : tdBase}
                >{v === null ? '?' : exercise.probDotted ? '......' : v}</td>
              ))}
            </tr>
          </tbody>
        </table>
        <input
          type="text"
          className="lit-inp"
          value={value}
          placeholder="Résultat du produit en croix…"
          autoComplete="off"
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
        />
      </>
    );
  };

  // ── graph renderer ─────────────────────────────────────────────────────────

  const renderGraph = () => (
    <>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Ce graphique représente-t-il une situation de proportionnalité ?
      </p>
      {exercise.graphSvg && (
        <div
          style={{ marginBottom: 14, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)', padding: '8px' }}
          dangerouslySetInnerHTML={{ __html: exercise.graphSvg }}
        />
      )}
      <div style={radioRow}>
        <RadioBtn id={`g-yes-${index}`} checked={yesNo === 'yes'} disabled={disabled} onChange={() => { setYesNo('yes'); setAlignment(null); }} label="Oui" />
        <RadioBtn id={`g-no-${index}`} checked={yesNo === 'no'} disabled={disabled} onChange={() => { setYesNo('no'); setAlignment(null); }} label="Non" />
      </div>
      {yesNo === 'yes' && (
        <div style={{ ...radioRow, flexDirection: 'column', gap: 8, marginTop: 14, paddingLeft: 12, borderLeft: `2px solid ${exercise.color}` }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>Pourquoi ?</p>
          <RadioBtn id={`g-a1-${index}`} checked={alignment === 'aligned_origin'} disabled={disabled} onChange={() => setAlignment('aligned_origin')} label="Les points sont alignés avec l'origine" />
          <RadioBtn id={`g-a2-${index}`} checked={alignment === 'aligned'} disabled={disabled} onChange={() => setAlignment('aligned')} label="Les points sont alignés" />
          <RadioBtn id={`g-a3-${index}`} checked={alignment === 'some'} disabled={disabled} onChange={() => setAlignment('some')} label="Certains points sont alignés" />
        </div>
      )}
    </>
  );

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`qcard ${CARD_STATUS[answer.status]}`} style={{ borderLeft: `3px solid ${exercise.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{LABEL[exercise.subtype]}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      {exercise.subtype === 'table4' && renderTable4()}
      {exercise.subtype === 'check23' && renderCheck23()}
      {exercise.subtype === 'problem' && renderProblem()}
      {exercise.subtype === 'graph' && renderGraph()}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={handleSubmit}
          style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}
        >
          OK
        </button>
      </div>

      <div className={feedback.cls} style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }}>
        {feedback.text}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}>
          <div dangerouslySetInnerHTML={{ __html: exercise.steps }} />
          {(exercise.subtype === 'table4' || exercise.subtype === 'problem') && (
            <div style={{ marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
              <span style={{ color: 'var(--muted)' }}>Réponse = </span>
              <strong style={{ color: 'var(--correct)' }}>{ansDisplay}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
