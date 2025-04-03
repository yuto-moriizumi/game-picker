import { model } from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { GameBase } from "./GameBase";

class SteamGame extends Item {
  id!: number;
}

export const SteamGameModel = model<SteamGame>("game-picker", {
  id: Number,
});

export interface StoredSteamGame extends GameBase {
  type: "storedSteam";
}
