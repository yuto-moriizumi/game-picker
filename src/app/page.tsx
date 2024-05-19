import { aws } from "dynamoose";
import { AWS_REGION } from "@/constant";
import { str } from "envalid";
import { validateEnv } from "@volgakurvar/vaidate-env";
import { GameModel } from "@/model/Game";
import SteamAPI from "steamapi";
import {
  Container,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
} from "@mui/material";
import { remove } from "./actions";
import { Button } from "./Button";
import Image from "next/image";

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
    (
      await steam.getUserOwnedGames("76561198177613149", {
        includeAppInfo: true,
      })
    ).map(async ({ game }) => ({
      id: game.id.toString(),
      name: "name" in game ? game.name : "unknown",
      iconURL: "iconURL" in game ? game.iconURL : "",
      count: await steam.getGamePlayers(game.id),
    })),
  );
  const games = [...customGames, ...gamesWithPlayers].sort(
    (a, b) => b.count - a.count,
  );

  return (
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
  );
}

export const dynamic = "force-dynamic";
