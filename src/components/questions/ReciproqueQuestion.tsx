import { useState } from 'react';
import type { ReciproqueDemoExercise, ReciproqueExercise, ReciproqueTableExercise } from '@/types';

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
  return <ReciproqueDemo {...props} exercise={props.exercise} />;
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
