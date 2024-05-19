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
import { getGames } from "./actions";
import { GameTableBody } from "@/component/GameTableBody";
import { Modal } from "@/component/Modal";
import { Provider } from "../component/Provider";

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
            <TableBody>
              <GameTableBody games={games} />
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <Modal />
    </Provider>
  );
}

export const dynamic = "force-dynamic";
