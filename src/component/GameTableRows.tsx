"use client";

import { TableRow, TableCell, Box } from "@mui/material";

import { removeStoredGame } from "@/actions/removeStoredGame";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";

import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { getQueryClient } from "./Provider";

import { GameData } from "@/types/GameData";
import { useSelectedGameStore } from "@/store/selectedGameStore"; // Zustandストアをインポート
import { Game } from "@/model/Game";

export function GameTableRows() {
  const { setSelectedGame } = useSelectedGameStore(); // Zustandストアから状態とセッターを取得

  const { data } = useQuery<GameData, Error, Game[]>({
    queryKey: ["games"],
    select: (data: GameData) => data.games,
  });

  // removeStoredGame 用のミューテーションを定義
  const removeMutation = useMutation({
    // mutationFn は removeStoredGame を使用
    mutationFn: removeStoredGame,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: ["games"] });
    },
    onError: (error) => {
      // エラーハンドリングを追加（例: console.error）
      console.error("Failed to remove game:", error);
    },
  });

  // EditGameModal を Portal を使って document.body にレンダリング
  return (
    <>
      {data?.map((game) => (
        // 一意性のためにgame.idをキーとして使用（数値または文字列）
        <TableRow key={game.id}>
          <TableCell>
            {/* // アイコンが存在する場合のみ表示 (next/imageは空文字をsrcに渡すと無限リロードが発生するため)} */}
            {game.iconURL && (
              <Image
                src={game.iconURL}
                alt="ゲームのアイコン"
                width={64}
                height={32}
                style={{ objectFit: "contain" }} // 自動サイズ調整
              />
            )}
          </TableCell>
          <TableCell>{game.name}</TableCell>
          {/* カウントを表示（カスタムゲームの場合は現在0） */}
          <TableCell align="right">{game.count}</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {game.type === "storedCustom" && (
                <IconButton
                  onClick={() => setSelectedGame(game)}
                  size="small"
                  aria-label="Edit"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {(game.type === "storedSteam" ||
                game.type === "storedCustom") && (
                <IconButton
                  onClick={() => removeMutation.mutate(game)}
                  size="small"
                  disabled={removeMutation.isPending}
                  aria-label="Delete"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
