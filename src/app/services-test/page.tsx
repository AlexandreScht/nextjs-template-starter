import { UsersForm } from "@/components/services-test/UsersForm";
import { UsersList } from "@/components/services-test/UsersList";

const steps = [
  "Clique sur “Force rerender” dans la liste : le compteur de rendu monte mais le compteur de fetch reste inchangé ⇒ la donnée vient du cache.",
  "Clique sur “Rafraîchir” : un fetch réseau est déclenché, observe la mise à jour de l’horodatage.",
  "Crée un utilisateur avec le formulaire : l’invalidation de la clé `['users']` doit déclencher un unique refetch.",
  "Ouvre les React Query Devtools (à ajouter globalement si nécessaire) pour vérifier le statut `fresh/stale`.",
];

export default function ServicesTestPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <section className="space-y-4 rounded border bg-white/70 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-gray-500">
            Demo Services
          </p>
          <h1 className="text-3xl font-bold">
            Tester le cache <code>useService</code> / <code>useQuery</code>
          </h1>
          <p className="text-gray-600">
            Cette page combine les services côté client, React Query et les
            endpoints API pour visualiser comment les requêtes sont mises en
            cache et invalidées.
          </p>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-gray-700">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <UsersForm />
        <UsersList />
      </section>
    </main>
  );
}
