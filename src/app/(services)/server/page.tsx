import ServiceBridgeProvider from "@/providers/ServiceBridgeProvider";
import { callService } from "@/hooks/serverService";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import ServerServicePageClient from "../../../components/services-test/clientPage";
import { ServiceEventPanel } from "@/components/services-test/ServiceEventPanel";

export default async function ServerServicePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users", "cache-proof"],
    queryFn: () =>
      callService((services) => services.users.getUsersWithCacheProof(), {
        next: { revalidate: 25 },
      }),
  });

  const steps = [
    "La donnée est pré-fetchée côté serveur (SSR) via `prefetchQuery`.",
    "Le client s'hydrate avec cette donnée initiale (pas de chargement visible).",
    "La propriété `cacheProof` montre que la donnée vient du serveur (timestamp fixe pendant 25s).",
    "Clique sur 'Rafraîchir' pour invalider et re-fetcher depuis le client.",
  ];

  return (
    <ServiceBridgeProvider state={dehydrate(queryClient)}>
      <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
        <section className="space-y-4 rounded border bg-white/70 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-gray-500">
              Demo Services
            </p>
            <h1 className="text-3xl font-bold">
              Server-Side Prefetch & Hydration
            </h1>
            <p className="text-gray-600">
              Cette page démontre le pattern <strong>SSR + Hydration</strong> :
              la donnée arrive déjà calculée du serveur.
            </p>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-gray-700">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <ServiceEventPanel />

        <ServerServicePageClient />
      </main>
    </ServiceBridgeProvider>
  );
}
