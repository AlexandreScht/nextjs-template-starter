"use client";

import { useService } from "@/hooks/useService";

export function UsersList() {
  const { data, isLoading, isError, error, refetch, isFetching } = useService(
    (services) => services.users.getUsers(),
    {
      queryKey: ["users"],
    },
  );

  if (isLoading) {
    return (
      <div className="rounded border p-4">Chargement des utilisateurs…</div>
    );
  }

  if (isError) {
    return (
      <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700">
        Erreur: {error instanceof Error ? error.message : "inconnue"}
        <button
          className="ml-4 rounded bg-red-500 px-3 py-1 text-white"
          onClick={() => refetch()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Utilisateurs ({data?.length ?? 0})
        </h2>
        <button
          className="text-sm text-blue-600"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          {isFetching ? "Actualisation…" : "Rafraîchir"}
        </button>
      </div>
      <ul className="space-y-2">
        {data?.map((user) => (
          <li key={user.id} className="rounded border p-3">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
