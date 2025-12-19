import Link from "next/link";

export default function SelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl w-full p-8 text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Choisissez le type de service
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Sélectionnez l&apos;environnement pour tester les services.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/server"
            className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-500"
          >
            <div className="text-2xl font-bold text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              Serveur
            </div>
            <p className="text-gray-500">
              Services exécutés côté serveur avec rendu SSR et hydratation.
            </p>
          </Link>

          <Link
            href="/client"
            className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-500"
          >
            <div className="text-2xl font-bold text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              Client
            </div>
            <p className="text-gray-500">
              Services exécutés côté client avec React Query et interactivité.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
