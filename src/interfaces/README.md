# Dossier `src/interfaces`

Ce dossier contient les interfaces et types partagés du projet.

- **But** : centraliser les contrats TypeScript utilisés dans plusieurs modules (API, composants, services…).
- **Organisation** :
  - Crée un fichier par domaine métier (`user.interface.ts`, `auth.types.ts`, etc.).
  - Évite les interfaces génériques fourre-tout (`common.ts`).
- **Bonnes pratiques** :
  - Préfère les `type`/`interface` réutilisables plutôt que de dupliquer les formes d’objets.
  - N’exporte que ce qui est réellement utilisé en dehors du fichier.
  - Garde les noms explicites (`UserProfile`, `AuthTokenPayload`, etc.).
