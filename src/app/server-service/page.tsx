import { callService } from "@/hooks/serverService";

export default async function ServerServicePage() {
  const response = await callService(
    (services) => services.users.getUsersWithCacheProof(),
    {
      next: { revalidate: 25 },
    },
  );

  const now = new Date();
  const generatedDate = new Date(response.generatedAt);

  const dataAgeMs = now.getTime() - generatedDate.getTime();
  const dataAgeSeconds = (dataAgeMs / 1000).toFixed(2);
  const isCached = dataAgeMs > 1000;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test du Cache SSR</h1>

      <div
        className={`p-6 rounded-lg border shadow-sm ${
          isCached
            ? "bg-orange-50 border-orange-200"
            : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-700 font-bold flex items-center gap-2">
            Statut :
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                isCached
                  ? "bg-orange-200 text-orange-800"
                  : "bg-emerald-200 text-emerald-800"
              }`}
            >
              {isCached ? "CACHE Values" : "REQUEST values"}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/60 p-3 rounded">
            <p className="text-gray-500 uppercase text-xs font-bold">
              Heure du rendu page
            </p>
            <p className="text-xl text-gray-500 font-mono">
              {now.toLocaleTimeString("fr-FR")}
            </p>
            <p className="text-xs text-gray-400 mt-1">{now.toISOString()}</p>
          </div>
          <div className="bg-white/60 p-3 rounded">
            <p className="text-gray-500 uppercase text-xs font-bold">
              Heure génération donnée
            </p>
            <p className="text-xl text-gray-500 font-mono">
              {generatedDate.toLocaleTimeString("fr-FR")}
            </p>
            <p className="text-xs text-gray-400 mt-1">{response.generatedAt}</p>
          </div>
        </div>

        <div className="mt-4 text-gray-700">
          <p>
            <strong>Âge de la donnée :</strong> {dataAgeSeconds}s
          </p>
        </div>
      </div>

      {/* ... reste de la section d'explication inchangée ... */}
      <section className="mt-8 p-4 bg-gray-50 rounded border text-sm text-gray-600 space-y-2">
        <p>Rechargez la page pour voir le cache en action.</p>
      </section>
    </main>
  );
}
