# Documentation Server Cache

## Vue d'ensemble

Ce projet implémente un système de **cache en mémoire côté serveur** pour Next.js, permettant de stocker temporairement des données avec une gestion avancée par clés et tags. Le système utilise la bibliothèque `quick-lru` pour un cache LRU (Least Recently Used) performant.

## Architecture

### Structure des fichiers

```
src/
├── libs/
│   └── cacheManager.ts          # Classe principale du gestionnaire de cache
├── config/
│   └── cacheManager.ts          # Configuration par défaut (TTL, taille max)
├── interfaces/
│   └── cacheMemory.d.ts         # Types TypeScript pour le cache
├── actions/
│   └── caching.ts               # Server Actions Next.js
├── app/
│   └── server-cache/
│       └── page.tsx             # Page de démonstration
└── components/
    └── serverCache/
        ├── SetCacheForm.tsx     # Composant pour mettre en cache
        ├── GetCacheForm.tsx     # Composant pour récupérer du cache
        ├── DeleteCacheForm.tsx  # Composant pour supprimer par clé
        ├── RevalidateForm.tsx   # Composant pour supprimer par tags
        ├── MutateForm.tsx       # Composant pour muter le cache
        └── CacheActions.tsx     # Actions globales (clear, cleanup)
```

## Composants principaux

### 1. CacheManager (`src/libs/cacheManager.ts`)

Classe singleton qui gère toutes les opérations de cache.

#### Propriétés

- `cache`: Instance de QuickLRU pour stocker les entrées
- `tagMap`: Map pour associer les tags aux clés de cache
- `defaultTTL`: Durée de vie par défaut (1 heure = 3600000ms)
- `defaultMaxSize`: Taille maximale du cache (1000 entrées)

#### Méthodes principales

##### `get<T>(key: string): T | undefined`
Récupère une valeur du cache. Vérifie automatiquement l'expiration.

```typescript
const userData = cacheManager.get<User>("user:123");
if (userData) {
  console.log(userData.name);
}
```

##### `set<T>(key: string, data: T, config?: CacheConfig): void`
Stocke une valeur dans le cache avec configuration optionnelle.

```typescript
cacheManager.set("user:123", { name: "John", age: 30 }, {
  ttl: 1800000, // 30 minutes
  tags: ["user", "profile"]
});
```

##### `delete(key: string): boolean`
Supprime une entrée et nettoie les tags associés.

```typescript
const deleted = cacheManager.delete("user:123");
```

##### `revalidateByKey(key: string): void`
Alias pour `delete()`, utilisé pour la revalidation.

```typescript
cacheManager.revalidateByKey("user:123");
```

##### `revalidateByTags(tags: string[]): void`
Supprime toutes les entrées associées aux tags spécifiés.

```typescript
// Invalide tous les profils utilisateurs
cacheManager.revalidateByTags(["user", "profile"]);
```

##### `mutateByKey<T>(key: string, value: T | ((oldValue: T) => T)): boolean`
Modifie une entrée existante. Accepte une valeur ou une fonction de transformation.

```typescript
// Remplacement direct
cacheManager.mutateByKey("user:123", { name: "Jane", age: 25 });

// Transformation
cacheManager.mutateByKey("counter", (old) => old + 1);
```

##### `mutateByTags<T>(tags: string[], value: T | ((oldValue: T) => T)): number`
Modifie toutes les entrées avec les tags spécifiés. Retourne le nombre d'entrées mutées.

```typescript
// Met à jour tous les produits d'une catégorie
const count = cacheManager.mutateByTags(
  ["product", "electronics"],
  (product) => ({ ...product, discount: 0.1 })
);
```

##### `clear(): void`
Vide complètement le cache.

```typescript
cacheManager.clear();
```

##### `cleanup(): number`
Nettoie uniquement les entrées expirées. Retourne le nombre d'entrées supprimées.

```typescript
const cleaned = cacheManager.cleanup();
console.log(`${cleaned} entrées expirées supprimées`);
```

