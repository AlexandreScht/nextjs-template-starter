"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter le flash de contenu non stylé
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-3">
        <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  const themeConfig = [
    {
      name: "light",
      label: "☀️ Light",
      description: "Thème clair",
      colors: {
        bg: "bg-white",
        text: "text-gray-900",
        border: "border-gray-300",
      },
    },
    {
      name: "dark",
      label: "🌙 Dark",
      description: "Thème sombre",
      colors: {
        bg: "bg-gray-900",
        text: "text-white",
        border: "border-gray-600",
      },
    },
    {
      name: "custom",
      label: "🎨 Custom",
      description: "Thème violet/rose",
      colors: {
        bg: "bg-gradient-to-br from-purple-500 to-pink-500",
        text: "text-white",
        border: "border-purple-400",
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-card">Sélectionner un thème</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themeConfig.map((themeOption) => (
          <button
            key={themeOption.name}
            onClick={() => setTheme(themeOption.name)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200
              ${
                theme === themeOption.name
                  ? "border-primary shadow-lg scale-105"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
              }
              bg-card backdrop-blur-sm
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`
                w-16 h-16 rounded-lg ${themeOption.colors.bg}
                border-2 ${themeOption.colors.border}
                flex items-center justify-center text-2xl
              `}
              >
                {themeOption.label.split(" ")[0]}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-card">
                  {themeOption.label.split(" ")[1]}
                </h3>
                <p className="text-sm text-card-secondary">
                  {themeOption.description}
                </p>
              </div>
              {theme === themeOption.name && (
                <div className="mt-2 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium">
                  ✓ Actif
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-card backdrop-blur-sm">
        <p className="text-sm text-card-secondary">
          <strong>Thème actuel :</strong> {theme}
        </p>
      </div>
    </div>
  );
}
