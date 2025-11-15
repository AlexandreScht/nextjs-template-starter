# Dossier `src/libs`

Ce dossier regroupe les librairies internes (helpers de haut niveau, services, wrappers d’API…).

- **But** : encapsuler la logique métier ou technique réutilisable (auth, API, stockage, formateurs, etc.).
- **Organisation** :
  - Un fichier ou sous-dossier par "lib" (`apiClient/`, `auth/`, `storage.ts`, etc.).
  - Aucune dépendance vers les composants UI (pas de `React` ici).
- **Bonnes pratiques** :
  - Expose des fonctions/méthodes pures et testables.
  - Garde les signatures simples et tape bien les paramètres et retours.
  - Ne mélange pas plusieurs responsabilités dans un même module.
