import { model } from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { v4 as uuidv4 } from "uuid"; // 一意のIDを生成するため

// CustomGameテーブルのアイテムの構造を定義
class CustomGameItem extends Item {
  customId!: string; // プライマリキー (UUID)
  name!: string;
  iconURL!: string;
  players!: number; // プレイヤー数
}

// カスタムゲーム用のDynamooseスキーマとモデルを定義
// 物事を分離するために別のテーブル名を使用
export const CustomGameModel = model<CustomGameItem>("custom-game-picker", {
  customId: {
    type: String,
    hashKey: true, // プライマリハッシュキーとして設定
    default: () => uuidv4(), // 作成時にUUIDを自動生成
  },
  name: {
    type: String,
    required: true,
  },
  iconURL: {
    type: String,
    required: true,
  },
  players: {
    // プレイヤー数を格納するフィールド
    type: Number,
    required: true, // 必須フィールドとして設定
  },
});

import { GameBase } from "./GameBase";

export interface StoredCustomGame extends GameBase {
  type: "storedCustom";
}
