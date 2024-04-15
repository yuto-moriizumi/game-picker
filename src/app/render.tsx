"use client";

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
import { Game } from "@/model/Game";
import Image from "next/image";
import { Button } from "./Button";
import { remove } from "./actions";

export function Renderer(porps: {
  games: (
    | Game
    | {
        id: string;
        name: string;
        iconURL: string;
        count: number;
      }
  )[];
}) {
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
            {porps.games.map((game) => (
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
