import { GameBase } from "./GameBase";

export interface FetchedSteamGame extends GameBase {
  type: "fetchedSteam";
}
