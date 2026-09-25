import { useState } from 'react';
import { ModeCard } from './FractionsHub';
import { DecimauxHub } from './DecimauxHub';
import { DecimauxReperageHub } from './DecimauxReperageHub';
import { DecimauxCompareHub } from './DecimauxCompareHub';

type TopMode = 'ecriture' | 'reperage' | 'comparer' | null;

const TOP_MODES: { id: Exclude<TopMode, null>; label: string; icon: string; desc: string }[] = [
  {
    id: 'ecriture',
    label: 'Nombres décimaux : écriture',
    icon: '0,1',
    desc: "3 sous-quiz · Fractions décimales ↔ nombres décimaux · Écriture décimale",
  },
  {
    id: 'reperage',
    label: 'Nombres décimaux : repérage',
    icon: '⟶',
    desc: 'Compléter des graduations, lire des abscisses et placer des points sur une demi-droite graduée.',
  },
  {
    id: 'comparer',
    label: 'Nombres décimaux : comparer et intercaler',
    icon: '<>',
    desc: '2 sous-quiz · Comparer et ranger · Encadrer et intercaler des nombres décimaux',
  },
];

export function DecimauxParentHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [topMode, setTopMode] = useState<TopMode>(null);

  if (topMode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {TOP_MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => setTopMode(m.id)} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={() => setTopMode(null)} style={{ fontSize: 13 }}>
          ← Retour aux nombres décimaux
        </button>
      </div>
      {topMode === 'ecriture' && <DecimauxHub accent={accent} accentSecondary={accentSecondary} />}
      {topMode === 'reperage' && <DecimauxReperageHub accent={accent} accentSecondary={accentSecondary} />}
      {topMode === 'comparer' && <DecimauxCompareHub accent={accent} accentSecondary={accentSecondary} />}
    </div>
  );
}
