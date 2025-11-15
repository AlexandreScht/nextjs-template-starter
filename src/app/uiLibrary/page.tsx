"use client";

import DaisyUIExample from "@/components/uiLibrary/DaisyUIExample";
import HeroUIExample from "@/components/uiLibrary/HeroUIExample";

export default function UILibraryPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">UI Libraries</h1>
        <p className="text-lg text-gray-700 mb-8">
          Ce projet utilise HeroUI et DaisyUI pour les composants
          d&#39;interface utilisateur.
        </p>

        <div className="grid gap-8 mb-12">
          {/* HeroUI Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-purple-600">HeroUI</h2>
              <a
                href="https://www.heroui.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                📚 Documentation
              </a>
            </div>
            <p className="text-gray-700 mb-6">
              HeroUI (anciennement NextUI) est une bibliothèque de composants
              React moderne et rapide, optimisée pour Next.js avec un design
              élégant et des animations fluides.
            </p>
            <HeroUIExample />
          </div>

          {/* DaisyUI Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-green-600">DaisyUI</h2>
              <a
                href="https://daisyui.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📚 Documentation
              </a>
            </div>
            <p className="text-gray-700 mb-6">
              DaisyUI est une bibliothèque de composants CSS pure basée sur
              TailwindCSS. Elle offre des composants prêts à l&#39;emploi avec
              des classes utilitaires simples.
            </p>
            <DaisyUIExample />
          </div>
        </div>
      </div>
    </div>
  );
}
