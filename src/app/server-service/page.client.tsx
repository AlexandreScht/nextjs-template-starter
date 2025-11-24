"use client";

import { useService } from "@/hooks/useService";

export default function ServerServicePageClient() {
  const { data } = useService(
    (services) => services.users.getUsersWithCacheProof(),
    {
      queryKey: ["users", "cache-proof"],
    },
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Server Service Page Client</h1>
      <div className="bg-gray-100 p-4 rounded shadow text-black">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
