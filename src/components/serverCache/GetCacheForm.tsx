"use client";

import { getCacheValue } from "@/actions/caching";
import { useState } from "react";

export function GetCacheForm() {
  const [key, setKey] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const response = await getCacheValue(key);
      setMessage(response.message);
      if (response.data !== undefined) {
        setResult(response.data);
      }
    } catch {
      setMessage("Erreur lors de la récupération");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Récupérer du cache
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
            className="w-full px-3 py-2 text-black placeholder-gray-700/50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Récupérer"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes("trouvée")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-yellow-50 text-yellow-800 border border-yellow-200"
            }`}
          >
            {message}
          </div>
        )}

        {result !== null && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Résultat:
            </h3>
            <pre className="bg-gray-50 p-3 text-gray-700/50 rounded-md overflow-x-auto text-xs border border-gray-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </div>
  );
}
