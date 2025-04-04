import { create } from "zustand";

interface TextState {
  sharedText: string;
  setText: (text: string) => void;
}

export const useTextStore = create<TextState>((set) => ({
  sharedText: "",
  setText: (text) => set({ sharedText: text }),
}));
