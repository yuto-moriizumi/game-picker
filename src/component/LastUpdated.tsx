"use client";

import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GameData } from "@/types/GameData";

export function LastUpdated() {
  const { data } = useQuery<GameData, Error, string>({
    queryKey: ["games"],
    select: (data: GameData) => data.lastExecuted,
  });

  return (
    <Typography variant="body2" color="text.secondary">
      最終更新: {data ? new Date(data).toLocaleString("ja-JP") : "読み込み中..."}
    </Typography>
  );
}
