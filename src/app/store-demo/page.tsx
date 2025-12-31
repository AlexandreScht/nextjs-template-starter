"use client";

import { useStore } from "@/hooks/providers/storeProvider";
import { type FormEvent, useState } from "react";

export default function StoreDemoPage() {
  const { list, addTodo, removeTodo, toggleTodo } = useStore(
    (state) => state.todos,
  );
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTodo(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Store Demo</h1>
          <p className="text-muted-foreground">
            Manage your local todos to see the state persistance in action.
          </p>
        </div>

        {/* CREATE */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add
          </button>
        </form>

        {/* READ */}
        <div className="space-y-3">
          {list.length === 0 ? (
            <p className="text-center text-gray-500 py-8 italic">
              No todos yet. Add one above!
            </p>
          ) : (
            <ul className="space-y-2">
              {list.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-card hover:bg-accent/50 transition-colors group"
                >
                  {/* UPDATE */}
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {todo.text}
                  </span>

                  {/* DELETE */}
                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-2">How it works:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <strong>Create:</strong> <code>addTodo</code> adds a new item to
              the array.
            </li>
            <li>
              <strong>Read:</strong> The list is rendered directly from the
              store state.
            </li>
            <li>
              <strong>Update:</strong> <code>toggleTodo</code> modifies a
              specific item in place (thanks to Immer).
            </li>
            <li>
              <strong>Delete:</strong> <code>removeTodo</code> splices the item
              from the array.
            </li>
            <li>
              <strong>Persist:</strong> Refresh the page! Your todos stay here
              because of the <code>persist</code> middleware.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