##### `has(key: string): boolean`
Vérifie si une clé existe et est valide.

```typescript
if (cacheManager.has("user:123")) {
  // La clé existe et n'est pas expirée
}
```

### 2. Configuration (`src/config/cacheManager.ts`)

Configuration globale du cache.

```typescript
export const cacheManagerConfig = {
  defaultTTL: 3600000,      // 1 heure en millisecondes
  defaultMaxSize: 1000,     // Nombre maximum d'entrées
} satisfies CacheManagerConfig;
```

### 3. Types (`src/interfaces/cacheMemory.d.ts`)

#### CacheConfig
Configuration pour une entrée de cache.

```typescript
interface CacheConfig {
  ttl?: number;        // Durée de vie en millisecondes
  maxSize?: number;    // Taille maximale (non utilisé actuellement)
  tags?: string[];     // Tags pour grouper les entrées
}
```

#### CacheEntry
Structure interne d'une entrée de cache.

```typescript
interface CacheEntry<T = unknown> {
  data: T;             // Données stockées
  timestamp: number;   // Timestamp de création
  ttl: number;         // TTL en millisecondes
  tags: string[];      // Tags associés
}
```

#### CacheActionResult
Type de retour pour toutes les Server Actions.

```typescript
interface CacheActionResult {
  success: boolean;    // Succès de l'opération
  message: string;     // Message de feedback
  data?: unknown;      // Données optionnelles
}
```

### 4. Server Actions (`src/actions/caching.ts`)

Actions serveur Next.js pour interagir avec le cache depuis les composants client.

Toutes les actions retournent un objet `CacheActionResult`.

#### Actions disponibles

- `getCacheValue(key: string)`
- `setCacheValue(key: string, value: string, ttl?: number, tags?: string[])`
- `deleteCacheByKey(key: string)`
- `revalidateByTags(tagsString: string)`
- `mutateCacheByKey(key: string, newValue: string)`
- `mutateCacheByTags(tagsString: string, newValue: string)`
- `clearCache()`
- `cleanupCache()`

## Cas d'usage

### 1. Cache de données API

```typescript
// Dans une Server Action ou Route Handler
async function getUserData(userId: string) {
  const cacheKey = `user:${userId}`;
  
  // Vérifier le cache
  let userData = cacheManager.get<User>(cacheKey);
  
  if (!userData) {
    // Appel API si non en cache
    userData = await fetchUserFromAPI(userId);
    
    // Mettre en cache pour 30 minutes
    cacheManager.set(cacheKey, userData, {
      ttl: 1800000,
      tags: ["user", "profile"]
    });
  }
  
  return userData;
}
```

### 2. Invalidation groupée

```typescript
// Invalider tous les produits d'une catégorie
async function updateCategory(categoryId: string) {
  // Mettre à jour la base de données
  await updateCategoryInDB(categoryId);
  
  // Invalider le cache de tous les produits de cette catégorie
  cacheManager.revalidateByTags([`category:${categoryId}`, "product"]);
}
```

### 3. Mutation optimiste

```typescript
// Mettre à jour le cache sans appel API
async function incrementViewCount(productId: string) {
  const cacheKey = `product:${productId}`;
  
  // Incrémenter dans le cache
  cacheManager.mutateByKey(cacheKey, (product) => ({
    ...product,
    views: product.views + 1
  }));
  
  // Synchroniser avec la DB en arrière-plan
  updateViewCountInDB(productId);
}
```

### 4. Session utilisateur temporaire

```typescript
// Stocker une session temporaire
function createTempSession(sessionId: string, data: SessionData) {
  cacheManager.set(`session:${sessionId}`, data, {
    ttl: 900000, // 15 minutes
    tags: ["session"]
  });
}

// Nettoyer toutes les sessions expirées
function cleanupSessions() {
  const cleaned = cacheManager.cleanup();
  console.log(`${cleaned} sessions expirées supprimées`);
}
```

### 5. Cache de calculs coûteux

