"use client";

import {
  Box,
  Button,
  Modal as MuiModal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { updateStoredCustomGame } from "@/actions/updateStoredCustomGame";
import { getQueryClient } from "./Provider";
import { StoredCustomGame } from "@/model/StoredCustomGame"; // StoredCustomGame をインポート
import { Game } from "@/model/Game";
import { useSelectedGameStore } from "@/store/selectedGameStore"; // Zustandストアをインポート

// カスタムゲーム編集のスキーマ
const editSchema = yup
  .object({
    name: yup.string().required(),
    iconURL: yup.string().url("有効なURLである必要があります").required(),
    players: yup
      .number()
      .typeError("プレイヤー数は数値である必要があります")
      .integer("プレイヤー数は整数である必要があります")
      .min(1, "プレイヤー数は1以上である必要があります")
      .required(),
  })
  .required();
type EditFormType = yup.InferType<typeof editSchema>;

export function EditGameModal() {
  const { selectedGame, setSelectedGame } = useSelectedGameStore(); // Zustandストアから状態とセッターを取得
  const queryClient = getQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormType>({
    resolver: yupResolver(editSchema),
  });

  // モーダルが開かれたとき、または編集対象のゲームが変わったときにフォームをリセット
  useEffect(() => {
    if (selectedGame) {
      reset({
        name: selectedGame.name,
        iconURL: selectedGame.iconURL,
        players: selectedGame.count, // カスタムゲームのプレイヤー数はcountに入っている想定
      });
    } else {
      reset({ name: "", iconURL: "", players: 1 }); // デフォルト値
    }
  }, [selectedGame, reset]);

  // カスタムゲーム更新のミューテーション
  const updateMutation = useMutation({
    mutationFn: (data: EditFormType & { id: string }) => {
      // StoredCustomGame オブジェクトを作成
      const gameToUpdate: StoredCustomGame = {
        type: "storedCustom", // タイプを明示的に設定
        id: data.id,
        name: data.name,
        iconURL: data.iconURL,
        count: data.players, // フォームの players を count にマッピング
      };
      return updateStoredCustomGame(gameToUpdate); // オブジェクトを渡す
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["games"] });
      setSelectedGame(undefined); // 成功時にモーダルを閉じる (Zustandの状態を更新)
    },
    onError: (error) => {
      console.error("Failed to update game:", error);
      // エラーハンドリングを追加（例: Snackbarでエラーメッセージ表示）
    },
  });

  const onSubmit: SubmitHandler<EditFormType> = (data) => {
    if (selectedGame && typeof selectedGame.id === "string") {
      updateMutation.mutate({ ...data, id: selectedGame.id });
    } else {
      console.error("Invalid game data for update");
    }
  };

  const handleClose = () => {
    reset(); // フォームをリセット
    setSelectedGame(undefined); // Zustandの状態を更新してモーダルを閉じる
  };

  return (
    <MuiModal
      open={!!selectedGame} // Zustandの状態に基づいて開閉を制御
      onClose={handleClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper sx={{ width: "90%", maxWidth: "500px", p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          カスタムゲームを編集
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="ゲーム名"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              required
            />
            <TextField
              label="アイコン画像のURL"
              {...register("iconURL")}
              error={!!errors.iconURL}
              helperText={errors.iconURL?.message}
              fullWidth
              required
            />
            <TextField
              label="プレイヤー数"
              type="number"
              {...register("players")}
              error={!!errors.players}
              helperText={errors.players?.message}
              fullWidth
              required
              InputProps={{ inputProps: { min: 1 } }} // HTML5の最小値制約
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button onClick={handleClose} color="secondary">
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "更新中..." : "更新"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </MuiModal>
  );
}
