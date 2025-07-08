import { AWS_REGION } from "@/constant";
import { FetchedSteamGame } from "@/model/FetchedSteamGame";
import { StoredCustomGame, CustomGameModel } from "@/model/StoredCustomGame";
import { SteamGameModel, StoredSteamGame } from "@/model/StoredSteamGame";
import { validateEnv } from "@volgakurvar/vaidate-env";
import { aws } from "dynamoose";
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
  const games = await SteamGameModel.scan().exec();
  // SteamGameModel の id は string になったので、そのまま使う
  // Steam API 呼び出しのために数値に変換する必要がある
  const validGameIds = games.map((g) => g.id.toString());
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
    const detail = await steam.getGameDetails(numericId);
    const players = await steam.getGamePlayers(numericId);
    return {
      type,
      id: id, // DB から取得した string ID を使用
      count: players,
      name: detail.name,
      iconURL: detail.capsule_imagev5,
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
  const customGames = await CustomGameModel.scan().exec();
  return customGames.map((cg) => ({
    type: "storedCustom", // タイプを設定
    id: cg.customId, // customIdを一意の識別子として使用 (string)
    name: cg.name,
    iconURL: cg.iconURL,
    count: cg.players, // DynamoDBからプレイヤー数を取得
  }));
}
// AWSとSteam APIを初期化する関数

export function initializeServices() {
  const env = validateEnv({
    DB_ACCESS_KEY_ID: str(),
    DB_SECRET_ACCESS_KEY: str(),
    STEAM_KEY: str(),
  });
  if (env instanceof Error) throw env;
  aws.ddb.set(
    new aws.ddb.DynamoDB({
      region: AWS_REGION,
      credentials: {
        accessKeyId: env.DB_ACCESS_KEY_ID,
        secretAccessKey: env.DB_SECRET_ACCESS_KEY,
      },
    }),
  );
  const steam = new SteamAPI(env.STEAM_KEY);
  return { steam };
}
