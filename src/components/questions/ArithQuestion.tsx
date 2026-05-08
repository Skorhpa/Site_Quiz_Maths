import { useState, type KeyboardEvent } from 'react';
import type { ArithExercise } from '@/types';
import { factStr, factorsEqual, normList } from '@/lib/generators/arith';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface ArithQuestionProps {
  index: number;
  exercise: ArithExercise;
  answer: AnswerState;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

const ACCENT = '#FB7185'; // var(--car)

export function ArithQuestion({ index, exercise, answer, onSubmit }: ArithQuestionProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const [singleInput, setSingleInput] = useState('');
  const [criteriaAns, setCriteriaAns] = useState<Record<number, 'O' | 'N' | undefined>>({});
  const [decompoInputs, setDecompoInputs] = useState<Record<number, string>>({});
  const [pgcdPa, setPgcdPa] = useState('');
  const [pgcdPb, setPgcdPb] = useState('');
  const [pgcdPc, setPgcdPc] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; cls: string }>({ text: '', cls: 'feedback' });

  const disabled = answer.status !== 'pending';

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `${exercise.color}22`,
    color: exercise.color,
  };

  const inputStyle: React.CSSProperties = { borderColor: exercise.color };

  const handleSubmit = () => {
    if (disabled) return;
    let ok = false;
    let msg = '';

    if (exercise.subtype === 'divisors') {
      const v = normList(singleInput);
      const expected = exercise.divs!.slice().sort((a, b) => a - b);
      ok = v.length === expected.length && v.every((x, j) => x === expected[j]);
      if (!ok) msg = `✗ Diviseurs de ${exercise.n} : ${exercise.divs!.join(' ; ')}`;
    } else if (exercise.subtype === 'multiples') {
      const v = normList(singleInput);
      const expected = exercise.mults!.slice().sort((a, b) => a - b);
      ok = v.length === expected.length && v.every((x, j) => x === expected[j]);
      if (!ok) msg = `✗ Multiples de ${exercise.k} entre ${exercise.low} et ${exercise.high} : ${exercise.mults!.join(' ; ')}`;
    } else if (exercise.subtype === 'spotnonprime') {
      const v = normList(singleInput);
      const expected = exercise.nonPrimes!.slice().sort((a, b) => a - b);
      ok = v.length === expected.length && v.every((x, j) => x === expected[j]);
      if (!ok) msg = `✗ Réponse : ${exercise.nonPrimes!.join(' ; ')}`;
    } else if (exercise.subtype === 'criteria') {
      const expected = [
        exercise.by2 ? 'O' : 'N',
        exercise.by3 ? 'O' : 'N',
        exercise.by5 ? 'O' : 'N',
        exercise.by9 ? 'O' : 'N',
        exercise.by10 ? 'O' : 'N',
      ];
      const labels = ['2', '3', '5', '9', '10'];
      ok = expected.every((e, j) => criteriaAns[j] === e);
      if (!ok) {
        const wrong = labels.filter((_, j) => criteriaAns[j] !== expected[j]);
        msg = `✗ Erreur pour ÷ ${wrong.join(', ÷ ')}`;
      }
    } else if (exercise.subtype === 'decompo') {
      const results = exercise.nums!.map(({ n, factors }, j) => {
        const v = (decompoInputs[j] || '').trim();
        return { n, ok: factorsEqual(v, factStr(factors)), expected: factStr(factors) };
      });
      ok = results.every((r) => r.ok);
      if (!ok) {
        const wrong = results.filter((r) => !r.ok).map((r) => `${r.n} = ${r.expected}`);
        msg = `✗ Correction : ${wrong.join(' · ')}`;
      }
    } else if (exercise.subtype === 'pgcd') {
      const okA = factorsEqual(pgcdPa, exercise.fnN!);
      const okB = factorsEqual(pgcdPb, exercise.fnM!);
      const mentioned = exercise.gDivs!.filter((d) => pgcdPc.includes(String(d)));
      const pcOk = mentioned.length === exercise.gDivs!.length;
      ok = okA && okB && pcOk;
      if (!ok) {
        const parts: string[] = [];
        if (!okA) parts.push(`décomposition de ${exercise.N} (attendu : ${exercise.fnN})`);
        if (!okB) parts.push(`décomposition de ${exercise.M} (attendu : ${exercise.fnM})`);
        if (!pcOk) parts.push(`il manque certaines compositions (${exercise.gDivs!.length} au total)`);
        msg = `✗ ${parts.join(' · ')}`;
      }
    }

    setFeedback(ok ? { text: '✓ Correct !', cls: 'feedback ok' } : { text: msg, cls: 'feedback ko' });
    onSubmit(ok);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const renderBody = () => {
    if (exercise.subtype === 'divisors' || exercise.subtype === 'multiples' || exercise.subtype === 'spotnonprime') {
      return (
        <>
          <div
            style={{ fontSize: 14, lineHeight: exercise.subtype === 'spotnonprime' ? 1.9 : 1.8, color: 'var(--text)', marginBottom: 8 }}
            dangerouslySetInnerHTML={{ __html: exercise.question! }}
          />
          <input
            type="text"
            className="lit-inp"
            value={singleInput}
            placeholder={exercise.placeholder}
            autoComplete="off"
            disabled={disabled}
            onChange={(e) => setSingleInput(e.target.value)}
            onKeyDown={handleKey}
            style={inputStyle}
          />
        </>
      );
    }
    if (exercise.subtype === 'criteria') {
      return (
        <>
          <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>
            Le nombre <strong>{exercise.n}</strong> est-il divisible par :
          </div>
          <table style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {['2', '3', '5', '9', '10'].map((x, j) => (
                <tr key={x} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>÷ {x}</td>
                  <td style={{ padding: 8, display: 'flex', gap: 10 }}>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`cr${index}d${j}`}
                        value="O"
                        checked={criteriaAns[j] === 'O'}
                        disabled={disabled}
                        onChange={() => setCriteriaAns((s) => ({ ...s, [j]: 'O' }))}
                      />{' '}
                      &nbsp;Oui
                    </label>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`cr${index}d${j}`}
                        value="N"
                        checked={criteriaAns[j] === 'N'}
                        disabled={disabled}
                        onChange={() => setCriteriaAns((s) => ({ ...s, [j]: 'N' }))}
                      />{' '}
                      &nbsp;Non
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    if (exercise.subtype === 'decompo') {
      return (
        <>
          <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>{exercise.question}</div>
          {exercise.nums!.map(({ n }, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.2rem', fontWeight: 700, minWidth: 40 }}>{n} =</span>
              <input
                type="text"
                value={decompoInputs[j] || ''}
                placeholder="… × … × …"
                disabled={disabled}
                onChange={(e) => setDecompoInputs((s) => ({ ...s, [j]: e.target.value }))}
                onKeyDown={handleKey}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border2)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  width: 160,
                }}
              />
            </div>
          ))}
        </>
      );
    }
    // pgcd
    return (
      <>
        <div
          style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text)', marginBottom: 10 }}
          dangerouslySetInnerHTML={{ __html: exercise.question! }}
        />
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
          a) Décompose {exercise.N} et {exercise.M} en facteurs premiers :
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace" }}>{exercise.N} = </span>
            <input
              type="text"
              value={pgcdPa}
              placeholder="… × …"
              disabled={disabled}
              onChange={(e) => setPgcdPa(e.target.value)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                padding: '5px 10px',
                borderRadius: 7,
                border: '1px solid var(--border2)',
                background: 'var(--bg)',
                color: 'var(--text)',
                width: 130,
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace" }}>{exercise.M} = </span>
            <input
              type="text"
              value={pgcdPb}
              placeholder="… × …"
              disabled={disabled}
              onChange={(e) => setPgcdPb(e.target.value)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                padding: '5px 10px',
                borderRadius: 7,
                border: '1px solid var(--border2)',
                background: 'var(--bg)',
                color: 'var(--text)',
                width: 130,
              }}
            />
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
          b) Donne toutes les compositions possibles :
        </div>
        <textarea
          rows={3}
          value={pgcdPc}
          placeholder={
            exercise.gDivs!.length > 1
              ? exercise
                  .gDivs!.map(
                    (d) =>
                      `${d} ${exercise.unitLabel}${d > 1 ? 's' : ''} : ${exercise.N! / d} ${exercise.ctx!.obj1} et ${
                        exercise.M! / d
                      } ${exercise.ctx!.obj2}`,
                  )
                  .slice(0, 2)
                  .join(' / ')
              : ''
          }
          disabled={disabled}
          onChange={(e) => setPgcdPc(e.target.value)}
          style={{
            width: '100%',
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--border2)',
            background: 'var(--bg)',
            color: 'var(--text)',
            resize: 'vertical',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          Indice : il y a <strong>{exercise.gDivs!.length}</strong> composition
          {exercise.gDivs!.length > 1 ? 's' : ''} possible{exercise.gDivs!.length > 1 ? 's' : ''}.
        </div>
      </>
    );
  };

  const finalFeedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') return feedback;
    if (answer.status === 'revealed') {
      let text = 'Voir la correction ci-dessous.';
      if (exercise.subtype === 'divisors') text = `Réponse : ${exercise.divs!.join(' ; ')}`;
      else if (exercise.subtype === 'multiples') text = `Réponse : ${exercise.mults!.join(' ; ')}`;
      else if (exercise.subtype === 'decompo')
        text = `Réponse : ${exercise.nums!.map(({ n, factors }) => `${n}=${factStr(factors)}`).join(' · ')}`;
      return { text, cls: 'feedback ko' };
    }
    return { text: '', cls: 'feedback' };
  })();

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${exercise.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{exercise.label}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      {renderBody()}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={handleSubmit}
          style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}
        >
          Vérifier
        </button>
      </div>
      <div className={finalFeedback.cls} style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }}>
        {finalFeedback.text}
      </div>
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          className="hint-toggle"
          onClick={() => setHintOpen((v) => !v)}
          style={{ color: ACCENT }}
        >
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
