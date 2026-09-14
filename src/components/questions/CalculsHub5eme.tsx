import { useEffect, useMemo, useRef, useState } from 'react';
import type { AutoQCMExercise, AutoCalcExercise } from '@/types';
import { AutomatismesQuestion } from './AutomatismesQuestion';
import { ReperageHub5eme } from '../ReperageHub5eme';

type MainMode = 'priorites' | 'reperage' | null;
type SubMode = 'sans-parentheses' | 'avec-parentheses' | null;

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });
const buildAnswers = (n: number): AnswerState[] => Array.from({ length: n }, emptyAnswer);

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

// ── ModeCard ──────────────────────────────────────────────────────────────────

function ModeCard({
  label, icon, desc, accent, onClick, href,
}: {
  label: string; icon: string; desc: string; accent: string; onClick?: () => void; href?: string;
}) {
  const sharedStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
    textAlign: 'left', color: 'var(--text)', transition: 'border-color 0.15s', width: '100%',
    textDecoration: 'none',
  };
  const inner = (
    <>
      <span style={{ fontSize: 26, minWidth: 36, textAlign: 'center', color: accent }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        style={sharedStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={sharedStyle}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {inner}
    </button>
  );
}

// ── VideoLink ─────────────────────────────────────────────────────────────────

function VideoLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 8,
        background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.25)',
        color: '#f87171', fontSize: 13, textDecoration: 'none',
        fontWeight: 600, marginTop: 6, marginRight: 8,
      }}
    >
      ▶ {label}
    </a>
  );
}

// ── Rappels ───────────────────────────────────────────────────────────────────

function RecallSansParentheses({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel — priorités opératoires + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <p style={{ marginTop: 12, marginBottom: 4 }}>
          Dans une expression <strong>sans parenthèses</strong> :
        </p>
        <ol style={{ margin: '0 0 8px 18px', padding: 0 }}>
          <li>On effectue d'abord les <strong>multiplications (×)</strong> et <strong>divisions (÷)</strong>.</li>
          <li>Puis les <strong>additions (+)</strong> et <strong>soustractions (−)</strong>.</li>
          <li>À priorité égale, on calcule de <strong>gauche à droite</strong>.</li>
        </ol>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/idB0-F7b1Yk" label="Calcul sans parenthèse et sans priorité" />
          <VideoLink url="https://youtu.be/TJH-fiwAt5s" label="Calcul sans parenthèse et avec priorité" />
        </div>
      </div>
    </div>
  );
}

