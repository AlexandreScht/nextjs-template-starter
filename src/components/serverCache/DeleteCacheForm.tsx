"use client";

import { deleteCacheByKey } from "@/actions/caching";
import { useState } from "react";

export function DeleteCacheForm() {
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await deleteCacheByKey(key);
      setMessage(result.message);
      if (result.success) {
        setKey("");
      }
    } catch {
      setMessage("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Supprimer par clé
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clé *
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            placeholder="ex: user:123"
            className="w-full px-3 py-2 text-black placeholder-gray-700/50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Supprimer"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes("succès")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
