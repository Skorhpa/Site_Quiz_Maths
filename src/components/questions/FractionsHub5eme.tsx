import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { FractionExercise, FractionsCompExercise, MDCExercise } from '@/types';
import { frEqual, frIsSimplified, frSimplify } from '@/lib/generators/fractions';
import {
  type Equiv3Exercise, type CompleteEquivExercise,
  type RangementExercise, type MulEntierExercise, type Frac5emeExercise,
  generate5emeMDCSeries, generate5emeAddSeries, generate5emeSubSeries,
  generate5emeComplexSeries, generate5emeMulEntierSeries,
  generate5emeCompSeries, generate5emeSimplSeries, generate5emeProblemsSeries,
  makeAddAtPos, makeSubAtPos,
} from '@/lib/generators/fractions-5eme';
import { MDCQuestion, ModeCard } from './FractionsHub';
import { FractionQuestion } from './FractionQuestion';
import { FractionsCompQuestion } from './FractionsCompQuestion';

// ── Types & helpers ────────────────────────────────────────────────────────

type HubMode = 'mdc' | 'calculs' | 'comp' | 'simpl' | 'problemes';
type CalcSubMode = 'add' | 'sub' | 'mul' | 'complex';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });
const buildAnswers = (n: number): AnswerState[] => Array.from({ length: n }, emptyAnswer);

function endTitle(pct: number) {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '', correct: 'correct-card', wrong: 'wrong-card', revealed: 'wrong-card',
};

const inpStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
  padding: '4px 6px', borderRadius: 6,
  border: '1px solid var(--border2)', background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
};

function tag(label: string, accent: string) {
  return { fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent };
}

// ── Equiv3Question ────────────────────────────────────────────────────────

function Equiv3Question({ index, exercise, answer, accent, onSubmit }: {
  index: number; exercise: Equiv3Exercise; answer: AnswerState; accent: string; onSubmit: (ok: boolean) => void;
}) {
  const [inputs, setInputs] = useState<[string, string][]>([['',''],['',''],['','']]);
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState({ html: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  useEffect(() => { if (answer.status === 'revealed') setHintOpen(true); }, [answer.status]);

  const set = (i: number, j: 0|1, v: string) =>
    setInputs((p) => p.map((pair, idx) => idx === i ? (j === 0 ? [v, pair[1]] : [pair[0], v]) : pair) as [string,string][]);

  const handleSubmit = () => {
    if (disabled) return;
    const errs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const vn = parseInt(inputs[i]![0], 10), vd = parseInt(inputs[i]![1], 10);
      if (Number.isNaN(vn) || Number.isNaN(vd) || vd <= 0) { errs.push(`Fraction ${i+1} incomplète`); continue; }
      if (!frEqual(vn, vd, exercise.frac.n, exercise.frac.d)) errs.push(`Fraction ${i+1} incorrecte`);
    }
    const ok = errs.length === 0;
    setFeedback(ok ? { html: '✓ Correct !', cls: 'feedback ok' } : { html: `✗ ${errs.join(', ')}.`, cls: 'feedback ko' });
    onSubmit(ok);
  };

  const fb = answer.status === 'revealed' ? { html: '✗ Voir la correction ci-dessous.', cls: 'feedback ko' } : feedback;
  const fracHtml = (n: number) => `<span class="frac"><span class="fn">${exercise.frac.n}</span><span class="fd">${exercise.frac.d}</span></span>`; void fracHtml;

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tag('Fractions égales', accent)}>Fractions égales</span>
        <span className="qnum">Q{String(index+1).padStart(2,'0')}</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 10 }}>Donne 3 fractions égales à :</div>
      <div style={{ fontSize: '1.6rem', marginBottom: 14 }}
        dangerouslySetInnerHTML={{ __html: `<span class="frac"><span class="fn">${exercise.frac.n}</span><span class="fd">${exercise.frac.d}</span></span>` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
        {inputs.map((pair, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span style={{ color: 'var(--muted)', fontWeight: 600 }}>=</span>}
            <span className="frac-inp">
              <input type="text" value={pair[0]} placeholder="…" disabled={disabled}
                onChange={(e) => set(i, 0, e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSubmit(); }}
                style={{ ...inpStyle, width: 46 }} />
              <div className="frac-line" style={{ width: 46 }} />
              <input type="text" value={pair[1]} placeholder="…" disabled={disabled}
                onChange={(e) => set(i, 1, e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSubmit(); }}
                style={{ ...inpStyle, width: 46 }} />
            </span>
          </div>
        ))}
      </div>
      <button className="btn-secondary" disabled={disabled} onClick={handleSubmit} style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}>OK</button>
      <div className={fb.cls} style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }} dangerouslySetInnerHTML={{ __html: fb.html }} />
      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen(v => !v)}><span>{hintOpen ? '▼' : '▶'}</span> Voir la correction</button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}><div dangerouslySetInnerHTML={{ __html: exercise.steps }} /></div>
      </div>
    </div>
  );
}

