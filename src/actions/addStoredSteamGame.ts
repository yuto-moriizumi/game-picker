"use server";

import { SteamGameModel } from "@/model/StoredSteamGame";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// id の型を string に変更

export async function addStoredSteamGame(id: string) {
  // 明確にするために名前変更: addSteamGame
  "use server";
  initializeServices(); // await を削除

  // IDが既に存在するかどうかを確認する検証を追加することを検討
  await new SteamGameModel({ id }).save(); // Dynamoose はスキーマに基づいて型を処理するはず
  revalidatePath("/"); // 追加後にキャッシュを再検証
}
