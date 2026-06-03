import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { ProbaVocabExercise, ProbaGroupExercise, ProbaSubQuestion, ProbaCountQuestion } from '@/types';
import { frEqual, frIsSimplified, frSimplify } from '@/lib/generators/fractions';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

// ── Vocabulary card ───────────────────────────────────────────────────────

const bar = (s: string) => `<span style="text-decoration:overline">${s}</span>`;

const VOCAB_DEFS = [
  { term: 'Expérience aléatoire', def: "Expérience dont on ne peut pas prévoir le résultat à l'avance (ex : lancer un dé)." },
  { term: 'Issue', def: "Chacun des résultats possibles d'une expérience aléatoire." },
  { term: 'Événement', def: "Ensemble d'issues. Il est réalisé si l'une de ses issues est obtenue. On le note en général par une <strong>lettre majuscule</strong> (A, B, C…)." },
  { term: 'Événement contraire', def: `Si A est un événement, son contraire (noté ${bar('A')}) regroupe toutes les issues où A ne se réalise pas. On a toujours : P(${bar('A')}) = 1 − P(A).` },
  { term: 'Probabilité', def: "Nombre compris entre 0 et 1 mesurant les chances qu'un événement se réalise." },
  { term: 'Équiprobabilité', def: "Situation où toutes les issues ont la même probabilité (ex : dé équilibré, tirage au sort)." },
];

