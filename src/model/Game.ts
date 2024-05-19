import { model } from "dynamoose";
import { Item } from "dynamoose/dist/Item";

class GameItem extends Item {
  id!: number;
}

export const GameModel = model<GameItem>("game-picker", {
  id: Number,
});

export type Game = {
  id: number;
  name: string;
  iconURL: string;
  count: number;
  isTracked?: boolean;
};
