import { CacheActions } from "@/components/serverCache/CacheActions";
import { DeleteCacheForm } from "@/components/serverCache/DeleteCacheForm";
import { GetCacheForm } from "@/components/serverCache/GetCacheForm";
import { MutateForm } from "@/components/serverCache/MutateForm";
import { RevalidateForm } from "@/components/serverCache/RevalidateForm";
import { SetCacheForm } from "@/components/serverCache/SetCacheForm";
import { cacheManager } from "@/libs/cacheManager";

export default function ServerCachePage() {
  // Mettre des valeurs par défaut en cache
  const defaultKey = "demo:example";
  const defaultData = {
    message: "Bienvenue sur le gestionnaire de cache!",
    timestamp: new Date().toISOString(),
    features: ["Cache en mémoire", "Gestion par tags", "TTL configurable"],
    stats: {
      users: 1250,
      products: 450,
      categories: 12,
    },
  };

  // Vérifier si la valeur existe déjà, sinon la créer
  if (!cacheManager.has(defaultKey)) {
    cacheManager.set(defaultKey, defaultData, {
      ttl: 3600000, // 1 heure
      tags: ["demo", "example"],
    });
  }

  // Récupérer la valeur du cache
  const cachedData = cacheManager.get<typeof defaultData>(defaultKey);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gestionnaire de Cache Serveur
          </h1>
          <p className="text-gray-600">
            Démonstration du système de cache en mémoire avec gestion par clés
            et tags
          </p>
        </div>

        {/* Affichage de la valeur en cache côté serveur */}
        {cachedData && (
          <div className="mb-6 border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  📦 Données en cache (Server-Side)
                </h2>
                <p className="text-sm text-gray-600">
                  Clé:{" "}
                  <code className="bg-white px-2 py-1 rounded text-blue-600">
                    {defaultKey}
                  </code>
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                Actif
              </span>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Contenu:
              </h3>
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(cachedData, null, 2)}
              </pre>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Message</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {cachedData.message}
                </p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Utilisateurs</p>
                <p className="text-sm font-semibold text-gray-800">
                  {cachedData.stats.users}
                </p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Produits</p>
                <p className="text-sm font-semibold text-gray-800">
                  {cachedData.stats.products}
                </p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Catégories</p>
                <p className="text-sm font-semibold text-gray-800">
                  {cachedData.stats.categories}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                🏷️ Tags:
                {["demo", "example"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </span>
              <span className="ml-auto">⏱️ TTL: 1 heure</span>
            </div>
          </div>
        )}

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 <strong>Astuce:</strong> Les données ci-dessus sont récupérées
            directement du cache côté serveur. Essayez de les modifier avec les
            formulaires ci-dessous en utilisant la clé{" "}
            <code className="bg-white px-2 py-0.5 rounded">{defaultKey}</code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SetCacheForm />
          <GetCacheForm />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DeleteCacheForm />
          <RevalidateForm />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MutateForm />
          <CacheActions />
        </div>
      </div>
    </div>
  );
}