function ProbaVocabCard({ answer, onSubmit }: { answer: AnswerState; onSubmit: (ok: boolean) => void }) {
  useEffect(() => {
    if (answer.status === 'pending') onSubmit(true);
  }, []);

  return (
    <div className={`qcard${answer.status === 'correct' ? ' correct-card' : ''}`} style={{ gridColumn: '1 / -1' }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>Rappel du vocabulaire</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {VOCAB_DEFS.map((v) => (
          <div key={v.term} style={{ fontSize: 14, lineHeight: 1.7 }}>
            <strong>{v.term}</strong>{' '}: <span dangerouslySetInnerHTML={{ __html: v.def }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Group card (optional count question + 3 sub-questions) ───────────────────

interface SubState {
  num: string;
  den: string;
  yesNo: boolean | null;
  status: 'pending' | 'correct' | 'wrong';
  feedback: string;
  hintOpen: boolean;
}

interface CountState {
  val: string;
  status: 'pending' | 'correct' | 'wrong';
  hintOpen: boolean;
}

const inpStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
  padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--bg)', color: 'var(--text)', textAlign: 'center', width: 50,
};

const borderFor = (st: 'pending' | 'correct' | 'wrong') => {
  if (st === 'correct') return '1px solid var(--correct)';
  if (st === 'wrong') return '1px solid var(--wrong)';
  return '1px solid var(--border)';
};

function ProbaGroupCard({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: ProbaGroupExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const hasCount = !!exercise.countQuestion;
  const [countState, setCountState] = useState<CountState>({ val: '', status: 'pending', hintOpen: false });
  const [subs, setSubs] = useState<SubState[]>(
    exercise.subquestions.map(() => ({ num: '', den: '', yesNo: null, status: 'pending', feedback: '', hintOpen: false }))
  );
  const cardDisabled = answer.status !== 'pending';
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current || answer.status !== 'pending') return;
    const subsDone = subs.every((s) => s.status !== 'pending');
    const countDone = !hasCount || countState.status !== 'pending';
    if (subsDone && countDone) {
      submitted.current = true;
      onSubmit(subs.every((s) => s.status === 'correct') && (!hasCount || countState.status === 'correct'));
    }
  }, [subs, countState]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (answer.status === 'revealed') {
      setSubs((prev) => prev.map((s) => ({ ...s, hintOpen: true, status: s.status === 'pending' ? 'wrong' : s.status })));
      if (hasCount) setCountState((prev) => ({ ...prev, hintOpen: true, status: prev.status === 'pending' ? 'wrong' : prev.status }));
    }
  }, [answer.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateCount = () => {
    if (cardDisabled || !exercise.countQuestion || countState.status !== 'pending') return;
    const v = parseInt(countState.val.trim(), 10);
    if (Number.isNaN(v) || countState.val.trim() === '') return;
    const ok = v === exercise.countQuestion.ans;
    setCountState({ ...countState, status: ok ? 'correct' : 'wrong', hintOpen: !ok });
  };

  const validateYesNo = (i: number, choice: boolean) => {
    if (cardDisabled || subs[i]!.status !== 'pending') return;
    const sq = exercise.subquestions[i]!;
    if (!sq.isYesNo || sq.ansYesNo === undefined) return;
    const ok = choice === sq.ansYesNo;
    setSubs((prev) => prev.map((s, idx) => idx === i
      ? { ...s, yesNo: choice, status: ok ? 'correct' : 'wrong', feedback: ok ? '✓ Correct !' : '✗ Incorrect.', hintOpen: !ok }
      : s
    ));
  };

  const validate = (i: number) => {
    if (cardDisabled || subs[i]!.status !== 'pending') return;
    const sq: ProbaSubQuestion = exercise.subquestions[i]!;
    if (sq.isYesNo) return;
    const vn = parseInt(subs[i]!.num, 10);
    if (Number.isNaN(vn) || subs[i]!.num.trim() === '') return;
    const vd = parseInt(subs[i]!.den || '1', 10);
    const effD = Number.isNaN(vd) || vd === 0 ? 1 : vd;
    const ok = frEqual(vn, effD, sq.ans.n, sq.ans.d);
    let feedback = '';
    if (ok) {
      if (!frIsSimplified(vn, effD)) {
        const s = frSimplify(vn, effD);
        feedback = `✓ Correct — pense à simplifier : ${s.n}/${s.d}`;
      } else {
        feedback = '✓ Correct !';
      }
    } else {
      feedback = '✗ Incorrect.';
    }
    setSubs((prev) => prev.map((s, idx) =>
      idx === i ? { ...s, status: ok ? ('correct' as const) : ('wrong' as const), feedback } : s
    ));
  };

  const setField = (i: number, field: 'num' | 'den', val: string) =>
    setSubs((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const toggleHint = (i: number) =>
    setSubs((prev) => prev.map((s, idx) => idx === i ? { ...s, hintOpen: !s.hintOpen } : s));

  const cq: ProbaCountQuestion | undefined = exercise.countQuestion;

  return (
    <div className={`qcard${answer.status === 'correct' ? ' correct-card' : answer.status === 'wrong' ? ' wrong-card' : ''}`}
      style={{ gridColumn: '1 / -1', borderLeft: `3px solid ${accent}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: '0.8rem' }}>{exercise.groupTitle}</div>
      <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px', marginBottom: '1.2rem', fontSize: 14, lineHeight: 1.9 }}
        dangerouslySetInnerHTML={{ __html: exercise.context }} />

      {cq && (
        <div style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: 10, border: borderFor(countState.status), background: 'var(--surface)' }}>
          <div style={{ fontSize: 14, marginBottom: 10 }}>{cq.question}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input type="text" value={countState.val} placeholder="…"
              disabled={cardDisabled || countState.status !== 'pending'}
              onChange={(e) => setCountState((prev) => ({ ...prev, val: e.target.value }))}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') validateCount(); }}
              style={{ ...inpStyle, width: 80 }}
            />
            {!cardDisabled && countState.status === 'pending' && (
              <button className="btn-secondary" onClick={validateCount} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>OK</button>
            )}
            {countState.status !== 'pending' && (
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: countState.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                {countState.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
              </span>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="button" className="hint-toggle" onClick={() => setCountState((p) => ({ ...p, hintOpen: !p.hintOpen }))}>
              <span>{countState.hintOpen ? '▼' : '▶'}</span> Voir la correction
            </button>
            <div className={`steps-box${countState.hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}>
              <div dangerouslySetInnerHTML={{ __html: cq.steps }} />
            </div>
          </div>
        </div>
      )}

      {exercise.subquestions.map((sq, i) => {
        const s = subs[i]!;
        const subDisabled = cardDisabled || s.status !== 'pending';
        return (
          <div key={i} style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: 10, border: borderFor(s.status), background: 'var(--surface)' }}>
            {sq.eventDesc && !sq.isYesNo && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}
                dangerouslySetInnerHTML={{ __html: `Événement <strong style="color:${accent}">${sq.eventLabel}</strong> : « ${sq.eventDesc} »` }}
              />
            )}
            <div style={{ fontSize: 14, marginBottom: 10 }}>{sq.question}</div>

            {sq.isYesNo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {([true, false] as const).map((choice) => {
                  const label = choice ? 'Oui' : 'Non';
                  const isSelected = s.yesNo === choice;
                  const done = s.status !== 'pending';
                  const btnColor = isSelected && done
                    ? (s.status === 'correct' ? 'var(--correct)' : 'var(--wrong)')
                    : undefined;
                  return (
                    <button key={label} disabled={subDisabled}
                      onClick={() => validateYesNo(i, choice)}
                      style={{
                        padding: '6px 22px', fontSize: 14, borderRadius: 8, cursor: done ? 'default' : 'pointer',
                        border: `1px solid ${btnColor ?? 'var(--border2)'}`,
                        background: isSelected && done ? btnColor : 'var(--surface2)',
                        color: isSelected && done ? 'white' : 'var(--text)',
                        fontWeight: isSelected ? 700 : 400,
                      }}
                    >{label}</button>
                  );
                })}
                {s.status !== 'pending' && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: s.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                    {s.feedback}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}
                  dangerouslySetInnerHTML={{ __html: `P(${sq.eventLabel}) =` }}
                />
                <span className="frac-inp">
                  <input type="text" value={s.num} placeholder="…" disabled={subDisabled}
                    onChange={(e) => setField(i, 'num', e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') validate(i); }}
                    style={inpStyle} />
                  <div className="frac-line" style={{ width: 50 }} />
                  <input type="text" value={s.den} placeholder="…" disabled={subDisabled}
                    onChange={(e) => setField(i, 'den', e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') validate(i); }}
                    style={inpStyle} />
                </span>
                {!subDisabled && (
                  <button className="btn-secondary" onClick={() => validate(i)} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>OK</button>
                )}
                {s.status !== 'pending' && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: s.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                    {s.feedback}
                  </span>
                )}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <button type="button" className="hint-toggle" onClick={() => toggleHint(i)}>
                <span>{s.hintOpen ? '▼' : '▶'}</span> Voir la correction
              </button>
              <div className={`steps-box${s.hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}>
                <div dangerouslySetInnerHTML={{ __html: sq.steps }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────

export function ProbaQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: ProbaVocabExercise | ProbaGroupExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  if (exercise.exKind === 'proba-vocab') {
    return <ProbaVocabCard answer={answer} onSubmit={onSubmit} />;
  }
  return <ProbaGroupCard index={index} exercise={exercise as ProbaGroupExercise} answer={answer} accent={accent} onSubmit={onSubmit} />;
}
