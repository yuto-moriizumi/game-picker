import { model } from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { Game } from "./Game";

class SteamGame extends Item {
  id!: number;
}

export const SteamGameModel = model<SteamGame>("game-picker", {
  id: Number,
});

export interface StoredSteamGame extends Game {
  type: "storedSteam";
}
