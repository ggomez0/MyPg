import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCollections(projectId: string) {
  return useQuery({
    queryKey: ["collections", projectId],
    queryFn: () => api.collections.list(projectId),
    enabled: !!projectId,
  });
}
