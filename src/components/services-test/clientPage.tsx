"use client";

import { useService } from "@/hooks/useService";
import { useMemo, useState } from "react";

export default function ServerServicePageClient() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useService((services) => services.users.getUsersWithCacheProof(), {
    queryKey: ["users", "cache-proof"],
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
    <div className="space-y-4 rounded border p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Données Hydratées ({data?.users.length ?? 0})
        </h2>
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50 transition-colors"
            onClick={() => setRerenderTick((tick) => tick + 1)}
          >
            Force rerender ({rerenderTick})
          </button>
          <button
            className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 transition-colors"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? "Actualisation…" : "Rafraîchir"}
          </button>
        </div>
      </div>

      <dl className="grid gap-4 rounded border bg-gray-50 p-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-gray-500 mb-1">
            Server Cache Proof
          </dt>
          <dd className="text-lg text-gray-700 font-mono font-semibold bg-gray-200 px-2 rounded inline-block">
            {data?.cacheProof}
          </dd>
          <p className="text-xs text-gray-500 mt-1">
            (Timestamp généré par le serveur)
          </p>
        </div>
        <div>
          <dt className="text-xs uppercase text-gray-500 mb-1">
            Dernier fetch (Client)
          </dt>
          <dd className="text-lg text-gray-700 font-semibold">
            {lastFetchLabel}
          </dd>
        </div>
      </dl>

      <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {data?.users.map((user) => (
          <li
            key={user.id}
            className="rounded border p-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <div className="text-xs text-gray-400">ID: {user.id}</div>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Next.js Cache Revalidation
        </h3>
        <div className="flex flex-wrap gap-2">
          <RevalidateButton
            type="tag"
            value="users"
            label="Revalidate Tag: users"
          />
          <RevalidateButton
            type="page"
            value="/server"
            label="Revalidate Path: /server"
          />
        </div>
      </div>
    </div>
  );
}

import { revalidateCache } from "@/actions/revalidateCache";
import { useTransition } from "react";

function RevalidateButton({
  type,
  value,
  label,
}: {
  type: "tag" | "page";
  value: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await revalidateCache(type, value);
      if (result.success) {
        // Optionally trigger a client-side refetch to see the changes immediately
        // but typically revalidatePath/Tag handles the server-side cache
        console.log(result.message);
      } else {
        console.error(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Revalidating..." : label}
    </button>
  );
}