```typescript
async function getComplexReport(params: ReportParams) {
  const cacheKey = `report:${JSON.stringify(params)}`;
  
  let report = cacheManager.get<Report>(cacheKey);
  
  if (!report) {
    // Calcul coûteux
    report = await generateComplexReport(params);
    
    // Cache pour 1 heure
    cacheManager.set(cacheKey, report, {
      ttl: 3600000,
      tags: ["report", `user:${params.userId}`]
    });
  }
  
  return report;
}
```

## Bonnes pratiques

### 1. Nommage des clés

Utilisez une convention cohérente pour les clés:

```typescript
// ✅ Bon
"user:123"
"product:456:details"
"cart:session:abc123"

// ❌ Mauvais
"123"
"productData"
"temp_cache_item"
```

### 2. Utilisation des tags

Groupez les entrées liées avec des tags:

```typescript
cacheManager.set("product:123", productData, {
  tags: ["product", "category:electronics", "brand:apple"]
});

// Permet d'invalider facilement
cacheManager.revalidateByTags(["category:electronics"]);
```

### 3. Gestion du TTL

Adaptez le TTL selon la nature des données:

```typescript
// Données statiques: TTL long
cacheManager.set("config", data, { ttl: 86400000 }); // 24h

// Données utilisateur: TTL moyen
cacheManager.set("user:123", data, { ttl: 3600000 }); // 1h

// Données temps réel: TTL court
cacheManager.set("stock:456", data, { ttl: 60000 }); // 1min
```

### 4. Nettoyage périodique

Implémentez un nettoyage automatique:

```typescript
// Dans un cron job ou interval
setInterval(() => {
  const cleaned = cacheManager.cleanup();
  console.log(`Nettoyage automatique: ${cleaned} entrées supprimées`);
}, 300000); // Toutes les 5 minutes
```

### 5. Gestion des erreurs

Toujours gérer les cas où le cache est vide:

```typescript
async function getData(key: string) {
  const cached = cacheManager.get(key);
  
  if (cached) {
    return cached;
  }
  
  // Fallback sur la source de données
  const fresh = await fetchFromDB(key);
  cacheManager.set(key, fresh);
  return fresh;
}
```

## Limitations

### 1. Cache en mémoire uniquement
- Les données sont perdues au redémarrage du serveur
- Non partagé entre plusieurs instances (pas de cache distribué)

### 2. Taille limitée
- LRU évince les entrées les moins récemment utilisées
- Configurer `maxSize` selon la mémoire disponible

### 3. Pas de persistance
- Pour un cache persistant, considérez Redis ou une base de données

### 4. Single-threaded
- Pas de verrouillage pour les accès concurrents
- Convient pour la plupart des cas d'usage Next.js

## Performance

### Complexité temporelle

- `get()`: O(1)
- `set()`: O(1) + O(t) où t = nombre de tags
- `delete()`: O(1) + O(t)
- `revalidateByTags()`: O(k) où k = nombre de clés avec les tags
- `mutateByKey()`: O(1)
- `cleanup()`: O(n) où n = nombre total d'entrées

### Optimisations

1. **Utiliser des tags avec parcimonie**: Chaque tag ajoute une surcharge
2. **Limiter le nombre d'entrées**: Configurer `maxSize` approprié
3. **Nettoyer régulièrement**: Éviter l'accumulation d'entrées expirées
4. **Éviter les grosses valeurs**: Sérialiser/compresser si nécessaire

## Intégration avec Next.js

### Dans les Server Components

```typescript
// app/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = cacheManager.get(`product:${params.id}`) || 
                  await fetchProduct(params.id);
  
  return <ProductDetails product={product} />;
}
```

### Dans les Route Handlers

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = cacheManager.get(`user:${params.id}`);
  
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  return NextResponse.json(user);
}
```

### Avec Server Actions

```typescript
// src/actions/caching.ts
"use server";

import { cacheManager } from "@/libs/cacheManager";
import { revalidatePath } from "next/cache";

