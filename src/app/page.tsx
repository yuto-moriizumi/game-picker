import {
  Container,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Box,
} from "@mui/material";
import { GameTableRows } from "@/component/GameTableRows";
import { AddGameModal } from "@/component/AddGameModal";
import { EditGameModal } from "@/component/EditGameModal";
import { LastUpdated } from "@/component/LastUpdated";
import { getGames } from "@/actions/getGames";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query-client";

export default async function Home() {
  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["games"],
    queryFn: () => getGames(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container maxWidth="sm">
        <Box sx={{ mb: 2 }}>
          <LastUpdated />
        </Box>
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
              <GameTableRows />
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <AddGameModal />
      <EditGameModal />
    </HydrationBoundary>
  );
}

// 1分経過したらstaleとみなす
export const revalidate = 5;
