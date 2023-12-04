import { model } from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { v4 } from "uuid";

export class Game extends Item {
  id!: string;
  name!: string;
  count!: number;
}

export const ConfigModel = model<Game>("game-picker", {
  id: { type: String, hashKey: true, default: v4 },
  name: String,
  count: Number,
});
