import { aws } from "dynamoose";
import { AWS_REGION } from "@/constant";
import { str } from "envalid";
import { validateEnv } from "@volgakurvar/vaidate-env";
import SteamAPI from "steamapi";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Modal } from "./Modal";
import { GameModel } from "@/model/Game";
import Image from "next/image";
import { Button } from "./Button";

async function saveGame(name: string, count: number) {
  "use server";
  const game = new GameModel({ name, count });
  await game.save();
}

async function remove(id: string) {
  "use server";
  await new GameModel({ id }).delete();
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
      <Container maxWidth="sm">
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>名前</TableCell>
                <TableCell width="100px">プレイヤー数</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.name}>
                  <TableCell>
                    {"iconURL" in game ? (
                      <Image
                        src={game.iconURL}
                        alt="ゲームのアイコン"
                        width={32}
                        height={32}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>{game.name}</TableCell>
                  <TableCell align="right">{game.count}</TableCell>
                  <TableCell>
                    {"id" in game ? (
                      <Button gameId={game.id} onClick={remove} />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <Modal onSave={saveGame} />
    </>
  );
}
