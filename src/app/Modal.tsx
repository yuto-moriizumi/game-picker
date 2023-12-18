"use client";

import {
  Button,
  Fab,
  Modal as MuiModal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { GameModel } from "@/model/Game";

const schema = yup
  .object({
    name: yup.string().required(),
    count: yup.number().integer().required(),
  })
  .required();
type FormType = yup.InferType<typeof schema>;

export function Modal(props: {
  onSave: (name: string, count: number) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const methods = useForm<FormType>({ resolver: yupResolver(schema) });

  const onSubmit = methods.handleSubmit(
    async ({ name, count }) => await props.onSave(name, count),
  );

  return (
    <>
      <MuiModal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ top: "50%", width: "500px", marginX: "auto" }}
      >
        <Paper>
          <form onSubmit={onSubmit}>
            <Stack>
              <TextField label="タイトル" {...methods.register("name")} />
              <TextField label="プレイヤー数" {...methods.register("count")} />
              <Button type="submit">追加</Button>
            </Stack>
          </form>
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
