'use client';

import { create } from 'zustand';

interface DemoUiState {
  resetOpen: boolean;
  openReset: () => void;
  closeReset: () => void;
}

export const useDemoUiStore = create<DemoUiState>((set) => ({
  resetOpen: false,
  openReset: () => set({ resetOpen: true }),
  closeReset: () => set({ resetOpen: false }),
}));
