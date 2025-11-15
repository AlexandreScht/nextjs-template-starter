# Dossier `src/utils`

Ce dossier contient les petites fonctions utilitaires génériques (pas liées au métier).

- **But** : regrouper les helpers réutilisables (formatage, dates, strings, nombres, validations simples, etc.).
- **Organisation** :
  - Regroupe par thème (`date.utils.ts`, `string.utils.ts`, `number.utils.ts`, etc.).
  - Évite les gros fichiers "fourre-tout".
- **Bonnes pratiques** :
  - Garde les fonctions pures, sans accès direct au DOM ou au réseau.
  - N’utilise pas ici de logique métier spécifique (réserve-la à `libs`).
  - Ajoute des tests unitaires pour les fonctions non triviales.
