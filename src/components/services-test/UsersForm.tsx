"use client";

import { useServiceInstance } from "@/hooks/useService";
import { type CreateUserDto, type User } from "@/services/example.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export function UsersForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mutationCount, setMutationCount] = useState(0);
  const [lastInvalidationAt, setLastInvalidationAt] = useState<number | null>(
    null,
  );

  const usersService = useServiceInstance((services) => services.users);
  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess, reset, error } = useMutation<
    User,
    Error,
    CreateUserDto
  >({
    mutationFn: async (payload) => {
      const created = await usersService.createUser(payload);
      return created;
    },
    onMutate: async () => {
      setMutationCount((count) => count + 1);
    },
    onSuccess: (created) => {
      setName("");
      setEmail("");
      setLastInvalidationAt(Date.now());
      //? invalider
      // queryClient.invalidateQueries({ queryKey: ["users"] });
      //? muter la value
      queryClient.setQueryData(["users"], (existing?: User[]) =>
        existing ? [...existing, created] : [created],
      );
    },
  });

  const lastInvalidationLabel = useMemo(() => {
    if (!lastInvalidationAt) {
      return "—";
    }
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(lastInvalidationAt);
  }, [lastInvalidationAt]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-semibold">Créer un utilisateur</h2>
      <input
        type="text"
        placeholder="Nom"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full rounded border p-2"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded border p-2"
        required
      />
      {error ? (
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Erreur inconnue"}
        </p>
      ) : null}
      {isSuccess ? (
        <p className="text-sm text-green-600">Utilisateur créé !</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 rounded border bg-gray-50 p-3 text-sm">
        <div>
          <dt className="text-xs uppercase text-gray-500">
            Mutations envoyées
          </dt>
          <dd className="text-lg text-gray-700 font-semibold">
            {mutationCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-gray-500">
            Dernière invalidation cache
          </dt>
          <dd className="text-lg text-gray-700 font-semibold">
            {lastInvalidationLabel}
          </dd>
        </div>
      </dl>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Création…" : "Créer"}
        </button>
        {isSuccess ? (
          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={() => {
              reset();
            }}
          >
            Réinitialiser
          </button>
        ) : null}
      </div>
    </form>
  );
}
