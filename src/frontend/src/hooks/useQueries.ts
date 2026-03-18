import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Video } from "../backend";
import { useActor } from "./useActor";

export function useSyncVideos() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<string, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      // syncFromYoutube exists on the backend but the generated binding is stale
      return (actor as any).syncFromYoutube() as Promise<string>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useListVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listVideos();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
