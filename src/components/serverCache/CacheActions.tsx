"use client";

import { cleanupCache, clearCache } from "@/actions/caching";
import { useState } from "react";

export function CacheActions() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClear = async () => {
    if (!confirm("Êtes-vous sûr de vouloir vider tout le cache ?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await clearCache();
      setMessage(result.message);
    } catch {
      setMessage("Erreur lors du vidage du cache");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await cleanupCache();
      setMessage(result.message);
    } catch {
      setMessage("Erreur lors du nettoyage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Actions globales
      </h2>
      <div className="space-y-3">
        <button
          onClick={handleCleanup}
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Nettoyer les entrées expirées"}
        </button>

        <button
          onClick={handleClear}
          disabled={loading}
          className="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Vider tout le cache"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes("succès") || message.includes("nettoyée")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
