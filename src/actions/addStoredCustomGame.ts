"use server";

import { CustomGameModel } from "@/model/StoredCustomGame";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// カスタムゲームを追加する新しい関数（プレイヤー数を追加）
export async function addStoredCustomGame(
  name: string,
  iconURL: string,
  players: number, // プレイヤー数を引数に追加
) {
  "use server";
  initializeServices(); // await を削除
  // プレイヤー数を含めて新しいゲームを作成
  const newGame = new CustomGameModel({ name, iconURL, players });
  await newGame.save();
  revalidatePath("/"); // 追加後にキャッシュを再検証
}
