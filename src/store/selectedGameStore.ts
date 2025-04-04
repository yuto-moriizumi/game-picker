import { create } from "zustand";
import { Game } from "@/model/Game";

interface SelectedGameState {
  selectedGame: Game | undefined;
  setSelectedGame: (game: Game | undefined) => void;
}

export const useSelectedGameStore = create<SelectedGameState>((set) => ({
  selectedGame: undefined,
  setSelectedGame: (game) => set({ selectedGame: game }),
}));
