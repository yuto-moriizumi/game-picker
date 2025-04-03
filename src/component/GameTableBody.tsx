"use client";

import { useState } from "react";
import { createPortal } from "react-dom"; // createPortal をインポート
import { TableRow, TableCell, Box } from "@mui/material";
// removeStoredGame をインポート
import { removeStoredGame } from "@/actions/removeStoredGame";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";

// StoredSteamGame と StoredCustomGame をインポート
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // EditIconをインポート
import { getQueryClient } from "./Provider";
import { EditGameModal } from "./EditGameModal"; // EditGameModalをインポート
import { getGames } from "@/actions/getGames";
import { Game } from "@/model/Game";

export function GameTableBody(props: { games: Game[] }) {
  const [selectedGame, setSelectedGame] = useState<Game>();

  const { data } = useQuery({
    queryKey: ["games"],
    queryFn: () => getGames(),
    initialData: props.games,
    staleTime: 1000 * 10, // 10秒
  });
  // removeStoredGame 用のミューテーションを定義
  const removeMutation = useMutation({
    // mutationFn は removeStoredGame を使用
    mutationFn: removeStoredGame,
    onSuccess: () =>
      getQueryClient().invalidateQueries({ queryKey: ["games"] }),
    onError: (error) => {
      // エラーハンドリングを追加（例: console.error）
      console.error("Failed to remove game:", error);
    },
  });

  // EditGameModal を Portal を使って document.body にレンダリング
  return (
    <>
      {data.map((game) => (
        // 一意性のためにgame.idをキーとして使用（数値または文字列）
        <TableRow key={game.id}>
          <TableCell>
            <Image
              src={game.iconURL}
              alt="ゲームのアイコン"
              width={64}
              height={32}
              style={{ objectFit: "contain" }} // 自動サイズ調整
            />
          </TableCell>
          <TableCell>{game.name}</TableCell>
          {/* カウントを表示（カスタムゲームの場合は現在0） */}
          <TableCell align="right">{game.count}</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {game.type === "storedCustom" && (
                <IconButton onClick={() => setSelectedGame(game)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {(game.type === "storedSteam" ||
                game.type === "storedCustom") && (
                <IconButton
                  onClick={() => removeMutation.mutate(game)}
                  size="small"
                  disabled={removeMutation.isPending}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </TableCell>
        </TableRow>
      ))}
      {globalThis.document &&
        createPortal(
          <EditGameModal
            open={!!selectedGame}
            onClose={() => setSelectedGame(undefined)}
            game={selectedGame}
          />,
          globalThis.document.body, // body 要素をターゲットにする
        )}
    </>
  );
}
