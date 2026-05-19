import type { GeneratorSpec, QuizDefinition, ThalesReciproqueExercise } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'thales-reciproque' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as ThalesReciproqueExercise[];

const FORMULA_BANNER_HTML = `
  <div style="flex:1;">
    <p style="font-size:12px;color:var(--muted);margin-bottom:10px;letter-spacing:.06em;text-transform:uppercase;">Rappel — réciproque du théorème de Thalès</p>
    <p style="font-size:13px;color:var(--muted);line-height:1.7;">Si M ∈ [SA] et N ∈ [SB], et si <span style="color:#FB923C;">SM/SA = SN/SB</span>, alors (MN) ∥ (AB).</p>
    <p style="font-size:13px;color:var(--muted);line-height:1.7;margin-top:6px;">Sinon (SM/SA ≠ SN/SB), d'après la <strong>contraposée</strong>, (MN) et (AB) ne sont pas parallèles.</p>
  </div>
  <svg width="130" height="148" viewBox="0 0 130 148" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
    <polygon points="65,8 10,140 120,140" fill="rgba(251,146,60,0.07)" stroke="#FB923C" stroke-width="1.5"/>
    <line x1="32" y1="84" x2="98" y2="84" stroke="#60A5FA" stroke-width="1.5"/>
    <text x="65" y="28" fill="#F0EDE8" font-family="DM Mono,monospace" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">S</text>
    <text x="6" y="132" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">A</text>
    <text x="122" y="132" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">B</text>
    <text x="24" y="76" fill="#60A5FA" font-family="DM Mono,monospace" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">M</text>
    <text x="106" y="76" fill="#60A5FA" font-family="DM Mono,monospace" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">N</text>
  </svg>
`;

export const recipThalesQuiz: QuizDefinition<ThalesReciproqueExercise> = {
  id: 'recip-thales',
  available: true,
  title: 'Réciproque du théorème de Thalès',
  titleFontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
  subtitle: '4 exercices · démontrer le parallélisme (ou non)',
  category: 'Géométrie',
  accent: '#FB923C',
  accentSecondary: '#FCD34D',
  icon: '⟺',
  description: 'Démontrer que deux droites sont parallèles (ou non) en comparant deux rapports de segments.',
  tags: ['4 exercices', 'Raisonnement', 'Génération aléatoire'],
  renderer: 'thales-reciproque',
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
