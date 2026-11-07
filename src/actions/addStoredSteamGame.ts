"use server";

import { getDb } from "@/lib/db";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// id の型を string に変更

export async function addStoredSteamGame(id: string) {
  // 明確にするために名前変更: addSteamGame
  "use server";
  initializeServices();

  const appId = Number(id);
  if (!Number.isInteger(appId)) {
    throw new Error(`Invalid Steam app id: ${id}`);
  }

  const sql = getDb();
  // 既に登録済みの場合は何もしない
  await sql`
    INSERT INTO steam_games (app_id)
    VALUES (${String(appId)})
    ON CONFLICT (app_id) DO NOTHING
  `;
  revalidatePath("/"); // 追加後にキャッシュを再検証
}
