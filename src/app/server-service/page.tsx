import ServiceBridgeProvider from "@/hooks/providers/ServiceBridgeProvider";
import { callService } from "@/hooks/serverService";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import ServerServicePageClient from "./page.client";

export default async function ServerServicePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users", "cache-proof"],
    queryFn: () =>
      callService((services) => services.users.getUsersWithCacheProof(), {
        next: { revalidate: 25 },
      }),
  });

  return (
    <ServiceBridgeProvider state={dehydrate(queryClient)}>
      <ServerServicePageClient />
    </ServiceBridgeProvider>
  );
}
