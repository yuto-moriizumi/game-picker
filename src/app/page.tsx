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
import { Suspense } from "react";

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
      <Modal />
    </Provider>
  );
}

async function GameTableServerComponent() {
  const games = await getGames();
  return <GameTableBody games={games} />;
}

export const dynamic = "force-dynamic";
