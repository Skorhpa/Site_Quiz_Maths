import { useState, type KeyboardEvent } from 'react';
import type { PythagoreCompleterExercise, PythagoreExercise, PythagoreRegularExercise } from '@/types';
import { pythFormatAns, pythIsWhole } from '@/lib/generators/pythagore';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface PythagoreQuestionProps {
  index: number;
  exercise: PythagoreExercise;
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

export function PythagoreQuestion(props: PythagoreQuestionProps) {
  if (props.exercise.pythType === 'completer') {
    return <PythagoreCompleter {...props} exercise={props.exercise} />;
  }
  return <PythagoreRegular {...props} exercise={props.exercise} />;
}

// ─── Regular (figure or text + single answer) ─────────────────────────────
function PythagoreRegular({
  index,
  exercise,
  answer,
  onChange,
  onSubmit,
}: PythagoreQuestionProps & { exercise: PythagoreRegularExercise }) {
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled) return;
    const v = parseFloat(answer.value.replace(',', '.'));
    if (Number.isNaN(v)) return;
    const tol = pythIsWhole(exercise.ans) ? 0.001 : 0.06;
    onSubmit(Math.abs(v - exercise.ans) < tol);
  };
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong')
      return { text: `✗ Réponse : ${pythFormatAns(exercise.ans, exercise.unit)}`, cls: 'feedback ko' };
    if (answer.status === 'revealed')
      return { text: `Réponse : ${pythFormatAns(exercise.ans, exercise.unit)}`, cls: 'feedback ko' };
    return { text: '', cls: 'feedback' };
  })();

  const givenLines = exercise.given.split('\n').map((line, j, arr) => {
    const isLast = j === arr.length - 1;
    const parts = line.split('=');
    const sym = isLast && exercise.decimal ? '≈' : '=';
    return (
      <span key={j}>
        <span style={{ color: 'var(--muted)' }}>{parts[0]}{sym}</span>
        <span>{parts[1]}</span>
        {j < arr.length - 1 && <br />}
      </span>
    );
  });

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext" dangerouslySetInnerHTML={{ __html: exercise.text }} />
      </div>
      <div className="qbody">
        {exercise.figure && (
          <div className="figure-wrap" dangerouslySetInnerHTML={{ __html: exercise.figure }} />
        )}
        <div className="qinfo">
          <div className="given-vals">{givenLines}</div>
          <button
            type="button"
            className="hint-toggle"
            onClick={() => setHintOpen((v) => !v)}
          >
            <span>{hintOpen ? '▼' : '▶'}</span> Voir la solution
          </button>
          <div className={`steps-box${hintOpen ? ' open' : ''}`}>
            {exercise.steps.map((s, j) => (
              <div key={j}>
                <span className="step-eq">{s.eq}</span>
              </div>
            ))}
            {exercise.corrFig && (
              <div
                style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}
                dangerouslySetInnerHTML={{ __html: exercise.corrFig }}
              />
            )}
          </div>
          <div className="answer-row">
            <span className="answer-label">
              {exercise.askLabel} {exercise.decimal ? '≈' : '='}
            </span>
            <input
              type="number"
              step="0.1"
              placeholder="?"
              value={answer.value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKey}
            />
            <span className="unit">{exercise.unit}</span>
            <button className="btn-secondary" disabled={disabled} onClick={handleSubmit}>
              OK
            </button>
          </div>
          <div className={feedback.cls}>{feedback.text}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Completer (text-with-blanks + final numeric answer) ──────────────────
