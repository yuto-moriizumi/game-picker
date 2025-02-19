"use server";

import { AWS_REGION } from "@/constant";
import { Game, GameModel } from "@/model/Game";
import { validateEnv } from "@volgakurvar/vaidate-env";
import { aws } from "dynamoose";
import { str } from "envalid";
import SteamAPI from "steamapi";

export async function removeGame(id: number) {
  "use server";
  return new GameModel({ id }).delete();
}

export async function getGames() {
  "use server";
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
  return (await Promise.all([getTrackedGames(steam), getOwnedGames(steam)]))
    .flat()
    .sort((a, b) => b.count - a.count);
}

async function getOwnedGames(steam: SteamAPI): Promise<Game[]> {
  "use server";
  const games = await steam.getUserOwnedGames("76561198177613149", {
    includeAppInfo: true,
  });
  return Promise.all(
    games.map(async ({ game }) => ({
      id: game.id,
      name: "name" in game ? game.name : "unknown",
      iconURL: "iconURL" in game ? game.iconURL : "",
      count: await steam.getGamePlayers(game.id).catch(() => 0),
    })),
  );
}

async function getTrackedGames(steam: SteamAPI): Promise<Game[]> {
  "use server";
  const games = await GameModel.scan().exec();
  return Promise.all(games.map((g) => getGame(steam, g.id)));
}

async function getGame(steam: SteamAPI, id: number): Promise<Game> {
  "use server";
  try {
    const detail = await steam.getGameDetails(id);
    const players = await steam.getGamePlayers(id);
    return {
      id,
      count: players,
      name: detail.name,
      iconURL: detail.capsule_imagev5,
      isTracked: true,
    };
  } catch (error) {
    console.log({ error });
    return {
      id,
      count: 0,
      name: `Invalid game id: ${id}`,
      iconURL: "",
      isTracked: true,
    };
  }
}

export async function addGame(id: number) {
  "use server";
  await new GameModel({ id }).save();
}
