"use server";

import { GameBase } from "@/model/GameBase";
import { initializeServices } from "./utils";
import { getStoredCustomGames } from "./utils";
import { getFetchedSteamGame, getStoredSteamGames } from "./utils"; // Import from steam actions
import { Game } from "@/model/Game";

export async function getGames(): Promise<Game[]> {
  "use server";
  const { steam } = initializeServices(); // await を削除

  // すべてのデータを並行して取得
  const [trackedSteamGames, ownedSteamGames, customGamesData] =
    await Promise.all([
      getStoredSteamGames(steam), // 追跡中のSteamゲームを取得 (from steam.ts)
      getFetchedSteamGame(steam), // 所有しているSteamゲームを取得 (from steam.ts)
      getStoredCustomGames(), // DynamoDBからカスタムゲームを取得 (from custom.ts)
    ]);

  // Steamゲームを結合し、重複を削除（追跡中のバージョンが存在する場合は優先）
  // Game.id は string なので Map のキーも string にする
  const allSteamGamesMap = new Map<string, GameBase>();
  ownedSteamGames.forEach((game) => {
    allSteamGamesMap.set(game.id, game);
  });
  trackedSteamGames.forEach((game) => {
    allSteamGamesMap.set(game.id, game); // 追跡中の場合、所有しているものを上書き
  });

  const combinedGames: GameBase[] = [
    ...Array.from(allSteamGamesMap.values()),
    ...customGamesData,
  ];

  // カウントでソート（降順） - 注: カスタムゲームのカウントは現在0
  return combinedGames.sort((a, b) => b.count - a.count);
}