// ── CompleteEquivQuestion ─────────────────────────────────────────────────

function CompleteEquivQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number; exercise: CompleteEquivExercise; answer: AnswerState; accent: string; onSubmit: (ok: boolean) => void;
}) {
  const [val, setVal] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState({ html: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  useEffect(() => { if (answer.status === 'revealed') setHintOpen(true); }, [answer.status]);

  const handleSubmit = () => {
    if (disabled) return;
    const v = parseInt(val, 10);
    if (Number.isNaN(v)) return;
    const ok = v === exercise.answer;
    setFeedback(ok ? { html: '✓ Correct !', cls: 'feedback ok' } : { html: `✗ La bonne réponse est <strong>${exercise.answer}</strong>.`, cls: 'feedback ko' });
    onSubmit(ok);
  };

  const fb = answer.status === 'revealed' ? { html: `✗ Réponse : <strong>${exercise.answer}</strong>. Voir la correction.`, cls: 'feedback ko' } : feedback;
  const fracHtml = (n: number|string, d: number|string) => `<span class="frac"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;
  const leftHtml = fracHtml(exercise.frac.n, exercise.frac.d);
  const fixedSpan = (v: number) => `<span style="font-family:'DM Mono',monospace;font-size:13px;font-weight:700;padding:4px 6px;display:inline-block;min-width:36px;text-align:center;">${v}</span>`;

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tag("Complète l'égalité", accent)}>{"Complète l'égalité"}</span>
        <span className="qnum">Q{String(index+1).padStart(2,'0')}</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>Complète :</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12, fontSize: '1.3rem' }}>
        <span dangerouslySetInnerHTML={{ __html: leftHtml }} />
        <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>=</span>
        <span className="frac-inp">
          {exercise.unknownIsNum ? (
            <>
              <input type="text" value={val} placeholder="…" disabled={disabled}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSubmit(); }}
                style={{ ...inpStyle, width: 50 }} />
              <div className="frac-line" style={{ width: 50 }} />
              <span dangerouslySetInnerHTML={{ __html: fixedSpan(exercise.targetKnown) }} />
            </>
          ) : (
            <>
              <span dangerouslySetInnerHTML={{ __html: fixedSpan(exercise.targetKnown) }} />
              <div className="frac-line" style={{ width: 50 }} />
              <input type="text" value={val} placeholder="…" disabled={disabled}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSubmit(); }}
                style={{ ...inpStyle, width: 50 }} />
            </>
          )}
        </span>
      </div>
      <button className="btn-secondary" disabled={disabled} onClick={handleSubmit} style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}>OK</button>
      <div className={fb.cls} style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }} dangerouslySetInnerHTML={{ __html: fb.html }} />
      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen(v => !v)}><span>{hintOpen ? '▼' : '▶'}</span> Voir la correction</button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}><div dangerouslySetInnerHTML={{ __html: exercise.steps }} /></div>
      </div>
    </div>
  );
}

// ── RangementQuestion — étape par étape ───────────────────────────────────

function RangementQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number; exercise: RangementExercise; answer: AnswerState; accent: string; onSubmit: (ok: boolean) => void;
}) {
  const n = exercise.fracs.length;
  const [step, setStep] = useState(0);           // 0=LCD, 1=partA, 2=partB, 3=partC
  const [lcdVal, setLcdVal] = useState('');
  const [partA, setPartA] = useState<string[]>(new Array(n).fill(''));
  const [partB, setPartB] = useState<string[]>(new Array(n).fill(''));
  const [partC, setPartC] = useState<[string,string][]>(new Array(n).fill(['','']));
  const [stepFb, setStepFb] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => { if (answer.status === 'revealed') setHintOpen(true); }, [answer.status]);

  const sym = exercise.ascending ? '<' : '>';
  const tagStyle = tag('Rangement', accent);

  const submitLCD = () => {
    const v = parseInt(lcdVal, 10);
    if (Number.isNaN(v)) { setStepFb('✗ Entrez un nombre.'); return; }
    if (v === exercise.lcd) { setStepFb(''); setStep(1); }
    else setStepFb(`✗ Incorrect — cherche le plus petit commun multiple de : ${exercise.fracs.map(f => f.d).join(', ')}.`);
  };

  const submitPartA = () => {
    const errs: number[] = [];
    partA.forEach((v, i) => { if (parseInt(v, 10) !== exercise.convertedNums[i]) errs.push(i); });
    if (errs.length === 0) { setStepFb(''); setStep(2); }
    else setStepFb(`✗ Erreur pour : ${errs.map(i => exercise.labels[i]).join(', ')}.`);
  };

  const submitPartB = () => {
    const errs: number[] = [];
    partB.forEach((v, j) => { if (parseInt(v, 10) !== exercise.convertedNums[exercise.orderedIndices[j]!]) errs.push(j); });
    if (errs.length === 0) { setStepFb(''); setStep(3); }
    else setStepFb("✗ L'ordre ou les valeurs sont incorrects.");
  };

  const submitPartC = () => {
    const errs: number[] = [];
    partC.forEach(([vn, vd], j) => {
      const f = exercise.fracs[exercise.orderedIndices[j]!]!;
      const nn = parseInt(vn, 10), nd = parseInt(vd, 10);
      if (Number.isNaN(nn) || Number.isNaN(nd) || nd <= 0 || !frEqual(nn, nd, f.n, f.d)) errs.push(j);
    });
    if (errs.length === 0) { setStepFb(''); onSubmit(true); }
    else setStepFb("✗ L'ordre ou les fractions ne correspondent pas.");
  };

  const setC = (i: number, j: 0|1, v: string) =>
    setPartC(p => p.map((pair, idx) => idx === i ? (j===0 ? [v,pair[1]] : [pair[0],v]) : pair) as [string,string][]);

  const fracInpFixed = (val: number) => (
    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, textAlign: 'center', display: 'block', lineHeight: '28px', width: 36 }}>{val}</span>
  );

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>Rangement</span>
        <span className="qnum">Q{String(index+1).padStart(2,'0')}</span>
      </div>
      <div style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.8 }}>
        Range dans l'ordre <strong>{exercise.ascending ? 'croissant' : 'décroissant'}</strong> :{' '}
        {exercise.labels.map((lbl, i) => (
          <span key={i} style={{ fontFamily: "'DM Mono',monospace" }}>
            {i > 0 ? ', ' : ''}{lbl} ={' '}
            <span dangerouslySetInnerHTML={{ __html: `<span class="frac" style="font-size:.9em"><span class="fn">${exercise.fracs[i]!.n}</span><span class="fd">${exercise.fracs[i]!.d}</span></span>` }} />
          </span>
        ))}
      </div>

      {/* Step 0 — LCD */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: step === 0 ? `${accent}12` : 'var(--surface2)', borderRadius: 10, border: `1px solid ${step > 0 ? `${accent}40` : 'var(--border)'}` }}>
        <div style={{ fontSize: 13, color: accent, fontWeight: 600, marginBottom: 8 }}>Quel est le plus petit dénominateur commun ?</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="text" value={lcdVal} placeholder="…" disabled={disabled || step !== 0}
            onChange={(e) => setLcdVal(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && step === 0) submitLCD(); }}
            style={{ ...inpStyle, width: 64, fontSize: 15 }} />
          {step === 0 && !disabled && <button className="btn-secondary" onClick={submitLCD} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>Vérifier</button>}
          {step > 0 && <span style={{ color: 'var(--correct)', fontFamily: "'DM Mono',monospace", fontSize: 13 }}>✓ {exercise.lcd}</span>}
        </div>
        {step === 0 && stepFb && <div className="feedback ko" style={{ marginTop: 6, fontSize: 13 }}>{stepFb}</div>}
      </div>

      {/* Step 1 — Part a */}
      {step >= 1 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: step === 1 ? `${accent}12` : 'var(--surface2)', borderRadius: 10, border: `1px solid ${step > 1 ? `${accent}40` : 'var(--border)'}` }}>
          <div style={{ fontSize: 13, color: accent, fontWeight: 600, marginBottom: 10 }}>a. Réduis chaque fraction au dénominateur {exercise.lcd} :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 10 }}>
            {exercise.fracs.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'DM Mono',monospace" }}>{exercise.labels[i]} =</span>
                <span dangerouslySetInnerHTML={{ __html: `<span class="frac" style="font-size:.9em"><span class="fn">${f.n}</span><span class="fd">${f.d}</span></span>` }} />
                <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono',monospace" }}>=</span>
                <span className="frac-inp">
                  {step > 1 ? (
                    <><span style={{ ...inpStyle, border: 'none', background: 'transparent', display: 'block', lineHeight: '28px', color: 'var(--correct)' }}>{exercise.convertedNums[i]}</span>
                    <div className="frac-line" style={{ width: 36 }} />
                    {fracInpFixed(exercise.lcd)}</>
                  ) : (
                    <><input type="text" value={partA[i]} placeholder="…" disabled={disabled || step !== 1}
                      onChange={(e) => setPartA(p => p.map((v,idx)=>idx===i?e.target.value:v))}
                      style={{ ...inpStyle, width: 40 }} />
                    <div className="frac-line" style={{ width: 40 }} />
                    {fracInpFixed(exercise.lcd)}</>
                  )}
                </span>
              </div>
            ))}
          </div>
          {step === 1 && !disabled && <button className="btn-secondary" onClick={submitPartA} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>Vérifier</button>}
          {step === 1 && stepFb && <div className="feedback ko" style={{ marginTop: 6, fontSize: 13 }}>{stepFb}</div>}
          {step > 1 && <div style={{ color: 'var(--correct)', fontSize: 13 }}>✓</div>}
        </div>
      )}

      {/* Step 2 — Part b */}
      {step >= 2 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: step === 2 ? `${accent}12` : 'var(--surface2)', borderRadius: 10, border: `1px solid ${step > 2 ? `${accent}40` : 'var(--border)'}` }}>
          <div style={{ fontSize: 13, color: accent, fontWeight: 600, marginBottom: 10 }}>b. Range les fractions réduites dans l'ordre {exercise.ascending ? 'croissant' : 'décroissant'} :</div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {partB.map((v, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {j > 0 && <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{sym}</span>}
                <span className="frac-inp">
                  {step > 2 ? (
                    <><span style={{ ...inpStyle, border: 'none', background: 'transparent', display: 'block', lineHeight: '28px', color: 'var(--correct)' }}>{exercise.convertedNums[exercise.orderedIndices[j]!]}</span>
                    <div className="frac-line" style={{ width: 36 }} />
                    {fracInpFixed(exercise.lcd)}</>
                  ) : (
                    <><input type="text" value={v} placeholder="…" disabled={disabled || step !== 2}
                      onChange={(e) => setPartB(p => p.map((x,idx)=>idx===j?e.target.value:x))}
                      style={{ ...inpStyle, width: 40 }} />
                    <div className="frac-line" style={{ width: 40 }} />
                    {fracInpFixed(exercise.lcd)}</>
                  )}
                </span>
              </div>
            ))}
          </div>
          {step === 2 && !disabled && <button className="btn-secondary" onClick={submitPartB} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>Vérifier</button>}
          {step === 2 && stepFb && <div className="feedback ko" style={{ marginTop: 6, fontSize: 13 }}>{stepFb}</div>}
          {step > 2 && <div style={{ color: 'var(--correct)', fontSize: 13 }}>✓</div>}
        </div>
      )}

      {/* Step 3 — Part c */}
      {step >= 3 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: answer.status === 'correct' ? 'var(--surface2)' : `${accent}12`, borderRadius: 10, border: `1px solid ${answer.status === 'correct' ? `${accent}40` : 'var(--border)'}` }}>
          <div style={{ fontSize: 13, color: accent, fontWeight: 600, marginBottom: 10 }}>c. En déduis le classement des fractions initiales :</div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {partC.map(([vn, vd], j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {j > 0 && <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{sym}</span>}
                <span className="frac-inp">
                  {answer.status === 'correct' ? (
                    <>{fracInpFixed(exercise.fracs[exercise.orderedIndices[j]!]!.n)}
                    <div className="frac-line" style={{ width: 36 }} />
                    {fracInpFixed(exercise.fracs[exercise.orderedIndices[j]!]!.d)}</>
                  ) : (
                    <><input type="text" value={vn} placeholder="…" disabled={disabled}
                      onChange={(e) => setC(j, 0, e.target.value)} style={{ ...inpStyle, width: 42 }} />
                    <div className="frac-line" style={{ width: 42 }} />
                    <input type="text" value={vd} placeholder="…" disabled={disabled}
                      onChange={(e) => setC(j, 1, e.target.value)} style={{ ...inpStyle, width: 42 }} /></>
                  )}
                </span>
              </div>
            ))}
          </div>
          {answer.status !== 'correct' && !disabled && <button className="btn-secondary" onClick={submitPartC} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>Vérifier</button>}
          {stepFb && step === 3 && answer.status !== 'correct' && <div className="feedback ko" style={{ marginTop: 6, fontSize: 13 }}>{stepFb}</div>}
          {answer.status === 'correct' && <div style={{ color: 'var(--correct)', fontSize: 13 }}>✓ Correct !</div>}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen(v => !v)}><span>{hintOpen ? '▼' : '▶'}</span> Voir la correction complète</button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}><div dangerouslySetInnerHTML={{ __html: exercise.steps }} /></div>
      </div>
    </div>
  );
}

// ── MulEntierQuestion ─────────────────────────────────────────────────────

function MulEntierQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number; exercise: MulEntierExercise; answer: AnswerState; accent: string; onSubmit: (ok: boolean) => void;
}) {
  const [numVal, setNumVal] = useState('');
  const [denVal, setDenVal] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState({ html: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  useEffect(() => { if (answer.status === 'revealed') setHintOpen(true); }, [answer.status]);

  const handleSubmit = () => {
    if (disabled) return;
    if (exercise.isInteger) {
      const v = parseInt(numVal, 10);
      if (Number.isNaN(v) || numVal.trim() === '') return;
      const ok = v === exercise.ans.n;
      setFeedback(ok ? { html: '✓ Correct !', cls: 'feedback ok' } : { html: `✗ Incorrect.`, cls: 'feedback ko' });
      onSubmit(ok);
    } else {
      const vn = parseInt(numVal, 10), vd = parseInt(denVal || '1', 10);
      if (Number.isNaN(vn) || numVal.trim() === '') return;
      const effD = Number.isNaN(vd) || vd === 0 ? 1 : vd;
      const ok = frEqual(vn, effD, exercise.ans.n, exercise.ans.d);
      if (ok) {
        const msg = frIsSimplified(vn, effD)
          ? '✓ Correct !'
          : (() => { const s = frSimplify(vn, effD); return `✓ Correct, mais simplifie : <span class="frac"><span class="fn">${s.n}</span><span class="fd">${s.d}</span></span>`; })();
        setFeedback({ html: msg, cls: 'feedback ok' });
      } else {
        setFeedback({ html: '✗ Incorrect.', cls: 'feedback ko' });
      }
      onSubmit(ok);
    }
  };

  const fb = answer.status === 'revealed' ? { html: '✗ Voir la correction ci-dessous.', cls: 'feedback ko' } : feedback;
  const tagStyle = tag('Multiplication', accent);
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>Multiplication</span>
        <span className="qnum">Q{String(index+1).padStart(2,'0')}</span>
      </div>
      {exercise.wordProblem ? (
        <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>{exercise.wordProblem}</div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Donne le résultat sous forme simplifiée :</div>
          <div style={{ fontSize: '1.4rem', marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: exercise.expr }} />
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Résultat :</span>
        {exercise.isInteger ? (
          <input type="text" value={numVal} placeholder="…" disabled={disabled}
            onChange={(e) => setNumVal(e.target.value)} onKeyDown={handleKey}
            style={{ ...inpStyle, width: 70, fontSize: 15 }} />
        ) : (
          <span className="frac-inp">
            <input type="text" value={numVal} placeholder="…" disabled={disabled}
              onChange={(e) => setNumVal(e.target.value)} onKeyDown={handleKey}
              style={{ ...inpStyle, width: 50 }} />
            <div className="frac-line" style={{ width: 50 }} />
            <input type="text" value={denVal} placeholder="…" disabled={disabled}
              onChange={(e) => setDenVal(e.target.value)} onKeyDown={handleKey}
              style={{ ...inpStyle, width: 50 }} />
          </span>
        )}
        <button className="btn-secondary" disabled={disabled} onClick={handleSubmit} style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}>OK</button>
      </div>
      <div className={fb.cls} style={{ marginTop: 4, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }} dangerouslySetInnerHTML={{ __html: fb.html }} />
      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen(v => !v)}><span>{hintOpen ? '▼' : '▶'}</span> Voir la correction</button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}>
          {exercise.wordProblem && (
            <div style={{ marginBottom: 8 }}>Calcul : <span dangerouslySetInnerHTML={{ __html: exercise.expr }} /></div>
          )}
          <div dangerouslySetInnerHTML={{ __html: exercise.stepsMethod1 }} />
          <div style={{ marginTop: 10 }} dangerouslySetInnerHTML={{ __html: exercise.stepsMethod2 }} />
        </div>
      </div>
    </div>
  );
}

// ── QuizView5eme ──────────────────────────────────────────────────────────

function QuizView5eme({
  modeLabel, exercises, answers, accent, accentSecondary, seriesKey,
  switcher, onSubmit, onResetErrors, onNewSeries, onBack,
}: {
  modeLabel: string; exercises: Frac5emeExercise[]; answers: AnswerState[];
  accent: string; accentSecondary?: string; seriesKey: number;
  switcher?: { counts: (2|3|4)[]; buttons: readonly (2|3|4)[]; maxIndex?: number; onChange: (i: number, n: 2|3|4) => void };
  onSubmit: (i: number, ok: boolean) => void; onResetErrors: () => void; onNewSeries: () => void; onBack: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const stats = useMemo(() => {
    let correct = 0, wrong = 0, answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') { correct++; answered++; }
      else if (a.status === 'wrong' || a.status === 'revealed') { wrong++; answered++; }
    }
    return { correct, wrong, answered, total: exercises.length };
  }, [answers, exercises.length]);

  const finished = stats.answered === stats.total && stats.total > 0;
  useEffect(() => { if (finished && endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [finished]);

  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: accentSecondary ? `linear-gradient(90deg, ${accent}, ${accentSecondary})` : accent,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ fontSize: 13 }}>← Changer de mode</button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{modeLabel}</span>
      </div>
      <div className="scoreboard">
        <div className="score-item"><span className="score-num" style={{ color: accent }}>{stats.correct}</span><div className="score-label">Justes</div></div>
        <div className="score-item"><span className="score-num" style={{ color: accent }}>{stats.wrong}</span><div className="score-label">Faux</div></div>
        <div className="score-item"><span className="score-num" style={{ color: accent }}>{stats.total - stats.answered}</span><div className="score-label">Restants</div></div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={progressStyle} /></div>
      <div className="controls">
        <button className="btn-secondary" onClick={onResetErrors} disabled={stats.wrong === 0}>Recommencer les erreurs</button>
        <button className="btn-secondary" onClick={onNewSeries}>Nouvelle série</button>
      </div>
      <div className="questions-list">
        {exercises.map((ex, i) => {
          const ans = answers[i]!;
          const key = `${seriesKey}-${ans.resetKey}-${i}`;
          const exKind = (ex as { exKind?: string }).exKind;
          if (exKind === 'mdc') return <MDCQuestion key={key} index={i} exercise={ex as MDCExercise} answer={ans} accent={accent} onSubmit={(ok) => onSubmit(i, ok)} />;
          if (exKind === 'equiv3') return <Equiv3Question key={key} index={i} exercise={ex as Equiv3Exercise} answer={ans} accent={accent} onSubmit={(ok) => onSubmit(i, ok)} />;
          if (exKind === 'complete-equiv') return <CompleteEquivQuestion key={key} index={i} exercise={ex as CompleteEquivExercise} answer={ans} accent={accent} onSubmit={(ok) => onSubmit(i, ok)} />;
          if (exKind === 'rangement') return <RangementQuestion key={key} index={i} exercise={ex as RangementExercise} answer={ans} accent={accent} onSubmit={(ok) => onSubmit(i, ok)} />;
          if (exKind === 'mul-entier') return <MulEntierQuestion key={key} index={i} exercise={ex as MulEntierExercise} answer={ans} accent={accent} onSubmit={(ok) => onSubmit(i, ok)} />;
          if ((ex as FractionsCompExercise).subtype) return <FractionsCompQuestion key={key} index={i} exercise={ex as FractionsCompExercise} answer={ans} onSubmit={(ok) => onSubmit(i, ok ?? false)} />;
          return (
            <div key={key}>
              {switcher && (switcher.maxIndex === undefined || i < switcher.maxIndex) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Nombre de fractions :</span>
                  {switcher.buttons.map((nb) => (
                    <button key={nb} type="button" disabled={ans.status !== 'pending'} onClick={() => switcher.onChange(i, nb)}
                      style={{ padding: '4px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace",
                        border: `1px solid ${(switcher.counts[i]??2)===nb ? accent : 'var(--border)'}`,
                        background: (switcher.counts[i]??2)===nb ? `${accent}22` : 'var(--surface)',
                        color: (switcher.counts[i]??2)===nb ? accent : 'var(--muted)',
                        cursor: ans.status!=='pending' ? 'not-allowed' : 'pointer', opacity: ans.status!=='pending' ? 0.6 : 1 }}>{nb}</button>
                  ))}
                </div>
              )}
              <FractionQuestion index={i} exercise={ex as FractionExercise} answer={ans} onSubmit={(ok) => onSubmit(i, ok ?? false)} />
            </div>
          );
        })}
      </div>
      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>{endTitle(Math.round((stats.correct/stats.total)*100))}</h2>
          <p>Score : {stats.correct} / {stats.total} ({Math.round((stats.correct/stats.total)*100)}%)</p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={onResetErrors} disabled={stats.wrong===0}>Recommencer les erreurs</button>
            <button className="btn-primary" style={{ background: accent }} onClick={onNewSeries}>Nouvelle série</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mode constants ─────────────────────────────────────────────────────────

const MAIN_MODES: { id: HubMode; label: string; icon: string; desc: string }[] = [
  { id: 'mdc',       label: 'Mise au même dénominateur', icon: '=',  desc: '4 exercices · même dénominateur, fractions égales, compléter une égalité' },
  { id: 'calculs',   label: 'Calculs',                   icon: '÷',  desc: '4 modes · additions, soustractions, multiplications et calculs complexes' },
  { id: 'comp',      label: 'Comparaisons & rangement',  icon: '<',  desc: '5 exercices · comparer deux fractions + rangement par étapes' },
  { id: 'simpl',     label: 'Simplification',            icon: '↓',  desc: '6 exercices · simplification par PGCD et facteurs premiers' },
  { id: 'problemes', label: 'Problèmes',                 icon: '📚', desc: '2 exercices · problèmes de répartition en contexte' },
];

const CALCULS_SUBMODES: { id: CalcSubMode; label: string; icon: string; desc: string }[] = [
  { id: 'add',     label: 'Addition',         icon: '+',  desc: '5 exercices · même dénominateur ×2, multiples ×2, entier + fraction' },
  { id: 'sub',     label: 'Soustraction',     icon: '−',  desc: '5 exercices · même dénominateur ×2, multiples ×2, entier − fraction' },
  { id: 'mul',     label: 'Multiplication',   icon: '×',  desc: '6 exercices · entier × fraction, deux méthodes de correction' },
  { id: 'complex', label: 'Calculs complexes', icon: '()', desc: '4 calculs · ≥ 3 fractions, certains avec parenthèses' },
];

function MainModeSelector({ onSelect, accent }: { onSelect: (m: HubMode) => void; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
      {MAIN_MODES.map((m) => <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => onSelect(m.id)} />)}
    </div>
  );
}

function CalcSubModeSelector({ onSelect, onBack, accent }: { onSelect: (c: CalcSubMode) => void; onBack: () => void; accent: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ fontSize: 13 }}>← Retour</button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>Calculs</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {CALCULS_SUBMODES.map((m) => <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => onSelect(m.id)} />)}
      </div>
    </div>
  );
}

const ADD_POS_MAP = [0, 0, 1, 1] as const;
const SUB_POS_MAP = [0, 0, 1, 1] as const;

// ── FractionsHub5eme ───────────────────────────────────────────────────────

export function FractionsHub5eme({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode | null>(null);
  const [calcSubMode, setCalcSubMode] = useState<CalcSubMode | null>(null);
  const [exercises, setExercises] = useState<Frac5emeExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const [exCounts, setExCounts] = useState<(2|3|4)[]>([]);

  const loadExercises = (m: HubMode, csm: CalcSubMode | null) => {
    let exs: Frac5emeExercise[] = [];
    if (m === 'mdc') exs = generate5emeMDCSeries();
    else if (m === 'comp') exs = generate5emeCompSeries();
    else if (m === 'simpl') exs = generate5emeSimplSeries();
    else if (m === 'problemes') exs = generate5emeProblemsSeries();
    else if (m === 'calculs' && csm !== null) {
      if (csm === 'add') exs = generate5emeAddSeries();
      else if (csm === 'sub') exs = generate5emeSubSeries();
      else if (csm === 'mul') exs = generate5emeMulEntierSeries();
      else if (csm === 'complex') exs = generate5emeComplexSeries();
    }
    if (csm === 'add' || csm === 'sub') setExCounts([2, 2, 2, 2]);
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeExCount = (i: number, count: 2|3|4) => {
    if (answers[i]?.status !== 'pending') return;
    if (i < 0 || i > 3) return;
    setExCounts((prev) => prev.map((v, idx) => idx === i ? count : v) as (2|3|4)[]);
    const posMap = calcSubMode === 'sub' ? SUB_POS_MAP : ADD_POS_MAP;
    const pos = posMap[i as 0|1|2|3] as 0|1|2|3|4|5;
    const newEx = calcSubMode === 'sub' ? makeSubAtPos(pos, count) : makeAddAtPos(pos, count);
    setExercises((prev) => prev.map((e, idx) => idx === i ? newEx : e));
    setAnswers((prev) => prev.map((a, idx) => idx === i ? { value: '', status: 'pending', resetKey: (a.resetKey??0)+1 } : a));
  };

  const selectMode = (m: HubMode) => { setMode(m); if (m !== 'calculs') loadExercises(m, null); };
  const selectCalcSubMode = (csm: CalcSubMode) => { setCalcSubMode(csm); loadExercises('calculs', csm); };

  const submit = (i: number, correct: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) => prev.map((a, idx) => idx === i ? { ...a, status: correct ? 'correct' : 'wrong' } : a));
  };

  const resetErrors = () => {
    setAnswers((prev) => prev.map((a) => a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey+1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => { if (mode !== null) loadExercises(mode, calcSubMode); };

  const goBack = () => {
    if (mode === 'calculs' && calcSubMode !== null) { setCalcSubMode(null); setExercises([]); setAnswers([]); }
    else { setMode(null); setCalcSubMode(null); setExercises([]); setAnswers([]); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getModeLabel = () => {
    if (mode === 'mdc') return 'Mise au même dénominateur';
    if (mode === 'comp') return 'Comparaisons & rangement';
    if (mode === 'simpl') return 'Simplification';
    if (mode === 'problemes') return 'Problèmes';
    if (mode === 'calculs') {
      if (calcSubMode === 'add') return 'Addition';
      if (calcSubMode === 'sub') return 'Soustraction';
      if (calcSubMode === 'mul') return 'Multiplication';
      if (calcSubMode === 'complex') return 'Calculs complexes';
    }
    return '';
  };

  if (mode === null) return <MainModeSelector onSelect={selectMode} accent={accent} />;
  if (mode === 'calculs' && calcSubMode === null) return <CalcSubModeSelector onSelect={selectCalcSubMode} onBack={() => setMode(null)} accent={accent} />;

  return (
    <QuizView5eme
      modeLabel={getModeLabel()} exercises={exercises} answers={answers}
      accent={accent} accentSecondary={accentSecondary} seriesKey={seriesKey}
      switcher={
        calcSubMode === 'add' || calcSubMode === 'sub'
          ? { counts: exCounts, buttons: [2,3,4] as const, maxIndex: 4, onChange: changeExCount }
          : undefined
      }
      onSubmit={submit} onResetErrors={resetErrors} onNewSeries={newSeries} onBack={goBack}
    />
  );
}