function PythagoreCompleter({
  index,
  exercise,
  answer,
  onSubmit,
}: PythagoreQuestionProps & { exercise: PythagoreCompleterExercise }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ text: string; cls: string }>({ text: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  const cfg = exercise.cfg;
  const eqSym = cfg.decimal ? '≈' : '=';
  const approxNote = cfg.decimal ? ' (arrondir au dixième)' : '';

  const set = (id: string, v: string) => setFields((s) => ({ ...s, [id]: v }));
  const get = (id: string) => fields[id] ?? '';

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
    const required = ['t1', 't2', 't3', 'thm', 'f1', 'f2', 'f3', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'ans'];
    if (cfg.find === 'hyp') required.push('n9');
    const anyEmpty = required.some((id) => get(id).trim() === '');
    if (anyEmpty) {
      setFeedback({ text: '✗ Certains champs ne sont pas remplis.', cls: 'feedback ko' });
      onSubmit(false);
      return;
    }
    const hypVal = get('t3');
    if (!hypVal.includes('[') || !hypVal.includes(']')) {
      setFeedback({ text: "✗ L'hypoténuse doit être écrite entre crochets, ex : [AB]", cls: 'feedback ko' });
      onSubmit(false);
      return;
    }
    const v = parseFloat(get('ans').replace(',', '.'));
    const tol = pythIsWhole(cfg.ans) ? 0.001 : 0.06;
    const ok = !Number.isNaN(v) && Math.abs(v - cfg.ans) < tol;
    if (ok) {
      setFeedback({
        text: `✓ Correct ! ${cfg.unknownLeg ?? cfg.hyp} ${cfg.decimal ? '≈' : '='} ${cfg.ans} cm`,
        cls: 'feedback ok',
      });
    } else {
      setFeedback({ text: `✗ Réponse finale : ${cfg.unknownLeg ?? cfg.hyp} = ${cfg.ans} cm`, cls: 'feedback ko' });
    }
    onSubmit(ok);
  };

  const finalFb = (() => {
    if (answer.status === 'revealed') return { text: `Réponse : ${cfg.ans} cm`, cls: 'feedback ko' };
    return feedback;
  })();

  const corrBlock = cfg.find === 'hyp' ? (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 2.4, color: 'var(--muted)' }}>
      <div>Le triangle <span style={{ color: 'var(--correct)' }}>{cfg.tri}</span> est rectangle en <span style={{ color: 'var(--correct)' }}>{cfg.rightAt}</span> d'hypoténuse <span style={{ color: 'var(--correct)' }}>{cfg.hyp}</span>,</div>
      <div>d'après le <span style={{ color: 'var(--correct)' }}>théorème de Pythagore</span> on a :</div>
      <div style={{ color: 'var(--c2)' }}>{cfg.hyp}² = {cfg.leg1}² + {cfg.leg2}²</div>
      <div>Donc &nbsp;{cfg.hyp}² = {cfg.v1}² + {cfg.v2}²</div>
      <div>Donc &nbsp;{cfg.hyp}² = {cfg.sq1} + {cfg.sq2}</div>
      <div>Donc &nbsp;{cfg.hyp}² = {cfg.sqSum}</div>
      <div style={{ color: 'var(--correct)', fontWeight: 700 }}>Donc &nbsp;{cfg.hyp} {eqSym} √{cfg.sqSum} {eqSym} {cfg.ans} cm</div>
    </div>
  ) : (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 2.4, color: 'var(--muted)' }}>
      <div>Le triangle <span style={{ color: 'var(--correct)' }}>{cfg.tri}</span> est rectangle en <span style={{ color: 'var(--correct)' }}>{cfg.rightAt}</span> d'hypoténuse <span style={{ color: 'var(--correct)' }}>{cfg.hyp}</span>,</div>
      <div>d'après le <span style={{ color: 'var(--correct)' }}>théorème de Pythagore</span> on a :</div>
      <div style={{ color: 'var(--c2)' }}>{cfg.hyp}² = {cfg.leg1}² + {cfg.leg2}²</div>
      <div>Donc &nbsp;{cfg.givenHyp}² = {cfg.unknownLeg}² + {cfg.givenLeg}²</div>
      <div>Donc &nbsp;{cfg.unknownLeg}² = {cfg.givenHyp}² − {cfg.givenLeg}²</div>
      <div>Donc &nbsp;{cfg.unknownLeg}² = {cfg.sq1} − {cfg.sq2}</div>
      <div>Donc &nbsp;{cfg.unknownLeg}² = {cfg.sqDiff}</div>
      <div style={{ color: 'var(--correct)', fontWeight: 700 }}>Donc &nbsp;{cfg.unknownLeg} {eqSym} √{cfg.sqDiff} {eqSym} {cfg.ans} cm</div>
    </div>
  );

  const problemText = cfg.find === 'hyp'
    ? `Dans le triangle <strong>${cfg.tri}</strong> rectangle en <strong>${cfg.rightAt}</strong>, ${cfg.leg1} = <strong>${cfg.v1} cm</strong> et ${cfg.leg2} = <strong>${cfg.v2} cm</strong>. Calcule ${cfg.hyp}${cfg.decimal ? ' (arrondi au dixième)' : ''}.`
    : `Dans le triangle <strong>${cfg.tri}</strong> rectangle en <strong>${cfg.rightAt}</strong>, ${cfg.hyp} = <strong>${cfg.givenHyp} cm</strong> et ${cfg.unknownLeg === cfg.leg1 ? cfg.leg2 : cfg.leg1} = <strong>${cfg.givenLeg} cm</strong>. Calcule ${cfg.unknownLeg}${cfg.decimal ? ' (arrondi au dixième)' : ''}.`;

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext" dangerouslySetInnerHTML={{ __html: problemText }} />
      </div>
      <div className="qbody" style={{ alignItems: 'flex-start', gap: '1.5rem' }}>
        <div className="figure-wrap" dangerouslySetInnerHTML={{ __html: exercise.fig }} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13, lineHeight: 2.8, color: 'var(--text)' }}>
            Le triangle {inp('t1', 48)} est rectangle en {inp('t2', 40)} d'hypoténuse {inp('t3', 48)},<br />
            d'après le {inp('thm', 180)} on a :<br />
            <span style={{ fontFamily: "'DM Mono', monospace" }}>
              {inp('f1', 48)}² = {inp('f2', 48)}² + {inp('f3', 48)}²
            </span>
            <br />
            {cfg.find === 'hyp' ? (
              <>
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n1', 48)}² = {inp('n2', 48)}² + {inp('n3', 48)}²</span><br />
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n4', 48)}² = {inp('n5', 55)} + {inp('n6', 55)}</span><br />
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n7', 48)}² = {inp('n8', 55)}</span><br />
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n9', 48)} {eqSym} {inp('ans', 65)} cm</span>
                {cfg.decimal && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{approxNote}</span>}
              </>
            ) : (
              <>
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{cfg.givenHyp}² = {inp('n1', 48)}² + {cfg.givenLeg}²</span><br />
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n2', 48)}² = {cfg.givenHyp}² − {cfg.givenLeg}²</span><br />
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n3', 48)}² = {inp('n4', 55)} − {inp('n5', 55)}</span><br />
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n6', 48)}² = {inp('n7', 55)}</span><br />
                Donc <span style={{ fontFamily: "'DM Mono', monospace" }}>{inp('n8', 48)} {eqSym} {inp('ans', 65)} cm</span>
                {cfg.decimal && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{approxNote}</span>}
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ lineHeight: 1.8, padding: '14px 16px' }}>
          {corrBlock}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <button className="btn-primary" disabled={disabled} onClick={handleSubmit}>
          Vérifier
        </button>
        <div className={finalFb.cls}>{finalFb.text}</div>
      </div>
    </div>
  );
}