export async function updateUser(userId: string, data: UserData) {
  // Mettre à jour la DB
  await updateUserInDB(userId, data);
  
  // Invalider le cache
  cacheManager.revalidateByKey(`user:${userId}`);
  cacheManager.revalidateByTags(["user-list"]);
  
  revalidatePath("/users");
}
```

## Tests

### Exemple de test unitaire

```typescript
import { cacheManager } from "@/libs/cacheManager";

describe("CacheManager", () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  it("should store and retrieve data", () => {
    cacheManager.set("test", { value: 42 });
    const result = cacheManager.get("test");
    expect(result).toEqual({ value: 42 });
  });

  it("should expire data after TTL", async () => {
    cacheManager.set("test", { value: 42 }, { ttl: 100 });
    await new Promise(resolve => setTimeout(resolve, 150));
    const result = cacheManager.get("test");
    expect(result).toBeUndefined();
  });

  it("should revalidate by tags", () => {
    cacheManager.set("item1", { id: 1 }, { tags: ["group"] });
    cacheManager.set("item2", { id: 2 }, { tags: ["group"] });
    cacheManager.revalidateByTags(["group"]);
    
    expect(cacheManager.get("item1")).toBeUndefined();
    expect(cacheManager.get("item2")).toBeUndefined();
  });
});
```

## Dépannage

### Le cache ne fonctionne pas
- Vérifier que le serveur n'a pas redémarré
- Vérifier le TTL (peut-être expiré)
- Vérifier les logs pour les erreurs

### Mémoire élevée
- Réduire `maxSize` dans la configuration
- Implémenter un nettoyage plus fréquent
- Vérifier la taille des données stockées

### Données obsolètes
- Réduire le TTL
- Implémenter une invalidation proactive
- Utiliser des tags pour l'invalidation groupée

## Évolutions futures

1. **Cache distribué**: Support de Redis pour le multi-instance
2. **Compression**: Compression automatique des grandes valeurs
3. **Métriques**: Statistiques d'utilisation (hit rate, miss rate)
4. **Warm-up**: Pré-chargement du cache au démarrage
5. **Stratégies d'éviction**: Support de LFU, FIFO en plus de LRU

## Ressources

- [Quick-LRU Documentation](https://github.com/sindresorhus/quick-lru)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## Composants UI

### SetCacheForm
Formulaire pour mettre des données en cache avec:
- Clé (obligatoire)
- Valeur JSON (obligatoire)
- TTL en secondes (optionnel)
- Tags séparés par virgules (optionnel)

### GetCacheForm
Formulaire pour récupérer et afficher une valeur du cache par sa clé.

### DeleteCacheForm
Formulaire pour supprimer une entrée spécifique par sa clé.

### RevalidateForm
Formulaire pour supprimer toutes les entrées associées à des tags (séparés par virgules).

### MutateForm
Formulaire pour modifier des données en cache:
- Mode "Par clé": Modifie une entrée spécifique
- Mode "Par tags": Modifie toutes les entrées avec les tags spécifiés

### CacheActions
Composant avec actions globales:
- **Nettoyer**: Supprime uniquement les entrées expirées
- **Vider**: Supprime toutes les entrées du cache

## Utilisation dans les composants

### Import des actions

```typescript
import {
  getCacheValue,
  setCacheValue,
  deleteCacheByKey,
  revalidateByTags,
  mutateCacheByKey,
  mutateCacheByTags,
  clearCache,
  cleanupCache,
} from "@/actions/caching";
```

### Exemple d'utilisation

```typescript
"use client";

import { setCacheValue } from "@/actions/caching";
import { useState } from "react";

export function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await setCacheValue(
      "user:123",
      JSON.stringify({ name: "John", age: 30 }),
      3600, // 1 heure
      ["user", "profile"]
    );
    
    if (result.success) {
      console.log(result.message);
    }
    setLoading(false);
  };

  return <button onClick={handleSave}>Sauvegarder</button>;
}
```

---

**Version**: 1.0.1  
**Dernière mise à jour**: Novembre 2024
