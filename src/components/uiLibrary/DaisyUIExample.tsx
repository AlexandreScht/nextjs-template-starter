"use client";

export default function DaisyUIExample() {
  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl max-w-2xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">DaisyUI Components</h2>
          <p className="text-base-content/70">Exemples de composants DaisyUI</p>

          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary">Primary</button>
                <button className="btn btn-secondary">Secondary</button>
                <button className="btn btn-accent">Accent</button>
                <button className="btn btn-success">Success</button>
                <button className="btn btn-warning">Warning</button>
                <button className="btn btn-error">Error</button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary">Solid</button>
                <button className="btn btn-outline btn-primary">Outline</button>
                <button className="btn btn-ghost btn-primary">Ghost</button>
                <button className="btn btn-link btn-primary">Link</button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn btn-primary btn-xs">Tiny</button>
                <button className="btn btn-primary btn-sm">Small</button>
                <button className="btn btn-primary btn-md">Medium</button>
                <button className="btn btn-primary btn-lg">Large</button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Alert</h3>
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Ceci est une alerte DaisyUI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
