"use client";

import { useServicesEvent } from "@/hooks/useServicesEvent";
import { useMemo } from "react";

export function ServiceEventPanel() {
  const { isLoading, lastDuration, lastNotification } = useServicesEvent();

  const durationText = useMemo(() => {
    if (!lastDuration) return "—";
    const { url, duration } = lastDuration;
    const ms = duration.toFixed(0);
    return url ? `${url} · ${ms} ms` : `${ms} ms`;
  }, [lastDuration]);

  const notificationText = lastNotification
    ? `${lastNotification.type.toUpperCase()} · ${lastNotification.message}`
    : "Aucune notification";

  return (
    <section className="flex flex-col gap-3 rounded border bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">Requêtes réseau</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isLoading
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isLoading ? "En cours" : "Au repos"}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-semibold text-gray-800">Dernière durée : </span>
          {durationText}
        </p>
        <p>
          <span className="font-semibold text-gray-800">
            Dernier message :{" "}
          </span>
          {notificationText}
        </p>
      </div>
    </section>
  );
}
