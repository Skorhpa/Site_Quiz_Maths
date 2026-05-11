import type { GeneratorSpec, QuizDefinition, ReciproqueExercise } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'reciproque' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as ReciproqueExercise[];

const FORMULA_BANNER_HTML = `
  <div style="font-size:13px;font-weight:700;color:var(--crp);letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">Rappels</div>
  <div style="font-size:13px;line-height:1.9;color:var(--text);margin-bottom:10px;">
    <strong>Réciproque du théorème de Pythagore :</strong><br>
    Si dans un triangle ABC, AB² = AC² + BC², alors le triangle ABC est rectangle en C.
  </div>
  <div style="font-size:13px;line-height:1.9;color:var(--text);margin-bottom:12px;">
    <strong>Contraposée du théorème de Pythagore :</strong><br>
    Si dans un triangle ABC, AB² ≠ AC² + BC², alors le triangle ABC n'est pas rectangle.
  </div>
  <div style="font-size:13px;font-weight:700;color:var(--crp);margin-bottom:6px;">Exemple :</div>
  <div style="font-size:13px;line-height:1.9;color:var(--muted);">
    Triangle ABC avec AB = 5, AC = 3, BC = 4. Le plus grand côté est [AB].<br>
    <span style="font-family:'DM Mono',monospace;">AB² = 5² = 25</span><br>
    <span style="font-family:'DM Mono',monospace;">AC² + BC² = 3² + 4² = 9 + 16 = 25</span><br>
    AB² = AC² + BC², donc d'après la <strong style="color:var(--crp);">réciproque</strong> du théorème de Pythagore,
    le triangle ABC est <strong style="color:var(--crp);">rectangle en C</strong>.
  </div>
`;

export const recipQuiz: QuizDefinition<ReciproqueExercise> = {
  id: 'recip',
  available: true,
  title: 'Réciproque du théorème de Pythagore',
  titleSub: 'du théorème de Pythagore',
  subtitle: '3 exercices · Tableau · Triangle rectangle · Triangle non rectangle',
  category: 'Géométrie',
  accent: '#A78BFA',
  accentSecondary: '#c4b5fd',
  icon: '△',
  description: "Démontrer qu'un triangle est rectangle (ou ne l'est pas) en utilisant la réciproque et la contraposée du théorème de Pythagore.",
  tags: ['3 exercices', 'Texte à trous', 'Génération aléatoire'],
  renderer: 'reciproque',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  formulaBanner: {
    html: FORMULA_BANNER_HTML,
    bannerStyle: {
      background: 'var(--surface2)',
      borderRadius: 'var(--radius)',
      padding: '1.2rem 1.4rem',
      marginBottom: '2rem',
      borderLeft: '3px solid var(--crp)',
      border: '0',
      maxWidth: '700px',
      textAlign: 'left',
    },
  },
};
