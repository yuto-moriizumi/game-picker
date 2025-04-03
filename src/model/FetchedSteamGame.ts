import { Game } from "./Game";

export interface FetchedSteamGame extends Game {
  type: "fetchedSteam";
}
