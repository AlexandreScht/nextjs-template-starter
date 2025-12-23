"use client";

import ThemeSwitch from "@/components/theme/ThemeSwitch";

export default function ThemePage() {
  return (
    <div className="min-h-screen p-8 bg-page-gradient transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-card">
            Gestion des Thèmes
          </h1>
          <p className="text-lg text-card-secondary">
            Changez le thème de l&apos;application en temps réel avec
            next-themes
          </p>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-xl shadow-lg p-8 transition-colors duration-300">
          <ThemeSwitch />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Démonstration des couleurs */}
          <div className="bg-card backdrop-blur-sm rounded-lg shadow-md p-6 transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-4 text-card">
              Couleurs du thème
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-lg" />
                <span className="text-primary font-semibold">Primary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-lg" />
                <span className="text-secondary font-semibold">Secondary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success rounded-lg" />
                <span className="text-success font-semibold">Success</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-warning rounded-lg" />
                <span className="text-warning font-semibold">Warning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-danger rounded-lg" />
                <span className="text-danger font-semibold">Danger</span>
              </div>
            </div>
          </div>

          {/* Démonstration des composants */}
          <div className="bg-card backdrop-blur-sm rounded-lg shadow-md p-6 transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-4 text-card">Composants</h2>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                Bouton Primary
              </button>
              <button className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-opacity">
                Bouton Secondary
              </button>
              <div className="p-4 bg-card backdrop-blur-sm rounded-lg transition-colors duration-300">
                <p className="text-card-secondary">Carte avec fond adaptatif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
