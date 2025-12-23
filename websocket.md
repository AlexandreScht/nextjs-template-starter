# Documentation WebSocket

Ce document explique l'architecture et l'utilisation des WebSockets dans ce projet Next.js. L'implémentation utilise `socket.io-client` et l'API Context de React pour une intégration fluide.

## 📂 Structure du Code

L'implémentation est divisée en plusieurs fichiers clés pour assurer la maintenabilité et le typage fort :

- **`src/providers/SocketProvider.tsx`** : Le composant principal qui initialise la connexion Socket.IO et expose le contexte. Il gère le cycle de vie de la connexion et les abonnements.
- **`src/libs/SocketEvents.ts`** : Contient la classe `SocketEvents` (pour émettre des événements) et l'objet constant `EVENTS` qui liste tous les noms d'événements possibles.
- **`src/interfaces/SocketContext.ts`** : Définit les types pour le contexte et le hook `useSocket`.
- **`src/interfaces/SocketTypes.ts`** : Définit le typage des données (payloads) pour chaque événement. C'est ici que l'on assure la sécurité du typage.
- **`src/config/socket.config.ts`** : Configuration de base du client Socket.IO (URL, options de reconnexion, etc.).

## 🚀 Utilisation

### 1. Configuration

Le `SocketProvider` doit envelopper votre application (ou la partie qui a besoin des sockets) dans `src/app/layout.tsx` ou un layout spécifique.

```tsx
import { SocketProvider } from "@/providers/SocketProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
```

### 2. Le Hook `useSocket`

Dans n'importe quel composant client (`"use client"`), vous pouvez utiliser le hook `useSocket` pour accéder aux fonctionnalités WebSocket.

```tsx
"use client";
import { useSocket } from "@/providers/SocketProvider";

export default function MonComposant() {
  const { socket, events, isConnected, subscribe } = useSocket();
  
  // ...
}
```

L'objet retourné contient :
- `socket`: L'instance brute de Socket.IO (rarement nécessaire directement).
- `events`: Une instance de la classe `SocketEvents` pour envoyer des messages.
- `isConnected`: Un booléen indiquant l'état de la connexion.
- `subscribe`: Une fonction pour écouter les événements entrants.

### 3. Écouter des événements (`subscribe`)

La fonction `subscribe` est fortement typée. Elle prend le nom de l'événement et un callback. Elle retourne une fonction de nettoyage (`unsubscribe`) à appeler lors du démontage du composant.

```tsx
import { EVENTS } from "@/libs/SocketEvents";
import { useEffect } from "react";

useEffect(() => {
  if (!socket) return;

  // Abonnement à l'événement RECEIVE_MESSAGE
  const unsubscribe = subscribe(EVENTS.ON.RECEIVE_MESSAGE, (data) => {
    // 'data' est automatiquement typé ici !
    console.log("Nouveau message:", data.message);
  });

  // Nettoyage à la destruction du composant
  return () => {
    unsubscribe();
  };
}, [socket, subscribe]);
```

### 4. Envoyer des événements (`events`)

Utilisez l'objet `events` pour émettre des messages vers le serveur. Les méthodes disponibles sont définies dans la classe `SocketEvents`.

```tsx
const envoyerMessage = () => {
  if (events) {
    events.sendMessage("Bonjour le monde !");
  }
};
```

## 🛠 Ajouter un nouvel événement

Pour ajouter un nouveau type d'événement, suivez ces étapes pour maintenir le typage :

1.  **Définir le nom de l'événement** dans `src/libs/SocketEvents.ts` :
    ```typescript
    export const EVENTS = {
        EMIT: {
            // ...
            NEW_ACTION: "new_action", // Nouvel événement sortant
        },
        ON: {
            // ...
            USER_UPDATED: "user_updated", // Nouvel événement entrant
        },
    } as const;
    ```

2.  **Définir le type de données** dans `src/interfaces/SocketTypes.ts` :
    ```typescript
    export type SocketEventPayloads = {
        // ...
        [EVENTS.EMIT.NEW_ACTION]: { actionId: string };
        [EVENTS.ON.USER_UPDATED]: { userId: string; status: string };
    };
    ```

3.  **Ajouter la méthode d'envoi** (si c'est un événement sortant) dans la classe `SocketEvents` (`src/libs/SocketEvents.ts`) :
    ```typescript
    public sendNewAction(actionId: string) {
        if (this.socket) {
            this.socket.emit(EVENTS.EMIT.NEW_ACTION, { actionId });
        }
    }
    ```

Une fois ces étapes effectuées, l'autocomplétion et la vérification de type fonctionneront automatiquement dans vos composants.
