export interface GameBase {
  type: "fetchedSteam" | "storedSteam" | "storedCustom"; // ゲームのタイプを明示的に指定
  id: string;
  name: string;
  iconURL?: string;
  count: number;
}
