"use client";

import {
  Box,
  Button,
  Fab,
  Modal as MuiModal,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import { useState, SyntheticEvent } from "react"; // SyntheticEventを追加
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form"; // SubmitHandlerを追加
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { getQueryClient } from "./Provider";
import { addStoredCustomGame } from "@/actions/addStoredCustomGame";
import { addStoredSteamGame } from "@/actions/addStoredSteamGame";

// IDによるSteamゲーム追加のスキーマ
const steamSchema = yup
  .object({
    id: yup
      .number()
      .typeError("IDは数値である必要があります")
      .integer()
      .required(),
  })
  .required();
type SteamFormType = yup.InferType<typeof steamSchema>;

// カスタムゲーム追加のスキーマ
const customSchema = yup
  .object({
    name: yup.string().required(),
    iconURL: yup.string().url("有効なURLである必要があります").required(),
    players: yup // プレイヤー数を追加
      .number()
      .typeError("プレイヤー数は数値である必要があります")
      .integer("プレイヤー数は整数である必要があります")
      .min(1, "プレイヤー数は1以上である必要があります") // 最小値を設定
      .required(),
  })
  .required();
type CustomFormType = yup.InferType<typeof customSchema>;

// フォーム状態の結合型
type FormType = SteamFormType | CustomFormType;

export function AddGameModal() {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0はSteam、1はカスタム

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // タブ切り替え時にフォームをリセット
    steamMethods.reset();
    customMethods.reset();
  };

  // 各タイプごとに個別のフォームインスタンス
  const steamMethods = useForm<SteamFormType>({
    resolver: yupResolver(steamSchema),
  });
  const customMethods = useForm<CustomFormType>({
    resolver: yupResolver(customSchema),
  });

  const queryClient = getQueryClient();

  // Steamゲーム追加のミューテーション
  const addSteamMutation = useMutation({
    mutationFn: addStoredSteamGame,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["games"] });
      setOpen(false);
      steamMethods.reset(); // 成功時にフォームをリセット
    },
  });

  // カスタムゲーム追加のミューテーション（プレイヤー数を追加）
  const addCustomMutation = useMutation({
    mutationFn: (
      data: { name: string; iconURL: string; players: number }, // playersを追加
    ) => addStoredCustomGame(data.name, data.iconURL, data.players), // playersを渡す
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["games"] });
      setOpen(false);
      customMethods.reset(); // 成功時にフォームをリセット
    },
  });

  // サブミットハンドラーはタブに基づいてどのミューテーションを呼び出すかを決定
  const onSubmit: SubmitHandler<FormType> = (data) => {
    if (tabValue === 0 && "id" in data) {
      addSteamMutation.mutate(data.id.toString());
    } else if (
      tabValue === 1 &&
      "name" in data &&
      "iconURL" in data &&
      "players" in data // playersの存在を確認
    ) {
      // playersをミューテーションに渡す
      addCustomMutation.mutate({
        name: data.name,
        iconURL: data.iconURL,
        players: data.players,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    steamMethods.reset();
    customMethods.reset();
    setTabValue(0); // タブをデフォルトにリセット
  };

  return (
    <>
      <MuiModal
        open={open}
        onClose={handleClose} // カスタムクローズハンドラーを使用
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} // モーダルを中央揃え
      >
        <Paper sx={{ width: "90%", maxWidth: "500px", p: 0 }}>
          {" "}
          {/* パディングを調整 */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="add game type tabs"
              variant="fullWidth"
            >
              <Tab
                label="Steamゲームを追加 (ID)"
                id="simple-tab-0"
                aria-controls="simple-tabpanel-0"
              />
              <Tab
                label="カスタムゲームを追加"
                id="simple-tab-1"
                aria-controls="simple-tabpanel-1"
              />
            </Tabs>
          </Box>
          {/* Steamゲームフォーム */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <form onSubmit={steamMethods.handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <Typography variant="body1">
                    Steam App IDを入力してください:
                  </Typography>
                  <TextField
                    label="SteamアプリID"
                    type="number" // 数値入力を保証
                    {...steamMethods.register("id")}
                    error={!!steamMethods.formState.errors.id}
                    helperText={steamMethods.formState.errors.id?.message}
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={addSteamMutation.isPending}
                  >
                    {addSteamMutation.isPending
                      ? "追加中..."
                      : "Steamゲームを追加"}
                  </Button>
                </Stack>
              </form>
            </Box>
          )}
          {/* カスタムゲームフォーム */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <form onSubmit={customMethods.handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <Typography variant="body1">
                    カスタムゲームの詳細を入力してください:
                  </Typography>
                  <TextField
                    label="ゲーム名"
                    {...customMethods.register("name")}
                    error={!!customMethods.formState.errors.name}
                    helperText={customMethods.formState.errors.name?.message}
                    fullWidth
                  />
                  <TextField
                    label="アイコン画像のURL"
                    {...customMethods.register("iconURL")}
                    error={!!customMethods.formState.errors.iconURL}
                    helperText={customMethods.formState.errors.iconURL?.message}
                    fullWidth
                  />
                  {/* プレイヤー数入力フィールドを追加 */}
                  <TextField
                    label="プレイヤー数"
                    type="number" // 数値入力を保証
                    {...customMethods.register("players")}
                    error={!!customMethods.formState.errors.players}
                    helperText={customMethods.formState.errors.players?.message}
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={addCustomMutation.isPending}
                  >
                    {addCustomMutation.isPending
                      ? "追加中..."
                      : "カスタムゲームを追加"}
                  </Button>
                </Stack>
              </form>
            </Box>
          )}
        </Paper>
      </MuiModal>
      <Fab
        variant="extended"
        color="primary"
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
        }}
        onClick={() => setOpen(true)}
      >
        <Add />
        <Typography>ゲームを追加</Typography>
      </Fab>
    </>
  );
}
