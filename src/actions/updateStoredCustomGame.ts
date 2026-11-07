"use server";

import { getDb } from "@/lib/db";
import { StoredCustomGame } from "@/model/StoredCustomGame";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// カスタムゲームを更新する新しい関数

export async function updateStoredCustomGame(game: StoredCustomGame) {
  "use server";
  initializeServices();

  const sql = getDb();
  // 指定された custom_id (game.id) でゲームを更新
  await sql`
    UPDATE custom_games
    SET name = ${game.name},
        icon_url = ${game.iconURL},
        players = ${game.count}
    WHERE custom_id = ${game.id}::uuid
  `;
  revalidatePath("/"); // 更新後にキャッシュを再検証
}
