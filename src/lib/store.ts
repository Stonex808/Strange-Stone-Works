import { create } from 'zustand';

export type ForgeIntensity = 'low' | 'medium' | 'high';

interface ForgeState {
  intensity: ForgeIntensity;
  setIntensity: (intensity: ForgeIntensity) => void;
}

export const useForgeStore = create<ForgeState>((set) => ({
  intensity: 'medium',
  setIntensity: (intensity) => set({ intensity })
}));
