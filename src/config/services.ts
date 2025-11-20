export const securityConfig = {
    // Politique de Referrer par défaut (Standard moderne de sécurité)
    referrerPolicy: "strict-origin-when-cross-origin" as ReferrerPolicy,

    // Liste des domaines externes autorisés pour le SSR
    // Si une URL n'est pas ici et n'est pas interne, la requête sera bloquée (mode: 'same-origin')
    allowedCorsOrigins: [
        "https://api.stripe.com",
        "https://auth.monservice.com",
        // Ajoutez vos services tiers ici
    ],
};
