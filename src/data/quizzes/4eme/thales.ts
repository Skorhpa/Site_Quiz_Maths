import type { GeneratorSpec, QuizDefinition, ThalesExercise } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'thales' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as ThalesExercise[];

const FORMULA_BANNER_HTML = `
  <div style="flex:1;">
    <p style="font-size:12px;color:var(--muted);margin-bottom:10px;letter-spacing:.06em;text-transform:uppercase;">Rappel du théorème</p>
    <p style="font-size:13px;color:var(--muted);margin-bottom:10px;line-height:1.7;">Si M est sur [AB] et N est sur [AC], et que (MN) ∥ (BC), alors :</p>
    <div style="font-family:'DM Mono',monospace;font-size:13px;color:var(--c4);line-height:2.2;">AM/AB = AN/AC = MN/BC</div>
  </div>
  <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
    <polygon points="70,8 10,142 130,142" fill="rgba(251,146,60,0.07)" stroke="#FB923C" stroke-width="1.5"/>
    <line x1="34" y1="86" x2="106" y2="86" stroke="#FB923C" stroke-width="1.4"/>
    <text x="70" y="30" fill="#F0EDE8" font-family="DM Mono,monospace" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">A</text>
    <text x="30" y="128" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">B</text>
    <text x="110" y="128" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">C</text>
    <text x="46" y="76" fill="#FB923C" font-family="DM Mono,monospace" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">M</text>
    <text x="94" y="76" fill="#FB923C" font-family="DM Mono,monospace" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">N</text>
  </svg>
`;

export const thalesQuiz: QuizDefinition<ThalesExercise> = {
  id: 'thales',
  available: true,
  title: 'Théorème de Thalès',
  // No titleSub: original Site.html:1171 wraps the entire title in a single gradient
  // with no muted span, unlike Pythagore which splits "Théorème de" + "Pythagore".
  titleFontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
  subtitle: '6 questions · 4 calculs + 2 exercices à compléter',
  notice: '<span style="color:#34D399;font-weight:600;">🧮&nbsp; Calculatrice nécessaire</span>',
  category: 'Géométrie',
  accent: '#FB923C',
  accentSecondary: '#FCD34D',
  icon: '∥',
  description: 'Trouver une longueur inconnue dans des triangles emboîtés en appliquant les rapports de Thalès.',
  tags: ['6 questions', 'Figures', 'Génération aléatoire'],
  renderer: 'thales',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  formulaBanner: {
    html: FORMULA_BANNER_HTML,
    bannerStyle: {
      maxWidth: '640px',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      textAlign: 'left',
      padding: '1.4rem 2rem',
      marginBottom: '2.5rem',
    },
  },
};
