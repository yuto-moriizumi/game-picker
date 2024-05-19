"use client";

import { TableRow, TableCell } from "@mui/material";
import { removeGame } from "../app/actions";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getGames } from "../app/actions";
import { Game } from "@/model/Game";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getQueryClient } from "./Provider";

export function GameTableBody(props: { games: Game[] }) {
  const { data } = useQuery({
    queryKey: ["games"],
    queryFn: () => getGames(),
    initialData: props.games,
    staleTime: 1000 * 10, // 10sec
  });
  const remove = useMutation({
    mutationFn: removeGame,
    onSuccess: () =>
      getQueryClient().invalidateQueries({ queryKey: ["games"] }),
  });
  return data.map((game) => (
    <TableRow key={game.name}>
      <TableCell>
        <Image
          src={game.iconURL}
          alt="ゲームのアイコン"
          width={64}
          height={32}
          style={{ objectFit: "contain" }}
        />
      </TableCell>
      <TableCell>{game.name}</TableCell>
      <TableCell align="right">{game.count}</TableCell>
      <TableCell>
        {game.isTracked ? (
          <IconButton onClick={() => remove.mutate(game.id)}>
            <DeleteIcon />
          </IconButton>
        ) : null}
      </TableCell>
    </TableRow>
  ));
}
