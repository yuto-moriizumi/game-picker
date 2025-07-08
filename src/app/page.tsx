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
import { GameTableRows } from "@/component/GameTableRows";
import { AddGameModal } from "@/component/AddGameModal";
import { EditGameModal } from "@/component/EditGameModal"; // EditGameModal をインポート
import { Provider } from "../component/Provider";
import { Suspense } from "react";
import { getGames } from "@/actions/getGames";

export default async function Home() {
  const games = await getGames();
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
            {/* TableBodyをSuspenseより上位に配置しないと、余分なTbodyが勝手に追加されることがある */}
            <TableBody>
              <Suspense>
                <GameTableRows initialGames={games} />
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

export const revalidate = 60;
