"use client";

import { useState } from "react";
import { createPortal } from "react-dom"; // createPortal をインポート
import { TableRow, TableCell, Box } from "@mui/material";
// removeStoredGame をインポート
import { removeStoredGame } from "@/actions/removeStoredGame";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Game } from "@/model/Game";
// StoredSteamGame と StoredCustomGame をインポート
import { StoredSteamGame } from "@/model/StoredSteamGame";
import { StoredCustomGame } from "@/model/StoredCustomGame";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // EditIconをインポート
import { getQueryClient } from "./Provider";
import { EditGameModal } from "./EditGameModal"; // EditGameModalをインポート
import { getGames } from "@/actions/getGames";

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
              {/* storedCustom タイプの場合、編集ボタンを表示 */}
              {game.type === "storedCustom" && (
                <IconButton onClick={() => setSelectedGame(game)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {/* storedSteam または storedCustom タイプの場合、削除ボタンを表示 */}
              {(game.type === "storedSteam" ||
                game.type === "storedCustom") && (
                <IconButton
                  onClick={() => {
                    // removeStoredGame は game オブジェクト全体を期待する
                    // if ブロック内で型が絞り込まれるはずだが、明示的な型アサーションを追加
                    if (
                      game.type === "storedSteam" ||
                      game.type === "storedCustom"
                    ) {
                      // game を StoredSteamGame | StoredCustomGame として扱う
                      removeMutation.mutate(
                        game as StoredSteamGame | StoredCustomGame,
                      );
                    } else {
                      console.error("Cannot remove game of type:", game.type);
                    }
                  }}
                  size="small"
                  // ミューテーション実行中はボタンを無効化
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
