"use client";

import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export function Button(props: {
  gameId: string;
  onClick: (id: string) => Promise<unknown>;
}) {
  return (
    <IconButton onClick={() => props.onClick(props.gameId)}>
      <DeleteIcon />
    </IconButton>
  );
}
