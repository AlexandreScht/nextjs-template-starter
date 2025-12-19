# Documentation des Services

Ce projet utilise une architecture de services centralisée pour gérer les appels API de manière cohérente, que ce soit côté client (avec React Query) ou côté serveur (SSR/RSC).

## 📂 Structure

- **`src/services/`** : Contient les définitions des services (logique métier, appels API).
- **`src/hooks/useService.ts`** : Hook pour consommer les services côté client avec React Query.
- **`src/hooks/serverService.ts`** : Helper pour consommer les services côté serveur (Server Components).
- **`src/hooks/providers/`** : Fournisseurs de contexte pour l'injection de dépendances.

## 🛠️ Créer un Service

1.  **Définir la classe de service** dans `src/services/` (ex: `users.service.ts`).
2.  Le service doit accepter `ApiClient` dans son constructeur.

```typescript
// src/services/users.service.ts
export class UsersService {
  constructor(private apiClient: ApiClient) {}

  async getUsers() {
    return (await this.apiClient.get<User[]>("/api/users")).data;
  }

  async createUser(data: CreateUserDto) {
    return (await this.apiClient.post<User>("/api/users", data)).data;
  }
}
```

3.  **Enregistrer le service** dans `src/services/index.ts`.

```typescript
// src/services/index.ts
export const createServices = (apiClient: ApiClient) => {
  return {
    // ... autres services
    users: new UsersService(apiClient),
  };
};
```

## 🚀 Utilisation

### 1. Côté Client (`useService`, `useMutation`)

#### Lecture de données (`useQuery`)

Utilisez le hook `useService` pour bénéficier de la gestion d'état de React Query (cache, loading, error).

```typescript
"use client";
import { useService } from "@/hooks/useService";

export function UsersList() {
  // Le premier argument sélectionne la méthode du service
  // Le second argument sont les options (queryKey, enabled, staleTime, etc.)
  const { data, isLoading, refetch } = useService((services) => services.users.getUsers(), {
    queryKey: ["users"],
    staleTime: 5 * 60 * 1000, // Données fraîches pendant 5 minutes
    // requestConfig: { ... } // Options Axios si besoin
  });

  if (isLoading) return <div>Chargement...</div>;

  return <ul>{data?.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

#### Mutation de données (`useMutation`)

Pour les opérations d'écriture (POST, PUT, DELETE), utilisez directement `useMutation` de `@tanstack/react-query` en combinaison avec votre service.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServiceInstance } from "@/hooks/useService"; // Helper pour accéder aux services sans fetch

export function CreateUserForm() {
  const queryClient = useQueryClient();
  const userService = useServiceInstance((s) => s.users); // Récupère l'instance du service

  const mutation = useMutation({
    mutationFn: (newUser) => userService.createUser(newUser),
    onSuccess: () => {
      // Invalider le cache React Query pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("Utilisateur créé !");
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <button onClick={() => handleSubmit({ name: "John" })} disabled={mutation.isPending}>
      {mutation.isPending ? "Création..." : "Créer"}
    </button>
  );
}
```

### 2. Côté Serveur (`callService`)

Utilisez `callService` dans les Server Components pour les appels directs. Cela configure automatiquement `fetch` avec le cache Next.js. **Important :** Pour que le cache serveur fonctionne, vos endpoints API doivent utiliser `fetch` ou être compatibles avec le cache Next.js (si externe).

```typescript
// src/app/users/page.tsx
import { callService } from "@/hooks/serverService";

export default async function UsersPage() {
  // Appel direct avec configuration du cache Next.js
  const users = await callService((services) => services.users.getUsers(), {
    next: { revalidate: 3600, tags: ['users'] } // Cache pendant 1h, tag 'users'
  });

  return (
    <main>
      <h1>Utilisateurs</h1>
      {/* ... */}
    </main>
  );
}
```

### 3. Gestion du Cache Serveur (`revalidateCache`)

Pour invalider le cache serveur (Next.js Data Cache) à la demande (ex: après une modification en base de données), utilisez la Server Action `revalidateCache` située dans `src/actions/revalidateCache.ts`.

#### Comment ça marche ?

Next.js met en cache les résultats des `fetch` marqués avec des tags ou sur des routes spécifiques. Pour mettre à jour ces données avant leur expiration naturelle (`revalidate`), il faut "invalider" le cache.

#### Utilisation dans un composant Client

```typescript
"use client";
import { revalidateCache } from "@/actions/revalidateCache";

export function RefreshButton() {
  const handleRefresh = async () => {
    // Invalider par TAG (recommande)
    await revalidateCache("tag", "users");

    // OU Invalider par PATH (chemin de la page)
    // await revalidateCache("page", "/users");

    console.log("Cache serveur invalidé !");
  };

  return <button onClick={handleRefresh}>Rafraîchir Cache Serveur</button>;
}
```

#### Utilisation après une mutation Serveur (Server Action)

Si vous créez vos propres Server Actions pour modifier des données :

```typescript
// src/app/actions/user.actions.ts
"use server";
import { revalidateCache } from "@/actions/revalidateCache";

export async function createUserAction(data) {
  // 1. Sauvegarder en BDD...
  // db.users.create(data);

  // 2. Invalider le cache pour que les pages affichent la nouvelle donnée
  await revalidateCache("tag", "users");
}
```

## 📊 Debugging avec `useServicesEvent`

Pour surveiller l'activité réseau de l'application (client-side) en temps réel, vous pouvez utiliser le hook `useServicesEvent`. Il permet d'accéder au statut global des requêtes Axios.

### Fonctionnalités

- **`isLoading`** : `boolean` - Indique si une requête est en cours.
- **`lastDuration`** : `{ url: string, duration: number }` - Durée de la dernière requête.
- **`lastNotification`** : `{ type: 'success' | 'error', message: string }` - Dernier message (erreur 4xx/5xx ou succès).

### Exemple d'implémentation (`ServiceEventPanel`)

```typescript
import { useServicesEvent } from "@/hooks/useServicesEvent";

export function NetworkStatus() {
  const { isLoading, lastDuration, lastNotification } = useServicesEvent();

  return (
    <div>
      <p>Status: {isLoading ? "Chargement..." : "Idle"}</p>
      {lastDuration && (
        <p>Dernière requête: {lastDuration.url} ({lastDuration.duration.toFixed(0)}ms)</p>
      )}
      {lastNotification && (
        <p className={lastNotification.type === 'error' ? 'text-red-500' : 'text-green-500'}>
          {lastNotification.message}
        </p>
      )}
    </div>
  );
}
```

## ⚡ Résumé des flux de données

| Contexte    | Lecture (GET)                      | Écriture (POST/PUT)                   | Gestion du Cache                               |
| :---------- | :--------------------------------- | :------------------------------------ | :--------------------------------------------- |
| **Client**  | `useService` (React Query)         | `useMutation` + `services.xyz.method` | `queryClient.invalidateQueries` (Client Cache) |
| **Serveur** | `callService` (Fetch + Next Cache) | Server Actions ou API Routes          | `revalidateCache` (Server Cache)               |

Utilisez ces outils conjointement pour une expérience optimale : le cache **Client** pour la fluidité de l'UI (pas de rechargement de page), et le cache **Serveur** pour la performance initiale (SSR) et la réduction de charge backend.
