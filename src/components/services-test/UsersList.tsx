"use client";

import { useService } from "@/hooks/useService";
import { useMemo, useState } from "react";

export function UsersList() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
    status,
  } = useService((services) => services.users.getUsers(), {
    queryKey: ["users"],
  });

  const [rerenderTick, setRerenderTick] = useState(0);

  const lastFetchLabel = useMemo(() => {
    if (!dataUpdatedAt) {
      return "—";
    }
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(dataUpdatedAt);
  }, [dataUpdatedAt]);

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
    <div className="space-y-4 rounded border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Utilisateurs ({data?.length ?? 0})
        </h2>
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={() => setRerenderTick((tick) => tick + 1)}
          >
            Force rerender ({rerenderTick})
          </button>
          <button
            className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? "Actualisation…" : "Rafraîchir"}
          </button>
        </div>
      </div>

      <dl className="grid gap-3 rounded border bg-gray-50 p-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-gray-500">Rerenders forcés</dt>
          <dd className="text-lg text-gray-700 font-semibold">
            {rerenderTick}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-gray-500">Dernier fetch</dt>
          <dd className="text-lg text-gray-700 font-semibold">
            {lastFetchLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-gray-500">Statut query</dt>
          <dd className="text-lg text-gray-700 font-semibold">
            {status}
            {isFetching ? " (fetching)" : ""}
          </dd>
        </div>
      </dl>

      <ul className="space-y-2">
        {data?.map((user) => (
          <li key={user.id} className="rounded border p-3">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
