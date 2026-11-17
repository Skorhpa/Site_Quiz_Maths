import { useState } from 'react';
import { ModeCard } from './FractionsHub';
import { ProportionnaliteReconnaitreVivid } from './ProportionnaliteReconnaitreVivid';
import { ProportionnaliteSansTableauVivid } from './ProportionnaliteSansTableauVivid';
import { ProportionnaliteUtiliserAvecVivid } from './ProportionnaliteUtiliserAvecVivid';

type TopMode = 'reconnaitre' | 'utiliser' | null;
type SubMode = 'sans-tableau' | 'avec-tableau' | null;

const TOP_MODES: { id: Exclude<TopMode, null>; label: string; icon: string; desc: string }[] = [
  { id: 'reconnaitre', label: 'Reconnaître une situation de proportionnalité', icon: '=', desc: "2 options : sans tableau ou avec tableau" },
  { id: 'utiliser', label: 'Utiliser une situation de proportionnalité', icon: '→', desc: "2 options : sans tableau ou avec tableau" },
];

/**
 * 6ème Proportionnalité: two quiz (Reconnaître / Utiliser), each with a « sans tableau » and an « avec tableau » option.
 * The four exercise pages share the redesigned look (ProportionnaliteVividKit), each with its own « ← Retour » button.
 */
export function ProportionnaliteHub6eme({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [topMode, setTopMode] = useState<TopMode>(null);
  const [subMode, setSubMode] = useState<SubMode>(null);

  if (topMode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {TOP_MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => setTopMode(m.id)} />
        ))}
      </div>
    );
  }

  const topLabel = TOP_MODES.find((m) => m.id === topMode)?.label ?? '';

  if (subMode === null) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button type="button" className="btn-secondary" onClick={() => setTopMode(null)} style={{ fontSize: 13 }}>
            ← Retour
          </button>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>{topLabel}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
          <ModeCard
            label="Sans tableau"
            icon="✎"
            desc="Situations et problèmes en contexte, sans tableau de valeurs"
            accent={accent}
            onClick={() => setSubMode('sans-tableau')}
          />
          <ModeCard
            label="Avec tableau"
            icon="▦"
            desc="Les mêmes exercices que dans le quiz Proportionnalité des 5ème"
            accent={accent}
            onClick={() => setSubMode('avec-tableau')}
          />
        </div>
      </div>
    );
  }

  const back = () => setSubMode(null);

  if (subMode === 'sans-tableau') {
    return <ProportionnaliteSansTableauVivid mode={topMode} accent={accent} onBack={back} />;
  }
  if (topMode === 'reconnaitre') {
    return <ProportionnaliteReconnaitreVivid accent={accent} accentSecondary={accentSecondary} onBack={back} />;
  }
  return <ProportionnaliteUtiliserAvecVivid accent={accent} accentSecondary={accentSecondary} onBack={back} />;
}
