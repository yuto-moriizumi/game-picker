"use server";

import { StoredCustomGame, CustomGameModel } from "@/model/StoredCustomGame";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// カスタムゲームを更新する新しい関数

export async function updateStoredCustomGame(game: StoredCustomGame) {
  "use server";
  initializeServices(); // await を削除

  // 更新するデータオブジェクトを作成
  const updateData = {
    name: game.name,
    iconURL: game.iconURL,
    players: game.count, // StoredCustomGame の count は players に対応
  };
  // 指定されたcustomId (game.id) でゲームを更新
  await CustomGameModel.update({ customId: game.id }, updateData);
  revalidatePath("/"); // 更新後にキャッシュを再検証
}
