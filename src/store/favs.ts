"use client";
import { create } from "zustand";

type FavState = { ids: Set<string>; ready: boolean; init: (ids: string[]) => void; set: (id: string, on: boolean) => void };
export const useFavs = create<FavState>()((set) => ({
  ids: new Set(), ready: false,
  init: (ids) => set({ ids: new Set(ids), ready: true }),
  set: (id, on) => set((s) => { const n = new Set(s.ids); if (on) n.add(id); else n.delete(id); return { ids: n }; }),
}));
