# Dossier `src/styles`

Ce dossier regroupe tout ce qui concerne le style et la présentation de l’application.

- **But** : centraliser les styles réutilisables (variables, thèmes, mixins, helpers CSS/SCSS, classes utilitaires, etc.).
- **Organisation** :
  - Sépare par type ou domaine (`components`, `themes`, `mixins`, etc.).
  - Évite de dupliquer les mêmes couleurs/espacements dans plusieurs fichiers : factorise-les.
- **Bonnes pratiques** :
  - Définis des **tokens de design** (couleurs, spacing, typo) et réutilise-les partout.
  - Garde une convention de nommage cohérente (BEM, utility-first, ou autre, mais choisie).
  - Ne mélange pas logique JS/TS et styles : importe les styles depuis les composants, pas l’inverse.
