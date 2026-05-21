import { useRef, useState, type KeyboardEvent } from 'react';
import type { ThalesCalcExercise, ThalesCompleterExercise, ThalesDragDropExercise, ThalesExercise } from '@/types';
import { thalesFormatAns, thalesIsWhole } from '@/lib/generators/thales';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface Props {
  index: number;
  exercise: ThalesExercise;
  answer: AnswerState;
  onChange: (value: string) => void;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

export function ThalesQuestion(props: Props) {
  if (props.exercise.thType === 'completer') {
    return <ThalesCompleter {...props} exercise={props.exercise} />;
  }
  if (props.exercise.thType === 'dragdrop') {
    return <ThalesDragDrop {...props} exercise={props.exercise} />;
  }
  return <ThalesCalc {...props} exercise={props.exercise} />;
}

function ThalesCalc({ index, exercise, answer, onChange, onSubmit }: Props & { exercise: ThalesCalcExercise }) {
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled) return;
    const v = parseFloat(answer.value.replace(',', '.'));
    if (Number.isNaN(v)) return;
    const tol = thalesIsWhole(exercise.ans) ? 0.001 : 0.06;
    onSubmit(Math.abs(v - exercise.ans) < tol);
  };
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ Réponse : ${thalesFormatAns(exercise.ans, 'cm')}`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Réponse : ${thalesFormatAns(exercise.ans, 'cm')}`, cls: 'feedback ko' };
    return { text: '', cls: 'feedback' };
  })();

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext">Calcule <strong>{exercise.askLabel}</strong>.</div>
      </div>
      <div
        style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--muted)', marginBottom: '1rem', lineHeight: 2 }}
        dangerouslySetInnerHTML={{ __html: exercise.textParts.join(' &nbsp;·&nbsp; ') }}
      />
      <div className="qbody">
        <div className="figure-wrap" dangerouslySetInnerHTML={{ __html: exercise.fig }} />
        <div className="qinfo">
          <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
            <span>{hintOpen ? '▼' : '▶'}</span> Voir la solution
          </button>
          <div className={`steps-box${hintOpen ? ' open' : ''}`}>
            {exercise.steps.map((s, j) => (
              <div key={j}>
                <span className="step-eq" dangerouslySetInnerHTML={{ __html: s.eq }} />
              </div>
            ))}
          </div>
          <div className="answer-row">
            <span className="answer-label">{exercise.askLabel} =</span>
            <input
              type="number"
              step="0.01"
              placeholder="?"
              value={answer.value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKey}
            />
            <span className="unit">cm</span>
            <button className="btn-secondary" disabled={disabled} onClick={handleSubmit}>
              OK
            </button>
          </div>
          {exercise.decHint && <div dangerouslySetInnerHTML={{ __html: exercise.decHint }} />}
          <div className={feedback.cls}>{feedback.text}</div>
        </div>
      </div>
    </div>
  );
}

type DragSrc =
  | { from: 'pool'; text: string }
  | { from: 'slot'; idx: number; text: string };

