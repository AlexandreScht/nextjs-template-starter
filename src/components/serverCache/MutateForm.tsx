"use client";

import { mutateCacheByKey, mutateCacheByTags } from "@/actions/caching";
import { useState } from "react";

export function MutateForm() {
  const [mode, setMode] = useState<"key" | "tags">("key");
  const [key, setKey] = useState("");
  const [tags, setTags] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result =
        mode === "key"
          ? await mutateCacheByKey(key, value)
          : await mutateCacheByTags(tags, value);
      setMessage(result.message);
      if (result.success) {
        setKey("");
        setTags("");
        setValue("");
      }
    } catch {
      setMessage("Erreur lors de la mutation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Muter (modifier) le cache
      </h2>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("key")}
          className={`px-4 py-2 rounded-md transition-colors ${
            mode === "key"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Par clé
        </button>
        <button
          type="button"
          onClick={() => setMode("tags")}
          className={`px-4 py-2 rounded-md transition-colors ${
            mode === "tags"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Par tags
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "key" ? (
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
              className="w-full px-3 py-2 border text-black placeholder-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (séparés par des virgules) *
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              required
              placeholder="user, profile"
              className="w-full px-3 py-2 border text-black placeholder-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouvelle valeur (JSON) *
          </label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            placeholder='{"name": "Jane", "age": 25}'
            rows={3}
            className="w-full px-3 py-2 border text-black placeholder-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Chargement..." : "Muter"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes("succès") || message.includes("mutée")
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
