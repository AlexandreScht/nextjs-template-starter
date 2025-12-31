import Link from "next/link";

export default function Home() {
  const sections = [
    { name: "Theme", href: "/theme" },
    { name: "UI Library (HeroUI / DaisyUI)", href: "/uiLibrary" },
    { name: "Server Cache", href: "/server-cache" },
    { name: "Service", href: "/selection" },
    { name: "Store", href: "/store-demo" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-5xl font-bold text-center mb-12 text-gray-900">
          Next.js Starter Template
        </h1>

        <ul className="space-y-4">
          {sections.map((section) => (
            <li key={section.name}>
              {section.href ? (
                <Link
                  href={section.href}
                  className="block p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
                >
                  <span className="text-xl font-semibold text-gray-800">
                    {section.name}
                  </span>
                </Link>
              ) : (
                <div className="block p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50">
                  <span className="text-xl font-semibold text-gray-800">
                    {section.name}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
