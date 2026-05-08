import type { GeneratorSpec, PythagoreExercise, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'pythagore' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as PythagoreExercise[];

const FORMULA_BANNER_HTML = `
  <div style="flex:1;">
    <p style="font-size:12px;color:var(--muted);margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase;">Dans un triangle ABC rectangle en C</p>
    <p style="font-size:13px;color:var(--muted);margin-bottom:8px;">d'hypoténuse [AB], on a d'après le théorème de Pythagore :</p>
    <div class="formula" style="font-size:1.4rem;">AB² = AC² + BC²</div>
  </div>
  <svg width="130" height="110" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
    <polygon points="10,90 10,10 110,90" fill="rgba(96,165,250,0.07)" stroke="#60A5FA" stroke-width="1.5"/>
    <rect x="10" y="76" width="14" height="14" fill="none" stroke="#60A5FA" stroke-width="1.2"/>
    <text x="1" y="8" fill="#A78BFA" font-family="DM Mono,monospace" font-size="12">A</text>
    <text x="0" y="103" fill="#A78BFA" font-family="DM Mono,monospace" font-size="12">C</text>
    <text x="114" y="103" fill="#A78BFA" font-family="DM Mono,monospace" font-size="12">B</text>
    <text x="18" y="52" fill="#60A5FA" font-family="DM Mono,monospace" font-size="11">AC</text>
    <text x="50" y="103" fill="#7A7F94" font-family="DM Mono,monospace" font-size="11">BC</text>
    <text x="62" y="44" fill="#F0EDE8" font-family="DM Mono,monospace" font-size="11">AB</text>
  </svg>
`;

export const pythQuiz: QuizDefinition<PythagoreExercise> = {
  id: 'pyth',
  available: true,
  title: 'Théorème de Pythagore',
  titleSub: 'Pythagore',
  titleFontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
  subtitle: '7 questions · 3 avec figure + 3 calculs + 1 exercice à compléter',
  category: 'Géométrie',
  accent: '#60A5FA',
  accentSecondary: '#6EE7C0',
  icon: '📐',
  description: "Trouver le côté manquant d'un triangle rectangle. Avec figures et problèmes contextuels.",
  tags: ['7 questions', 'Figures', 'Génération aléatoire'],
  renderer: 'pythagore',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  formulaBanner: {
    html: FORMULA_BANNER_HTML,
    bannerStyle: {
      maxWidth: '580px',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      textAlign: 'left',
      padding: '1.4rem 2rem',
    },
  },
};
