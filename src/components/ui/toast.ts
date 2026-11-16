'use client';

import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onAction: () => void };
  durationMs: number;
}

interface ToastInput {
  message: string;
  tone?: ToastTone;
  action?: ToastItem['action'];
  durationMs?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  show: (input: ToastInput) => number;
  dismiss: (id: number) => void;
}

let nextId = 1;
const MAX_VISIBLE = 3;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: ({ message, tone = 'info', action, durationMs }) => {
    const id = nextId++;
    const item: ToastItem = {
      id,
      message,
      tone,
      durationMs: durationMs ?? (action ? 7000 : 4500),
      ...(action ? { action } : {}),
    };
    set((s) => ({ toasts: [...s.toasts, item].slice(-MAX_VISIBLE) }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative API so any module (stores, handlers) can raise a toast. */
export const toast = {
  show: (input: ToastInput) => useToastStore.getState().show(input),
  success: (message: string, extra?: Omit<ToastInput, 'message' | 'tone'>) =>
    useToastStore.getState().show({ message, tone: 'success', ...extra }),
  error: (message: string, extra?: Omit<ToastInput, 'message' | 'tone'>) =>
    useToastStore.getState().show({ message, tone: 'error', ...extra }),
  dismiss: (id: number) => useToastStore.getState().dismiss(id),
};
