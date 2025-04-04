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
import { GameTableBody } from "@/component/GameTableBody";
import { AddGameModal } from "@/component/AddGameModal";
import { EditGameModal } from "@/component/EditGameModal"; // EditGameModal をインポート
import { Provider } from "../component/Provider";
import { Suspense } from "react";
import { getGames } from "@/actions/getGames";

export default async function Home() {
  return (
    <Provider>
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
              <Suspense>
                <GameTableServerComponent />
              </Suspense>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <AddGameModal />
      <EditGameModal />
    </Provider>
  );
}

async function GameTableServerComponent() {
  const games = await getGames();
  return <GameTableBody initialGames={games} />;
}