function ThalesDragDrop({ index, exercise, answer, onSubmit }: Props & { exercise: ThalesDragDropExercise }) {
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
    const ok = placed.every((p, i) => p === exercise.steps[i]);
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
    <div className={`qcard ${CARD_CLASS[answer.status]}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext" dangerouslySetInnerHTML={{ __html: exercise.text }} />
      </div>
      <div className="qbody" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="figure-wrap" dangerouslySetInnerHTML={{ __html: exercise.figure }} />
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
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
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
        <button type="button" className="btn-primary" disabled={disabled} onClick={handleVerify}>
          Vérifier
        </button>
        <div className={finalFb.cls}>{finalFb.text}</div>
      </div>
    </div>
  );
}

function ThalesCompleter({ index, exercise, answer, onSubmit }: Props & { exercise: ThalesCompleterExercise }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ text: string; cls: string }>({ text: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  const cfg = exercise.cfg;
  const { bl, br, ml, mr } = cfg.letters;
  const nMN = ml + mr, nBC = bl + br;
  const f1 = cfg.find[0]!, f2 = cfg.find[1]!;
  const a1 = cfg.answers[f1]!, a2 = cfg.answers[f2]!;

  const set = (id: string, v: string) => setFields((s) => ({ ...s, [id]: v }));
  const get = (id: string) => fields[id] ?? '';

  const inpFr = (topId: string, botId: string, w = 48) => (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 2px', lineHeight: '1.15' }}>
      {inp(topId, w)}
      <span style={{ width: '100%', borderTop: '1.5px solid currentColor', display: 'block', margin: '1px 0' }} />
      {inp(botId, w)}
    </span>
  );

  const inp = (id: string, w = 55) => (
    <input
      type="text"
      placeholder="..."
      value={get(id)}
      disabled={disabled}
      onChange={(e) => set(id, e.target.value)}
      style={{
        width: w,
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        padding: '3px 5px',
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

  const handleSubmit = () => {
    if (disabled) return;
    const v1 = parseFloat(get('c1ans').replace(',', '.'));
    const v2 = parseFloat(get('c2ans').replace(',', '.'));
    const ok1 = !Number.isNaN(v1) && Math.abs(v1 - a1) < 0.06;
    const ok2 = !Number.isNaN(v2) && Math.abs(v2 - a2) < 0.06;
    if (ok1 && ok2) {
      setFeedback({ text: `✓ ${f1} = ${a1} cm et ${f2} = ${a2} cm — Correct !`, cls: 'feedback ok' });
      onSubmit(true);
    } else {
      setFeedback({ text: `✗ ${f1} = ${a1} cm · ${f2} = ${a2} cm`, cls: 'feedback ko' });
      onSubmit(false);
    }
  };

  const finalFb = (() => {
    if (answer.status === 'revealed')
      return { text: `${f1} = ${a1} cm · ${f2} = ${a2} cm`, cls: 'feedback ko' };
    return feedback;
  })();

  const knownList = Object.entries(cfg.known)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k} = ${v} cm`)
    .join(' · ');

  const corrBlock = (calc: typeof cfg.calc1) => (
    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Calcul de {calc.unknown}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--muted)', lineHeight: 2.2 }}>
        <div style={{ color: 'var(--c4)' }} dangerouslySetInnerHTML={{ __html: calc.ratioUsed }} />
        <div dangerouslySetInnerHTML={{ __html: calc.s1 }} />
        <div>{calc.s2}</div>
        <div>{calc.s3}</div>
        <div style={{ color: 'var(--correct)', fontWeight: 700, marginTop: 4 }}>→ {calc.result}</div>
      </div>
    </div>
  );

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext" style={{ fontSize: 14 }}>
          Complète le raisonnement. On donne :{' '}
          <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--c4)' }}>{knownList}</span>
        </div>
      </div>
      <div className="qbody" style={{ alignItems: 'flex-start', gap: '1.5rem' }}>
        <div className="figure-wrap" dangerouslySetInnerHTML={{ __html: exercise.fig }} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 14, lineHeight: 2.4, color: 'var(--text)' }}>
            Dans le triangle {inp('tri', 52)}, {ml} ∈ {inp('seg1', 62)} et {mr} ∈ {inp('seg2', 62)} et ({nMN}) {inp('par', 30)} ({nBC}).
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 2px' }}>D'après le théorème de Thalès :</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            {inpFr('r1', 'r2')} = {inpFr('r3', 'r4')} = {inpFr('r5', 'r6')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>soit :</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {inpFr('n1', 'n2')} = {inpFr('n3', 'n4')} = {inpFr('n5', 'n6')}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Calcul de {f1}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 2.6, color: 'var(--text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>{inpFr('c1a', 'c1b')} = {inpFr('c1c', 'c1d')}</div>
            <div>{f1} = {inp('c1e', 48)} × {inp('c1f', 48)} ÷ {inp('c1g', 48)}</div>
            <div><strong>Donc {f1} = </strong>{inp('c1ans', 60)} cm</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Calcul de {f2}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 2.6, color: 'var(--text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>{inpFr('c2a', 'c2b')} = {inpFr('c2c', 'c2d')}</div>
            <div>{f2} = {inp('c2e', 48)} × {inp('c2f', 48)} ÷ {inp('c2g', 48)}</div>
            <div><strong>Donc {f2} = </strong>{inp('c2ans', 60)} cm</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction complète
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ lineHeight: 1.8, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>
            Dans le triangle <strong>{cfg.bigTri}</strong>, {cfg.ptOnLeft.pt} ∈ {cfg.ptOnLeft.seg} et {cfg.ptOnRight.pt} ∈ {cfg.ptOnRight.seg} et ({cfg.parallelSeg}) // ({cfg.parallelTo}).
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>D'après le théorème de Thalès :</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--c4)', marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: cfg.ratioExpr }} />
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--text)', marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: `soit &nbsp;${cfg.numericRatio}` }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {corrBlock(cfg.calc1)}
            {corrBlock(cfg.calc2)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <button className="btn-primary" disabled={disabled} onClick={handleSubmit}>
          Vérifier {f1} et {f2}
        </button>
        <div className={finalFb.cls}>{finalFb.text}</div>
      </div>
    </div>
  );
}
