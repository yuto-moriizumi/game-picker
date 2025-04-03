"use server";

import { StoredCustomGame, CustomGameModel } from "@/model/StoredCustomGame";
import { StoredSteamGame, SteamGameModel } from "@/model/StoredSteamGame";
import { initializeServices } from "./utils";
import { revalidatePath } from "next/cache";

// removeSteamGame と removeCustomGame を統合した新しい関数
export async function removeStoredGame(
  game: StoredSteamGame | StoredCustomGame,
) {
  "use server";
  initializeServices(); // await を削除

  if (game.type === "storedSteam") {
    await SteamGameModel.delete(game.id);
  } else if (game.type === "storedCustom") {
    // CustomGameModel uses customId as the primary key
    await CustomGameModel.delete({ customId: game.id });
  } else {
    // 想定外のタイプの場合はエラーを投げるか、ログを出力するなど
    console.error("Unknown game type for removal:", game);
    throw new Error("Cannot remove game of unknown type");
  }

  revalidatePath("/"); // 削除後にキャッシュを再検証
}