function RecallAvecParentheses({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel — parenthèses et crochets + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <p style={{ marginTop: 12, marginBottom: 4 }}>
          Dans une expression <strong>avec parenthèses</strong> :
        </p>
        <ol style={{ margin: '0 0 8px 18px', padding: 0 }}>
          <li>On commence par calculer ce qui est entre <strong>parenthèses ( )</strong>.</li>
          <li>Si des crochets [ ] entourent des parenthèses, on calcule les parenthèses <strong>les plus intérieures en premier</strong>.</li>
          <li>Ensuite on applique les règles de priorité habituelles (× et ÷ avant + et −).</li>
        </ol>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/kNOR38ZuBRc" label="Expression avec des parenthèses" />
          <VideoLink url="https://youtu.be/fCDe27qL4Ko" label="Expression avec des parenthèses doubles (1)" />
          <VideoLink url="https://youtu.be/mLlLNM5D66M" label="Expression avec des parenthèses doubles (2)" />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ok = (s: string) => `<strong style="color:var(--correct)">${s}</strong>`;
const expr = (s: string) => `<span style="font-family:'DM Mono',monospace;background:var(--surface2);padding:2px 8px;border-radius:4px">${s}</span>`;

type Ex = AutoQCMExercise | AutoCalcExercise;

// ── Sans parenthèses — 4 séries ───────────────────────────────────────────────

const SANS_PARENTHESES_BANK: Ex[][] = [
  // ── Série 0 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('3 + 5 × 2')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `Les multiplications et divisions sont <strong>prioritaires</strong> sur les additions et soustractions.<br><br>On effectue d'abord <u>5 × 2</u> = 10, puis 3 + 10 = ${ok('13')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('28 − 12 ÷ 4 + 1')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '− (soustraction)', '+ (addition)', '× (multiplication)'],
      correctIndex: 0,
      stepsHtml: `La division est prioritaire.<br><br>On effectue d'abord <u>12 ÷ 4</u> = 3, puis 28 − 3 + 1 = ${ok('26')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '8 × 3 − 14 =', answer: '10', stepsHtml: `Priorité à × : <u>8 × 3</u> = 24<br>24 − 14 = ${ok('10')}` },
        { label: '50 − 18 ÷ 3 =', answer: '44', stepsHtml: `Priorité à ÷ : <u>18 ÷ 3</u> = 6<br>50 − 6 = ${ok('44')}` },
        { label: '20 − 4 × 4 =', answer: '4', stepsHtml: `Priorité à × : <u>4 × 4</u> = 16<br>20 − 16 = ${ok('4')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 15 − 8 + 4 =', answer: '11', stepsHtml: `A = <u>15 − 8</u> + 4 = 7 + 4 = ${ok('11')}` },
        { label: 'B = 15 + 8 − 4 =', answer: '19', stepsHtml: `B = <u>15 + 8</u> − 4 = 23 − 4 = ${ok('19')}` },
        { label: 'C = 6 × 3 × 2 =', answer: '36', stepsHtml: `C = <u>6 × 3</u> × 2 = 18 × 2 = ${ok('36')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 2 × 4 ÷ 4 =', answer: '2', stepsHtml: `G = <u>2 × 4</u> ÷ 4 = 8 ÷ 4 = ${ok('2')}` },
        { label: 'H = 12 × 4 ÷ 3 =', answer: '16', stepsHtml: `H = <u>12 × 4</u> ÷ 3 = 48 ÷ 3 = ${ok('16')}` },
        { label: 'I = 18 − 2 × 5 =', answer: '8', stepsHtml: `I = 18 − <u>2 × 5</u> = 18 − 10 = ${ok('8')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 24 + 3 × 7 =', answer: '45', stepsHtml: `M = 24 + <u>3 × 7</u> = 24 + 21 = ${ok('45')}` },
        { label: 'N = 15 ÷ 5 − 2 =', answer: '1', stepsHtml: `N = <u>15 ÷ 5</u> − 2 = 3 − 2 = ${ok('1')}` },
        { label: 'P = 20 − 0,1 × 38 =', answer: '16.2', altAnswers: ['16,2'], stepsHtml: `P = 20 − <u>0,1 × 38</u> = 20 − 3,8 = ${ok('16,2')}` },
      ],
    },
  ],
  // ── Série 1 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('20 − 6 ÷ 2')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '× (multiplication)', '− (soustraction)', '+ (addition)'],
      correctIndex: 0,
      stepsHtml: `La division est <strong>prioritaire</strong> sur la soustraction.<br><br>On effectue d'abord <u>6 ÷ 2</u> = 3, puis 20 − 3 = ${ok('17')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('15 + 3 × 7 − 2')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `La multiplication est prioritaire.<br><br>On effectue d'abord <u>3 × 7</u> = 21, puis 15 + 21 − 2 = ${ok('34')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '7 × 4 − 10 =', answer: '18', stepsHtml: `Priorité à × : <u>7 × 4</u> = 28<br>28 − 10 = ${ok('18')}` },
        { label: '60 − 24 ÷ 4 =', answer: '54', stepsHtml: `Priorité à ÷ : <u>24 ÷ 4</u> = 6<br>60 − 6 = ${ok('54')}` },
        { label: '30 − 3 × 8 =', answer: '6', stepsHtml: `Priorité à × : <u>3 × 8</u> = 24<br>30 − 24 = ${ok('6')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 20 − 12 + 5 =', answer: '13', stepsHtml: `A = <u>20 − 12</u> + 5 = 8 + 5 = ${ok('13')}` },
        { label: 'B = 10 + 9 − 4 =', answer: '15', stepsHtml: `B = <u>10 + 9</u> − 4 = 19 − 4 = ${ok('15')}` },
        { label: 'C = 4 × 5 × 2 =', answer: '40', stepsHtml: `C = <u>4 × 5</u> × 2 = 20 × 2 = ${ok('40')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 3 × 6 ÷ 9 =', answer: '2', stepsHtml: `G = <u>3 × 6</u> ÷ 9 = 18 ÷ 9 = ${ok('2')}` },
        { label: 'H = 20 × 3 ÷ 4 =', answer: '15', stepsHtml: `H = <u>20 × 3</u> ÷ 4 = 60 ÷ 4 = ${ok('15')}` },
        { label: 'I = 24 − 4 × 3 =', answer: '12', stepsHtml: `I = 24 − <u>4 × 3</u> = 24 − 12 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 10 + 4 × 8 =', answer: '42', stepsHtml: `M = 10 + <u>4 × 8</u> = 10 + 32 = ${ok('42')}` },
        { label: 'N = 30 ÷ 6 − 1 =', answer: '4', stepsHtml: `N = <u>30 ÷ 6</u> − 1 = 5 − 1 = ${ok('4')}` },
        { label: 'P = 15 − 0,2 × 20 =', answer: '11', stepsHtml: `P = 15 − <u>0,2 × 20</u> = 15 − 4 = ${ok('11')}` },
      ],
    },
  ],
  // ── Série 2 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('12 ÷ 4 + 7')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '× (multiplication)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `La division est <strong>prioritaire</strong> sur l'addition.<br><br>On effectue d'abord <u>12 ÷ 4</u> = 3, puis 3 + 7 = ${ok('10')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('6 × 5 − 8 + 2')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '− (soustraction)', '+ (addition)'],
      correctIndex: 0,
      stepsHtml: `La multiplication est prioritaire.<br><br>On effectue d'abord <u>6 × 5</u> = 30, puis 30 − 8 + 2 = ${ok('24')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '9 × 5 − 25 =', answer: '20', stepsHtml: `Priorité à × : <u>9 × 5</u> = 45<br>45 − 25 = ${ok('20')}` },
        { label: '40 − 32 ÷ 4 =', answer: '32', stepsHtml: `Priorité à ÷ : <u>32 ÷ 4</u> = 8<br>40 − 8 = ${ok('32')}` },
        { label: '7 × 6 − 22 =', answer: '20', stepsHtml: `Priorité à × : <u>7 × 6</u> = 42<br>42 − 22 = ${ok('20')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 18 − 5 + 3 =', answer: '16', stepsHtml: `A = <u>18 − 5</u> + 3 = 13 + 3 = ${ok('16')}` },
        { label: 'B = 12 + 7 − 8 =', answer: '11', stepsHtml: `B = <u>12 + 7</u> − 8 = 19 − 8 = ${ok('11')}` },
        { label: 'C = 5 × 4 × 3 =', answer: '60', stepsHtml: `C = <u>5 × 4</u> × 3 = 20 × 3 = ${ok('60')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 4 × 5 ÷ 10 =', answer: '2', stepsHtml: `G = <u>4 × 5</u> ÷ 10 = 20 ÷ 10 = ${ok('2')}` },
        { label: 'H = 15 × 2 ÷ 6 =', answer: '5', stepsHtml: `H = <u>15 × 2</u> ÷ 6 = 30 ÷ 6 = ${ok('5')}` },
        { label: 'I = 30 − 3 × 8 =', answer: '6', stepsHtml: `I = 30 − <u>3 × 8</u> = 30 − 24 = ${ok('6')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 35 + 5 × 4 =', answer: '55', stepsHtml: `M = 35 + <u>5 × 4</u> = 35 + 20 = ${ok('55')}` },
        { label: 'N = 24 ÷ 8 − 2 =', answer: '1', stepsHtml: `N = <u>24 ÷ 8</u> − 2 = 3 − 2 = ${ok('1')}` },
        { label: 'P = 10 + 0,5 × 6 =', answer: '13', stepsHtml: `P = 10 + <u>0,5 × 6</u> = 10 + 3 = ${ok('13')}` },
      ],
    },
  ],
  // ── Série 3 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('5 × 3 + 14')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `La multiplication est <strong>prioritaire</strong> sur l'addition.<br><br>On effectue d'abord <u>5 × 3</u> = 15, puis 15 + 14 = ${ok('29')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('40 ÷ 8 − 1 + 6')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '× (multiplication)', '− (soustraction)', '+ (addition)'],
      correctIndex: 0,
      stepsHtml: `La division est prioritaire.<br><br>On effectue d'abord <u>40 ÷ 8</u> = 5, puis 5 − 1 + 6 = ${ok('10')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '6 × 7 − 12 =', answer: '30', stepsHtml: `Priorité à × : <u>6 × 7</u> = 42<br>42 − 12 = ${ok('30')}` },
        { label: '80 − 45 ÷ 9 =', answer: '75', stepsHtml: `Priorité à ÷ : <u>45 ÷ 9</u> = 5<br>80 − 5 = ${ok('75')}` },
        { label: '50 − 6 × 7 =', answer: '8', stepsHtml: `Priorité à × : <u>6 × 7</u> = 42<br>50 − 42 = ${ok('8')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 25 − 13 + 6 =', answer: '18', stepsHtml: `A = <u>25 − 13</u> + 6 = 12 + 6 = ${ok('18')}` },
        { label: 'B = 8 + 14 − 9 =', answer: '13', stepsHtml: `B = <u>8 + 14</u> − 9 = 22 − 9 = ${ok('13')}` },
        { label: 'C = 3 × 4 × 5 =', answer: '60', stepsHtml: `C = <u>3 × 4</u> × 5 = 12 × 5 = ${ok('60')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 5 × 6 ÷ 15 =', answer: '2', stepsHtml: `G = <u>5 × 6</u> ÷ 15 = 30 ÷ 15 = ${ok('2')}` },
        { label: 'H = 8 × 6 ÷ 4 =', answer: '12', stepsHtml: `H = <u>8 × 6</u> ÷ 4 = 48 ÷ 4 = ${ok('12')}` },
        { label: 'I = 36 − 4 × 7 =', answer: '8', stepsHtml: `I = 36 − <u>4 × 7</u> = 36 − 28 = ${ok('8')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 16 + 2 × 9 =', answer: '34', stepsHtml: `M = 16 + <u>2 × 9</u> = 16 + 18 = ${ok('34')}` },
        { label: 'N = 42 ÷ 7 − 4 =', answer: '2', stepsHtml: `N = <u>42 ÷ 7</u> − 4 = 6 − 4 = ${ok('2')}` },
        { label: 'P = 25 − 0,5 × 10 =', answer: '20', stepsHtml: `P = 25 − <u>0,5 × 10</u> = 25 − 5 = ${ok('20')}` },
      ],
    },
  ],
];

// ── Avec parenthèses — 4 séries ───────────────────────────────────────────────

const AVEC_PARENTHESES_BANK: Ex[][] = [
  // ── Série 0 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(6,2 − 0,1) ÷ 10')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '6,2 − 0,1 (calcul entre parenthèses)',
        'la division ÷ 10',
        '6,2 ÷ 10',
        '0,1 ÷ 10',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(6,2 − 0,1)</u> = 6,1, puis 6,1 ÷ 10 = ${ok('0,61')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('238 − 4 × (13 + 27)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '13 + 27 (calcul entre parenthèses)',
        '4 × 13 (multiplication)',
        '238 − 4 (soustraction)',
        '4 × 27 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(13 + 27)</u> = 40.<br><br>Ensuite : 238 − 4 × 40 → <u>4 × 40</u> = 160 → 238 − 160 = ${ok('78')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 24 − (8 − 3) + 1</strong>`,
      parts: [
        { label: 'A =', answer: '20', stepsHtml: `Parenthèses : <u>(8 − 3)</u> = 5<br>A = 24 − 5 + 1 = <u>24 − 5</u> + 1 = 19 + 1 = ${ok('20')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 24 − 8 − (3 + 1)</strong>`,
      parts: [
        { label: 'B =', answer: '12', stepsHtml: `Parenthèses : <u>(3 + 1)</u> = 4<br>B = 24 − 8 − 4 = <u>24 − 8</u> − 4 = 16 − 4 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 24 ÷ [8 − (3 + 1)]</strong>`,
      parts: [
        { label: 'C =', answer: '6', stepsHtml: `Parenthèses : <u>(3 + 1)</u> = 4<br>Crochets : <u>[8 − 4]</u> = 4<br>C = 24 ÷ 4 = ${ok('6')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 18 − [4 × (5 − 3) + 2]</strong>`,
      parts: [
        { label: 'D =', answer: '8', stepsHtml: `Parenthèses : <u>(5 − 3)</u> = 2<br>Priorité à × dans les crochets : <u>4 × 2</u> = 8<br>Crochets : <u>[8 + 2]</u> = 10<br>D = 18 − 10 = ${ok('8')}` },
      ],
    },
  ],
  // ── Série 1 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(8 + 2) × 5')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '8 + 2 (calcul entre parenthèses)',
        'la multiplication × 5',
        '8 × 5',
        '2 × 5',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(8 + 2)</u> = 10, puis 10 × 5 = ${ok('50')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('50 − 2 × (8 + 3)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '8 + 3 (calcul entre parenthèses)',
        '2 × 8 (multiplication)',
        '50 − 2 (soustraction)',
        '2 × 3 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(8 + 3)</u> = 11.<br><br>Ensuite : 50 − 2 × 11 → <u>2 × 11</u> = 22 → 50 − 22 = ${ok('28')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 30 − (10 − 5) + 2</strong>`,
      parts: [
        { label: 'A =', answer: '27', stepsHtml: `Parenthèses : <u>(10 − 5)</u> = 5<br>A = 30 − 5 + 2 = <u>30 − 5</u> + 2 = 25 + 2 = ${ok('27')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 30 − 10 − (2 + 3)</strong>`,
      parts: [
        { label: 'B =', answer: '15', stepsHtml: `Parenthèses : <u>(2 + 3)</u> = 5<br>B = 30 − 10 − 5 = <u>30 − 10</u> − 5 = 20 − 5 = ${ok('15')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 40 ÷ [10 − (3 + 3)]</strong>`,
      parts: [
        { label: 'C =', answer: '10', stepsHtml: `Parenthèses : <u>(3 + 3)</u> = 6<br>Crochets : <u>[10 − 6]</u> = 4<br>C = 40 ÷ 4 = ${ok('10')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 25 − [3 × (6 − 2) + 1]</strong>`,
      parts: [
        { label: 'D =', answer: '12', stepsHtml: `Parenthèses : <u>(6 − 2)</u> = 4<br>Priorité à × dans les crochets : <u>3 × 4</u> = 12<br>Crochets : <u>[12 + 1]</u> = 13<br>D = 25 − 13 = ${ok('12')}` },
      ],
    },
  ],
  // ── Série 2 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(15 − 3) ÷ 4')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '15 − 3 (calcul entre parenthèses)',
        'la division ÷ 4',
        '15 ÷ 4',
        '3 ÷ 4',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(15 − 3)</u> = 12, puis 12 ÷ 4 = ${ok('3')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('80 + 3 × (10 − 4)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '10 − 4 (calcul entre parenthèses)',
        '3 × 10 (multiplication)',
        '80 + 3 (addition)',
        '3 × 4 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(10 − 4)</u> = 6.<br><br>Ensuite : 80 + 3 × 6 → <u>3 × 6</u> = 18 → 80 + 18 = ${ok('98')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 35 − (12 − 8) + 3</strong>`,
      parts: [
        { label: 'A =', answer: '34', stepsHtml: `Parenthèses : <u>(12 − 8)</u> = 4<br>A = 35 − 4 + 3 = <u>35 − 4</u> + 3 = 31 + 3 = ${ok('34')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 40 − 15 − (8 + 2)</strong>`,
      parts: [
        { label: 'B =', answer: '15', stepsHtml: `Parenthèses : <u>(8 + 2)</u> = 10<br>B = 40 − 15 − 10 = <u>40 − 15</u> − 10 = 25 − 10 = ${ok('15')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 36 ÷ [10 − (4 + 3)]</strong>`,
      parts: [
        { label: 'C =', answer: '12', stepsHtml: `Parenthèses : <u>(4 + 3)</u> = 7<br>Crochets : <u>[10 − 7]</u> = 3<br>C = 36 ÷ 3 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 30 − [5 × (4 − 2) + 6]</strong>`,
      parts: [
        { label: 'D =', answer: '14', stepsHtml: `Parenthèses : <u>(4 − 2)</u> = 2<br>Priorité à × dans les crochets : <u>5 × 2</u> = 10<br>Crochets : <u>[10 + 6]</u> = 16<br>D = 30 − 16 = ${ok('14')}` },
      ],
    },
  ],
  // ── Série 3 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(7 + 3) × 6')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '7 + 3 (calcul entre parenthèses)',
        'la multiplication × 6',
        '7 × 6',
        '3 × 6',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(7 + 3)</u> = 10, puis 10 × 6 = ${ok('60')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('60 − 5 × (9 + 1)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '9 + 1 (calcul entre parenthèses)',
        '5 × 9 (multiplication)',
        '60 − 5 (soustraction)',
        '5 × 1 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(9 + 1)</u> = 10.<br><br>Ensuite : 60 − 5 × 10 → <u>5 × 10</u> = 50 → 60 − 50 = ${ok('10')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 50 − (20 − 8) + 5</strong>`,
      parts: [
        { label: 'A =', answer: '43', stepsHtml: `Parenthèses : <u>(20 − 8)</u> = 12<br>A = 50 − 12 + 5 = <u>50 − 12</u> + 5 = 38 + 5 = ${ok('43')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 45 − 20 − (6 + 4)</strong>`,
      parts: [
        { label: 'B =', answer: '15', stepsHtml: `Parenthèses : <u>(6 + 4)</u> = 10<br>B = 45 − 20 − 10 = <u>45 − 20</u> − 10 = 25 − 10 = ${ok('15')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 48 ÷ [12 − (5 + 3)]</strong>`,
      parts: [
        { label: 'C =', answer: '12', stepsHtml: `Parenthèses : <u>(5 + 3)</u> = 8<br>Crochets : <u>[12 − 8]</u> = 4<br>C = 48 ÷ 4 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 40 − [6 × (3 − 1) + 4]</strong>`,
      parts: [
        { label: 'D =', answer: '24', stepsHtml: `Parenthèses : <u>(3 − 1)</u> = 2<br>Priorité à × dans les crochets : <u>6 × 2</u> = 12<br>Crochets : <u>[12 + 4]</u> = 16<br>D = 40 − 16 = ${ok('24')}` },
      ],
    },
  ],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getExercises(sm: SubMode, idx: number): Ex[] {
  if (sm === 'sans-parentheses') return SANS_PARENTHESES_BANK[idx] ?? SANS_PARENTHESES_BANK[0]!;
  if (sm === 'avec-parentheses') return AVEC_PARENTHESES_BANK[idx] ?? AVEC_PARENTHESES_BANK[0]!;
  return [];
}

function getSubModeLabel(sm: SubMode): string {
  if (sm === 'sans-parentheses') return 'Sans parenthèses';
  if (sm === 'avec-parentheses') return 'Avec parenthèses';
  return '';
}

// ── CalculsHub5eme ─────────────────────────────────────────────────────────────

export function CalculsHub5eme({
  accent,
  accentSecondary,
}: {
  accent: string;
  accentSecondary?: string;
}) {
  const [mainMode, setMainMode] = useState<MainMode>(null);
  const [subMode, setSubMode] = useState<SubMode>(null);
  const [seriesIdx, setSeriesIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const currentExercises = getExercises(subMode, seriesIdx);

  const enterSubMode = (sm: SubMode) => {
    setSubMode(sm);
    setSeriesIdx(0);
    setAnswers(buildAnswers(getExercises(sm, 0).length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = useMemo(() => {
    let correct = 0, wrong = 0, answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') { correct++; answered++; }
      else if (a.status === 'wrong' || a.status === 'revealed') { wrong++; answered++; }
    }
    return { correct, wrong, answered, total: answers.length };
  }, [answers]);

  const finished = stats.answered === stats.total && stats.total > 0;

  useEffect(() => {
    if (finished && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [finished]);

  const submit = (i: number, correct: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) => prev.map((a, idx) => idx === i ? { ...a, status: correct ? 'correct' : 'wrong' } : a));
  };

  const revealAll = () => {
    setAnswers((prev) => prev.map((a) => a.status === 'pending' ? { ...a, status: 'revealed' } : a));
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const recommencer = () => {
    setAnswers(buildAnswers(getExercises(subMode, seriesIdx).length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => {
    const next = (seriesIdx + 1) % 4;
    setSeriesIdx(next);
    setAnswers(buildAnswers(getExercises(subMode, next).length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Niveau 0 — sélecteur principal
  if (!mainMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        <ModeCard
          label="Priorités opératoires : règles"
          icon="🔍"
          desc="5 expressions · clique sur l'opération à effectuer en premier"
          accent={accent}
          onClick={() => setMainMode('reperage')}
        />
        <ModeCard
          label="Priorités opératoires : calcul"
          icon="⊕"
          desc="2 sous-thèmes · ordre des opérations, sans et avec parenthèses"
          accent={accent}
          onClick={() => setMainMode('priorites')}
        />
        <ModeCard
          label="Top Chrono"
          icon="⏱"
          desc="Réponds le plus vite possible · expressions sans et avec parenthèses"
          accent={accentSecondary ?? accent}
          href="/5eme/calculs-chrono"
        />
      </div>
    );
  }

  // Repérage
  if (mainMode === 'reperage') {
    return <ReperageHub5eme accent={accent} onBack={() => setMainMode(null)} />;
  }

  // Niveau 1 — sélecteur de sous-mode
  if (!subMode) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setMainMode(null)}
            style={{ fontSize: 13 }}
          >
            ← Retour
          </button>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Priorités opératoires : calcul</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
          <ModeCard
            label="Sans parenthèses"
            icon="÷"
            desc="6 questions · identifier l'opération prioritaire et effectuer des calculs"
            accent={accent}
            onClick={() => enterSubMode('sans-parentheses')}
          />
          <ModeCard
            label="Avec parenthèses"
            icon="( )"
            desc="6 questions · calculs prioritaires entre parenthèses et crochets"
            accent={accent}
            onClick={() => enterSubMode('avec-parentheses')}
          />
        </div>
      </div>
    );
  }

  // Niveau 2 — vue quiz
  const progressPct = stats.total > 0 ? (stats.answered / stats.total) * 100 : 0;
  const progressStyle = {
    width: `${progressPct}%`,
    background: accentSecondary
      ? `linear-gradient(90deg, ${accent}, ${accentSecondary})`
      : accent,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => { setSubMode(null); setSeriesIdx(0); setAnswers([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ fontSize: 13 }}
        >
          ← Retour
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{getSubModeLabel(subMode)}</span>
      </div>

      {subMode === 'sans-parentheses' && <RecallSansParentheses accent={accent} />}
      {subMode === 'avec-parentheses' && <RecallAvecParentheses accent={accent} />}

      <div className="scoreboard">
        <div className="score-item">
          <span className="score-num" style={{ color: accent }}>{stats.correct}</span>
          <div className="score-label">Justes</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={{ color: accent }}>{stats.wrong}</span>
          <div className="score-label">Faux</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={{ color: accent }}>{stats.total - stats.answered}</span>
          <div className="score-label">Restants</div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={progressStyle} />
      </div>

      <div className="controls">
        <button className="btn-primary" style={{ background: accent }} onClick={revealAll}>
          Tout corriger
        </button>
        <button className="btn-secondary" onClick={recommencer}>
          Recommencer
        </button>
        <button className="btn-secondary" onClick={newSeries}>
          Nouvelle série
        </button>
      </div>

      <div className="er-grid">
        {currentExercises.map((ex, i) => (
          <AutomatismesQuestion
            key={`${seriesIdx}-${answers[i]!.resetKey}-${i}`}
            index={i}
            exercise={ex}
            answer={answers[i]!}
            accent={accent}
            onSubmit={(correct) => submit(i, correct)}
          />
        ))}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>
            {endTitle(Math.round((stats.correct / stats.total) * 100))}
          </h2>
          <p>
            Score : {stats.correct} / {stats.total} (
            {Math.round((stats.correct / stats.total) * 100)}%)
          </p>
          <div className="btn-group">
            <button className="btn-primary" style={{ background: accent }} onClick={recommencer}>
              Recommencer
            </button>
            <button className="btn-secondary" onClick={newSeries}>
              Nouvelle série
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
