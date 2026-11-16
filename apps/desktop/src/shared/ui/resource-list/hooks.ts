import { useQuery } from "@tanstack/react-query";

// Community suggestions used to be fetched from the upstream product's website.
// Aplo has no such service, so this returns an empty list without any request.
export function useWebResources<T>(endpoint: string) {
  return useQuery({
    queryKey: ["settings", endpoint, "suggestions"],
    queryFn: async (): Promise<T[]> => [],
    staleTime: Number.POSITIVE_INFINITY,
  });
}
