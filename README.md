# SiteMath

Quiz et exercices de mathématiques pour le programme français, du collège au
lycée. Site statique, pas de compte, pas de tracking — chaque visiteur reçoit
une nouvelle série d'exercices à chaque chargement.

L'architecture supporte tous les niveaux du collège au lycée (6ᵉ → Terminale) ;
seule la **4ᵉ** est aujourd'hui activée, le reste est en place mais en mode
verrouillé en attendant d'être rempli.

---

## Stack

- [Astro 5](https://astro.build/) — routing, build statique
- [React 19](https://react.dev/) — composants interactifs (îlots Astro)
- TypeScript strict
- Pas de backend, pas de base de données, déploiement Vercel / GitHub Pages

---

## Prérequis

- **Node.js ≥ 18** (testé sur Node 24)
- **npm ≥ 9**

---

## Installation

```bash
git clone https://github.com/Skorhpa/Site_Quiz_Maths.git SiteMath
cd SiteMath
npm install
```

---

## Scripts

| Commande           | Description                                                  |
|--------------------|--------------------------------------------------------------|
| `npm run dev`      | Lance le serveur de dev sur http://localhost:4321            |
| `npm run build`    | Génère le site statique dans `./dist`                        |
| `npm run preview`  | Sert `./dist` localement pour test                           |
| `npx astro check`  | Vérifie le typage TS et les fichiers `.astro`                |
| `npx astro sync`   | Régénère les types Astro (`.astro/types.d.ts`)               |

---

## Structure du projet

```
SiteMath/
├── CLAUDE.md                   # règles à respecter pour étendre le projet
├── docs/FUTURE.md              # fonctionnalités planifiées (login, scores, etc.)
└── src/
    ├── pages/                  # routes Astro
    │   ├── index.astro         # / — sélection de niveau (redirige si un seul actif)
    │   └── [level]/
    │       ├── index.astro     # /<niveau> — grille des thèmes
    │       └── [topic].astro   # /<niveau>/<thème> — quiz interactif
    ├── components/
    │   ├── Quiz.tsx            # composant générique partagé par tous les quiz
    │   └── questions/          # un renderer React par type de question
    ├── data/
    │   ├── levels.ts           # registre des niveaux scolaires
    │   └── quizzes/<niveau>/   # un fichier TS par thème
    ├── styles/global.css       # feuille de style unique
    ├── layouts/BaseLayout.astro
    └── types.ts                # contrat QuizDefinition / Exercise / GeneratorSpec
```

---

## État du contenu

| Niveau     | Statut       | Thèmes portés / total |
|------------|--------------|-----------------------|
| 6ᵉ         | À venir      | —                     |
| 5ᵉ         | À venir      | —                     |
| **4ᵉ**     | **Complet ✓** | 12 / 12 + sous-quiz Calcul littéral complexe + sous-quiz Calculs complexes de fractions |
| 3ᵉ         | À venir      | —                     |
| Seconde    | À venir      | —                     |
| Première   | À venir      | —                     |
| Terminale  | À venir      | —                     |

Les thèmes non encore portés s'affichent quand même sur la page du niveau, en
mode verrouillé (badge "Bientôt").

---

## Étendre le projet

Tout est documenté dans [CLAUDE.md](./CLAUDE.md) :

- ajouter un quiz à un niveau existant
- ajouter un nouveau niveau
- ajouter un nouveau type de question (renderer)
- palette de couleurs canoniques (verrouillée)
- structure de page (verrouillée)
- règles comportementales (verrouillées)

**TL;DR** pour ajouter un quiz simple :

1. S'inspirer d'un quiz existant en 4ᵉ ([`src/data/quizzes/4eme/`](src/data/quizzes/4eme/))
   pour la structure (couleur, icône, titre, sous-titre, exercices).
2. Créer `src/data/quizzes/<niveau>/<id>.ts` exportant un `QuizDefinition`.
3. Le déclarer dans `src/data/quizzes/<niveau>/index.ts` (en remplaçant le stub
   correspondant).
4. `npx astro check && npx astro build` → 0 erreurs / 0 warnings.

---

## Déploiement

### Vercel (recommandé)

1. Connecter le dépôt GitHub à Vercel.
2. Aucun réglage particulier — Vercel détecte Astro automatiquement (build
   command `npm run build`, output directory `dist/`).
3. Chaque push sur `main` déploie en production. Les autres branches ont des
   previews automatiques.

### GitHub Pages

```bash
npm run build
# pousser le contenu de ./dist/ vers la branche gh-pages
```

Comme le projet est purement statique, **aucune limite de taux ni
authentification n'est nécessaire** côté hébergement. Voir
[`docs/FUTURE.md`](./docs/FUTURE.md) pour les fonctionnalités qui en auraient
besoin (comptes étudiants, suivi des scores).

---

## Performance

À titre indicatif (build local, gzip) :

- Bundle React + Quiz island : ~58 kB gzipped
- Page `/<niveau>/<thème>` : HTML ~5 kB + JS ~60 kB
- Pages d'index (niveaux, thèmes) : 100 % statiques, 0 JS

Le build complet (12 niveaux + 1 quiz fonctionnel) compile en ~900 ms.

---

## Licence

À définir.
