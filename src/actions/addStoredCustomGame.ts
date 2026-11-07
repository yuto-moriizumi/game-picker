"use server";

import { getDb } from "@/lib/db";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// カスタムゲームを追加する新しい関数（プレイヤー数を追加）
export async function addStoredCustomGame(
  name: string,
  iconURL: string,
  players: number, // プレイヤー数を引数に追加
) {
  "use server";
  initializeServices();
  const sql = getDb();
  // プレイヤー数を含めて新しいゲームを作成
  await sql`
    INSERT INTO custom_games (name, icon_url, players)
    VALUES (${name}, ${iconURL}, ${players})
  `;
  revalidatePath("/"); // 追加後にキャッシュを再検証
}
