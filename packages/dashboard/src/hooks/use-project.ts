import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => api.projects.get(id),
    enabled: !!id,
  });
}
