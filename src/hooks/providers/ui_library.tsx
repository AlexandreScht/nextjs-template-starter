"use client";
import { HeroUIProvider } from "@heroui/react";

export function UiLibraryProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
