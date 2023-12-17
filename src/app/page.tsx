import { aws } from "dynamoose";
import { AWS_REGION } from "@/constant";
import { str } from "envalid";
import { validateEnv } from "@volgakurvar/vaidate-env";
import SteamAPI from "steamapi";
import { Fab, TextField, Typography } from "@mui/material";
import Add from "@mui/icons-material/Add";
import { Modal } from "./Modal";
import { GameModel } from "@/model/Game";

async function saveGame(name: string, count: number) {
  "use server";
  const game = new GameModel({ name, count });
  await game.save();
}

export default async function Home() {
  const env = validateEnv({
    DB_ACCESS_KEY_ID: str(),
    DB_SECRET_ACCESS_KEY: str(),
    STEAM_KEY: str(),
  });
  if (env instanceof Error) return null;

  aws.ddb.set(
    new aws.ddb.DynamoDB({
      region: AWS_REGION,
      credentials: {
        accessKeyId: env.DB_ACCESS_KEY_ID,
        secretAccessKey: env.DB_SECRET_ACCESS_KEY,
      },
    }),
  );

  const customGames = await GameModel.scan().exec();

  const steam = new SteamAPI(env.STEAM_KEY);
  const gamesWithPlayers = await Promise.all(
    (await steam.getUserOwnedGames("76561198177613149")).map(async (game) => ({
      ...game,
      count: await steam.getGamePlayers(game.appID.toString()),
    })),
  );
  const games = [...customGames, ...gamesWithPlayers].sort(
    (a, b) => b.count - a.count,
  );

  return (
    <>
      <table>
        <tbody>
          <tr>
            <th>a</th>
            <th>名前</th>
          </tr>
          {games.map((game) => (
            <tr key={game.name}>
              <td>
                {"iconURL" in game ? (
                  <img src={game.iconURL} alt="ゲームのアイコン" />
                ) : null}
              </td>
              <td>{game.name}</td>
              <td>{game.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal onSave={saveGame} />
    </>
  );
}
