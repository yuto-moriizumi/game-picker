import { Game } from "@/model/Game";

export interface GameData {
  games: Game[];
  lastExecuted: string;
}