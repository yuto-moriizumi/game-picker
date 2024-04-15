"use server";

import { GameModel } from "@/model/Game";

export async function remove(id: string) {
  "use server";
  return new GameModel({ id }).delete();
}
