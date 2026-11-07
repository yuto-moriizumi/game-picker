"use server";

import { getDb } from "@/lib/db";
import { StoredCustomGame } from "@/model/StoredCustomGame";
import { StoredSteamGame } from "@/model/StoredSteamGame";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// removeSteamGame と removeCustomGame を統合した新しい関数
export async function removeStoredGame(
  game: StoredSteamGame | StoredCustomGame,
) {
  "use server";
  initializeServices();

  const sql = getDb();

  if (game.type === "storedSteam") {
    await sql`DELETE FROM steam_games WHERE app_id = ${String(game.id)}`;
  } else if (game.type === "storedCustom") {
    // custom_games は custom_id を主キーとして使用
    await sql`DELETE FROM custom_games WHERE custom_id = ${game.id}::uuid`;
  } else {
    // 想定外のタイプの場合はエラーを投げるか、ログを出力するなど
    console.error("Unknown game type for removal:", game);
    throw new Error("Cannot remove game of unknown type");
  }

  revalidatePath("/");
}
