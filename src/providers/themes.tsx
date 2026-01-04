// app/providers.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemesProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      themes={["light", "dark", "custom"]}
      enableSystem={true}
    >
      {children}
    </NextThemesProvider>
  );
}
