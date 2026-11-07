import { getDb } from "@/lib/db";
import { FetchedSteamGame } from "@/model/FetchedSteamGame";
import { StoredCustomGame } from "@/model/StoredCustomGame";
import { StoredSteamGame } from "@/model/StoredSteamGame";
import { validateEnv } from "@volgakurvar/vaidate-env";
import { str } from "envalid";
import SteamAPI from "steamapi";

// より具体的にするためにgetOwnedGamesから名前変更
export async function getFetchedSteamGame(
  steam: SteamAPI,
): Promise<FetchedSteamGame[]> {
  const games = await steam.getUserOwnedGames("76561198177613149", {
    includeAppInfo: true,
  });
  return Promise.all(
    games.map(async ({ game }) => {
      // id が number の場合があるので string に変換
      const gameIdStr = String(game.id);
      return {
        type: "fetchedSteam", // タイプを設定
        id: gameIdStr,
        name: "name" in game ? game.name : "unknown",
        iconURL: "iconURL" in game ? game.iconURL : undefined,
        count: await steam.getGamePlayers(game.id).catch(() => 0),
      };
    }),
  );
}

// より具体的にするためにgetTrackedGamesから名前変更
export async function getStoredSteamGames(
  steam: SteamAPI,
): Promise<StoredSteamGame[]> {
  const sql = getDb();
  const games = await sql`SELECT app_id FROM steam_games ORDER BY app_id`;
  // Steam API 呼び出しのために数値に変換する
  const validGameIds = games.map((g) => String(g.app_id));
  return Promise.all(
    validGameIds.map((id) => getSteamGameDetails(steam, id, "storedSteam")),
  );
}

async function getSteamGameDetails<Type extends "storedSteam" | "fetchedSteam">(
  steam: SteamAPI,
  id: string,
  type: Type,
) {
  const numericId = parseInt(id, 10); // Steam API 用に数値に変換
  if (isNaN(numericId)) {
    // 数値に変換できない場合はエラーとして扱う
    console.error(`Invalid numeric ID format: ${id}`);
    return {
      type,
      id: id, // 元の string ID を保持
      count: 0,
      name: `Invalid tracked Steam ID (format): ${id}`,
      iconURL: "",
    };
  }
  try {
    const playerPromise = steam.getGamePlayers(numericId);
    const gameData = await steam.getGameDetails(numericId);

    return {
      type,
      id: id, // DB から取得した string ID を使用
      count: await playerPromise,
      name: gameData.name,
      iconURL: gameData.capsuleImagev5 ?? "",
    };
  } catch (error) {
    console.log({ error });
    // 無効な追跡Steam IDのプレースホルダーを返す
    return {
      type,
      id: id, // DB から取得した string ID を使用
      count: 0,
      name: `Invalid tracked Steam ID (API error): ${id}`,
      iconURL: "",
    };
  }
}

export async function getStoredCustomGames(): Promise<StoredCustomGame[]> {
  const sql = getDb();
  const customGames = await sql`
    SELECT custom_id, name, icon_url, players
    FROM custom_games
    ORDER BY name
  `;
  return customGames.map((cg) => ({
    type: "storedCustom", // タイプを設定
    id: String(cg.custom_id), // custom_id を一意の識別子として使用 (string)
    name: String(cg.name),
    iconURL: String(cg.icon_url),
    count: Number(cg.players), // Postgres からプレイヤー数を取得
  }));
}

// DB と Steam API を初期化する関数
export function initializeServices() {
  const env = validateEnv({
    DATABASE_URL: str(),
    STEAM_KEY: str(),
  });
  if (env instanceof Error) throw env;
  const steam = new SteamAPI(env.STEAM_KEY);
  return { steam };
}
