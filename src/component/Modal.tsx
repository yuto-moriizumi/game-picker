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
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { addGame } from "@/app/actions";
import { getQueryClient } from "./Provider";

const schema = yup
  .object({
    id: yup.number().integer().required(),
  })
  .required();
type FormType = yup.InferType<typeof schema>;

export function Modal() {
  const [open, setOpen] = useState(false);
  const methods = useForm<FormType>({ resolver: yupResolver(schema) });

  const save = useMutation({
    mutationFn: addGame,
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: ["games"] });
      setOpen(false);
    },
  });

  return (
    <>
      <MuiModal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ top: "50%", width: "500px", marginX: "auto" }}
      >
        <Paper>
          <form onSubmit={methods.handleSubmit(({ id }) => save.mutate(id))}>
            <Stack>
              <TextField label="ID" {...methods.register("id")} />
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
