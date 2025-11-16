"use client";

import { useServiceInstance } from "@/hooks/useService";
import type { CreateUserDto, User } from "@/services/example.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function UsersForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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
    onSuccess: () => {
      setName("");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

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
