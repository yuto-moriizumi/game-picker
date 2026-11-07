import { GameBase } from "./GameBase";

export interface StoredSteamGame extends GameBase {
  type: "storedSteam";
}
