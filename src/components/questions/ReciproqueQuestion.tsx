import { useRef, useState } from 'react';
import type { ReciproqueDemoExercise, ReciproqueDragDropExercise, ReciproqueExercise, ReciproqueTableExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface Props {
  index: number;
  exercise: ReciproqueExercise;
  answer: AnswerState;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

const ACCENT = '#A78BFA'; // var(--crp)

const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '').replace(/\[|\]/g, '');

export function ReciproqueQuestion(props: Props) {
  if (props.exercise.rpType === 'table') {
    return <ReciproqueTable {...props} exercise={props.exercise} />;
  }
  if (props.exercise.rpType === 'dragdrop') {
    return <ReciproqueDragDrop {...props} exercise={props.exercise} />;
  }
  return <ReciproqueDemo {...props} exercise={props.exercise} />;
}

type DragSrc =
  | { from: 'pool'; text: string }
  | { from: 'slot'; idx: number; text: string };

function ReciproqueDragDrop({ index, exercise, answer, onSubmit }: Props & { exercise: ReciproqueDragDropExercise }) {
  const [placed, setPlaced] = useState<(string | null)[]>(() => Array(exercise.steps.length).fill(null));
  const [pool, setPool] = useState<string[]>(() => [...exercise.shuffled]);
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; cls: string }>({ text: '', cls: 'feedback' });
  const dragSrc = useRef<DragSrc | null>(null);
  const disabled = answer.status !== 'pending';

  const dropToSlot = (toIdx: number) => {
    if (!dragSrc.current || disabled) return;
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src.from === 'pool') {
      const existing = placed[toIdx];
      setPool((p) => {
        const filtered = p.filter((s) => s !== src.text);
        return existing !== null ? [...filtered, existing] : filtered;
      });
      setPlaced((prev) => {
        const next = [...prev];
        next[toIdx] = src.text;
        return next;
      });
    } else {
      setPlaced((prev) => {
        const next = [...prev];
        const existing = next[toIdx];
        next[src.idx] = existing;
        next[toIdx] = src.text;
        return next;
      });
    }
  };

  const dropToPool = () => {
    if (!dragSrc.current || disabled) return;
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src.from === 'slot') {
      setPool((p) => [...p, src.text]);
      setPlaced((prev) => {
        const next = [...prev];
        next[src.idx] = null;
        return next;
      });
    }
  };

  const handleVerify = () => {
    if (disabled) return;
    if (placed.some((p) => p === null)) {
      setFeedback({ text: '✗ Place toutes les étapes avant de vérifier.', cls: 'feedback ko' });
      return;
    }
    const normalOk = placed.every((p, i) => p === exercise.steps[i]);
    const [si, sj] = exercise.swappableSteps ?? [-1, -1];
    const swappedOk = si >= 0 && placed.every((p, i) => {
      if (i === si) return p === exercise.steps[sj];
      if (i === sj) return p === exercise.steps[si];
      return p === exercise.steps[i];
    });
    const ok = normalOk || swappedOk;
    setFeedback({
      text: ok ? '✓ Parfait ! Les étapes sont dans le bon ordre.' : "✗ L'ordre n'est pas correct.",
      cls: ok ? 'feedback ok' : 'feedback ko',
    });
    onSubmit(ok);
  };

  const finalFb = answer.status === 'revealed'
    ? { text: "Voici l'ordre correct ci-dessous.", cls: 'feedback ko' }
    : feedback;

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext" dangerouslySetInnerHTML={{ __html: exercise.text }} />
      </div>
      <div className="qbody" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div dangerouslySetInnerHTML={{ __html: exercise.figure }} />
        <div style={{ flex: 1, minWidth: 260 }}>
          {!disabled && (
            <>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Étapes à placer :</p>
              <div className="drag-pool" onDragOver={(e) => e.preventDefault()} onDrop={dropToPool}>
                {pool.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                    Glisse une étape ici pour la retirer.
                  </span>
                ) : (
                  pool.map((step) => (
                    <div
                      key={step}
                      className="drag-item"
                      draggable
                      onDragStart={() => { dragSrc.current = { from: 'pool', text: step }; }}
                      dangerouslySetInnerHTML={{ __html: step }}
                    />
                  ))
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 8px' }}>
                Remets les étapes dans l'ordre :
              </p>
            </>
          )}
          {disabled && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Ordre correct :</p>
          )}
          <div className="drag-slots">
            {exercise.steps.map((correctStep, i) => {
              const content = disabled ? correctStep : placed[i];
              return (
                <div
                  key={i}
                  className="drag-slot"
                  onDragOver={(e) => { if (!disabled) e.preventDefault(); }}
                  onDrop={() => { if (!disabled) dropToSlot(i); }}
                >
                  <span className="drag-slot-num">{i + 1}.</span>
                  {content != null ? (
                    <div
                      className="drag-item drag-slot-item"
                      draggable={!disabled}
                      onDragStart={!disabled ? () => { dragSrc.current = { from: 'slot', idx: i, text: content }; } : undefined}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <span className="drag-slot-empty">Glisse une étape ici…</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)} style={{ color: ACCENT }}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`}>
          {exercise.steps.map((step, i) => (
            <div key={i}>
              <span className="step-eq" dangerouslySetInnerHTML={{ __html: `${i + 1}. ${step}` }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <button type="button" className="btn-primary" disabled={disabled} onClick={handleVerify} style={{ background: ACCENT }}>
          Vérifier
        </button>
        <div className={finalFb.cls}>{finalFb.text}</div>
      </div>
    </div>
  );
}

function ReciproqueTable({ index, exercise, answer, onSubmit }: Props & { exercise: ReciproqueTableExercise }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [picks, setPicks] = useState<Record<number, 'O' | 'N' | undefined>>({});
  const [feedback, setFeedback] = useState<{ text: string; cls: string }>({ text: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled) return;
    const errors: number[] = [];
    exercise.selected.forEach(({ isRect }, j) => {
      const expected = isRect ? 'O' : 'N';
      if (picks[j] !== expected) errors.push(j + 1);
    });
    if (errors.length === 0) {
      setFeedback({ text: '✓ Tout est correct !', cls: 'feedback ok' });
      onSubmit(true);
    } else {
      setFeedback({ text: `✗ Erreur(s) : ${errors.map((n) => `ligne ${n}`).join(', ')}`, cls: 'feedback ko' });
      onSubmit(false);
    }
  };

  const finalFb = (() => {
    if (answer.status === 'revealed') return { text: 'Voir la correction ci-dessous.', cls: 'feedback ko' };
    return feedback;
  })();

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext">Pour chaque triangle, indique s'il est rectangle en cochant Oui ou Non.</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '10px 0' }}>
        <thead>
          <tr style={{ background: 'var(--surface2)' }}>
            <th style={{ padding: '8px 12px' }}>Côté 1</th>
            <th style={{ padding: '8px 12px' }}>Côté 2</th>
            <th style={{ padding: '8px 12px' }}>Côté 3</th>
            <th style={{ padding: '8px 12px' }}>Rectangle ?</th>
          </tr>
        </thead>
        <tbody>
          {exercise.selected.map(({ sides }, j) => (
            <tr key={j}>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "'DM Mono', monospace" }}>{sides[0]}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "'DM Mono', monospace" }}>{sides[1]}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "'DM Mono', monospace" }}>{sides[2]}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                <label style={{ cursor: 'pointer', marginRight: 10 }}>
                  <input type="radio" name={`rp-tbl-${index}-${j}`} value="O" checked={picks[j] === 'O'} disabled={disabled} onChange={() => setPicks((p) => ({ ...p, [j]: 'O' }))} /> Oui
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" name={`rp-tbl-${index}-${j}`} value="N" checked={picks[j] === 'N'} disabled={disabled} onChange={() => setPicks((p) => ({ ...p, [j]: 'N' }))} /> Non
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="btn-primary" disabled={disabled} onClick={handleSubmit} style={{ background: ACCENT }}>
          Vérifier
        </button>
      </div>
      <div className={finalFb.cls} style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
        {finalFb.text}
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)} style={{ color: ACCENT }}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div
          className={`steps-box${hintOpen ? ' open' : ''}`}
          style={{ fontSize: 13, lineHeight: 2.1 }}
          dangerouslySetInnerHTML={{ __html: exercise.steps }}
        />
      </div>
    </div>
  );
}

function ReciproqueDemo({ index, exercise, answer, onSubmit }: Props & { exercise: ReciproqueDemoExercise }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [ceq, setCeq] = useState<'=' | '≠' | ''>('');
  const [feedback, setFeedback] = useState<{ html: string; cls: string }>({ html: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  const { P, Q, R, a, b, c, sq1, sq2a, sq2b, sum, isRect, rightVertex } = exercise;
  const tri = `${P}${Q}${R}`;
  const hyp = `${Q}${R}`;
  const eqStr = isRect ? '=' : '≠';

  const get = (id: string) => (fields[id] ?? '').trim();
  const set = (id: string, v: string) => setFields((s) => ({ ...s, [id]: v }));

  const inp = (id: string, w = 55) => (
    <input
      type="text"
      className="recip-inp"
      value={get(id)}
      placeholder="…"
      disabled={disabled}
      onChange={(e) => set(id, e.target.value)}
      style={{ width: w }}
    />
  );

  const handleSubmit = () => {
    if (disabled) return;
    const a1 = get('a1');
    const okA1 = a1.includes('[') && a1.includes(']') && norm(a1) === hyp.toLowerCase();
    const okA2 = get('a2') === String(c);
    const okB4 = get('b4') === String(sq1);
    const okB11 = get('b11') === String(sq2a);
    const okB12 = get('b12') === String(sq2b);
    const okB15 = get('b15') === String(sum);
    const okEq = ceq === eqStr;
    const cc1 = norm(get('cc1'));
    const cc2 = norm(get('cc2'));
    let okC1: boolean, okC2: boolean, okC3 = true;
    if (isRect) {
      okC1 = cc1.includes('reciproque') || cc1.includes('réciproque');
      okC2 = cc2.includes('rectangle') || cc2.includes('rect');
      okC3 = get('cc3').toUpperCase() === rightVertex;
    } else {
      okC1 = cc1.includes('contraposee') || cc1.includes('contraposée');
      okC2 = cc2.includes("n'estpasrectangle") || cc2.includes('estpasr') || cc2.includes('pasr') || cc2.includes('pasrectangle');
    }
    const numOk = okB4 && okB11 && okB12 && okB15;
    const allOk = okA1 && okA2 && numOk && okEq && okC1 && okC2 && okC3;
    if (allOk) {
      setFeedback({ html: '✓ Tout est correct !', cls: 'feedback ok' });
      onSubmit(true);
    } else {
      const parts: string[] = [];
      if (!okA1) parts.push(`a) écrire l'hypoténuse avec des crochets : [${hyp}]`);
      else if (!okA2) parts.push(`a) valeur : ${c}`);
      if (!okB4) parts.push(`${hyp}² = ${sq1}`);
      if (!okB11 || !okB12) parts.push(`${P + Q}² + ${P + R}² = ${sq2a} + ${sq2b}`);
      if (!okB15) parts.push(`somme = ${sum}`);
      if (!okEq) parts.push(`signe : ${eqStr}`);
      if (!okC1) parts.push(`c) mot clé : ${isRect ? 'réciproque' : 'contraposée'}`);
      if (isRect && (!okC2 || !okC3)) parts.push(`c) conclusion : rectangle en ${rightVertex}`);
      if (!isRect && !okC2) parts.push(`c) conclusion : n'est pas rectangle`);
      setFeedback({ html: `✗ ${parts.join(' · ')}`, cls: 'feedback ko' });
      onSubmit(false);
    }
  };

  const finalFb = (() => {
    if (answer.status === 'revealed') return { html: 'Voir la correction ci-dessous.', cls: 'feedback ko' };
    return feedback;
  })();

  const corrC = isRect
    ? `D'après la <strong style="color:var(--crp);">réciproque</strong> du théorème de Pythagore,<br>le triangle ${tri} est <strong style="color:var(--crp);">rectangle en ${rightVertex}</strong>.`
    : `D'après la <strong style="color:var(--crp);">contraposée</strong> du théorème de Pythagore,<br>le triangle ${tri} <strong style="color:var(--crp);">n'est pas rectangle</strong>.`;

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext" style={{ fontWeight: 600 }}>
          {isRect ? "Démontrer qu'un triangle est rectangle" : "Démontrer qu'un triangle n'est pas rectangle"}
        </div>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>{exercise.label}</div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div dangerouslySetInnerHTML={{ __html: exercise.svg }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, margin: '10px 0 4px' }}>
            a. Quel côté pourrait être l'hypoténuse ?
          </div>
          <div style={{ fontSize: 13, lineHeight: 2.4, color: 'var(--text)' }}>
            {inp('a1', 55)} pourrait être l'hypoténuse car il s'agit du plus grand des 3 côtés ({inp('a2', 35)} m).
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, margin: '10px 0 4px' }}>b. Calcule et compare</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 2.6 }}>
            <div>{inp('b1', 45)}² = {inp('b2', 35)}² = {inp('b4', 55)}</div>
            <div>{inp('b5', 35)}² + {inp('b6', 35)}² = {inp('b7', 35)}² + {inp('b8', 35)}² = {inp('b11', 55)} + {inp('b12', 55)} = {inp('b15', 60)}</div>
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {inp('c1', 45)}²
            <span style={{ display: 'flex', gap: 6 }}>
              <label style={{ cursor: 'pointer', fontSize: 13, padding: '4px 10px', borderRadius: 6, border: '1.5px solid var(--border2)', background: 'var(--bg)' }}>
                <input type="radio" name={`rp-ceq-${index}`} value="=" checked={ceq === '='} disabled={disabled} onChange={() => setCeq('=')} style={{ marginRight: 4 }} />=
              </label>
              <label style={{ cursor: 'pointer', fontSize: 13, padding: '4px 10px', borderRadius: 6, border: '1.5px solid var(--border2)', background: 'var(--bg)' }}>
                <input type="radio" name={`rp-ceq-${index}`} value="≠" checked={ceq === '≠'} disabled={disabled} onChange={() => setCeq('≠')} style={{ marginRight: 4 }} />≠
              </label>
            </span>
            {inp('c2', 35)}² + {inp('c3', 35)}²
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, margin: '10px 0 4px' }}>c. Conclusion</div>
          <div style={{ fontSize: 13, lineHeight: 2.4, color: 'var(--text)' }}>
            {isRect ? (
              <>
                D'après la {inp('cc1', 90)} du théorème de Pythagore,
                <br />
                le triangle {tri} est {inp('cc2', 80)} en {inp('cc3', 30)}.
              </>
            ) : (
              <>
                D'après la {inp('cc1', 90)} du théorème de Pythagore,
                <br />
                le triangle {tri} {inp('cc2', 130)}.
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
        <button className="btn-primary" disabled={disabled} onClick={handleSubmit} style={{ background: ACCENT }}>
          Vérifier
        </button>
        <div className={finalFb.cls} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }} dangerouslySetInnerHTML={{ __html: finalFb.html }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)} style={{ color: ACCENT }}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.2 }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>a.</div>
          <div style={{ color: ACCENT }}>[{hyp}] est l'hypoténuse car {c} est le plus grand des 3 côtés.</div>
          <div style={{ fontWeight: 600, color: 'var(--text)', margin: '8px 0 4px' }}>b.</div>
          <div style={{ fontFamily: "'DM Mono', monospace", lineHeight: 2.2 }}>
            <div>{hyp}² = {c}² = <strong style={{ color: ACCENT }}>{sq1}</strong></div>
            <div>{P}{Q}² + {P}{R}² = {a}² + {b}² = {sq2a} + {sq2b} = <strong style={{ color: ACCENT }}>{sum}</strong></div>
            <div style={{ fontWeight: 700, color: ACCENT }}>{hyp}² {eqStr} {P}{Q}² + {P}{R}²</div>
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text)', margin: '8px 0 4px' }}>c.</div>
          <div style={{ color: ACCENT }} dangerouslySetInnerHTML={{ __html: corrC }} />
        </div>
      </div>
    </div>
  );
}
