"use client";

import { setCacheValue } from "@/actions/caching";
import { useState } from "react";

export function SetCacheForm() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [ttl, setTtl] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await setCacheValue(
        key,
        value,
        ttl ? parseInt(ttl) : undefined,
        tags ? tags.split(",").map((t) => t.trim()) : undefined,
      );

      setMessage(result.message);
      if (result.success) {
        setKey("");
        setValue("");
        setTtl("");
        setTags("");
      }
    } catch {
      setMessage("Erreur lors de la mise en cache");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Mettre en cache
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valeur (JSON) *
          </label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            placeholder='{"name": "John", "age": 30}'
            rows={3}
            className="w-full px-3 py-2 border text-black placeholder-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TTL (secondes)
          </label>
          <input
            type="number"
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            placeholder="3600"
            className="w-full px-3 py-2 border text-black placeholder-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (séparés par des virgules)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="user, profile"
            className="w-full px-3 py-2 border text-black placeholder-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Mettre en cache"}
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
