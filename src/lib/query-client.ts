import { getGames } from "@/actions/getGames";
import { GameData } from "@/types/GameData";
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
        queryFn: async (): Promise<GameData> => {
          const result = await getGames();
          return result;
        },
      },
    },
  });
}
