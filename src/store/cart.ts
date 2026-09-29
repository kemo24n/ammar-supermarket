"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Currency } from "@/lib/format";
import { lineKey } from "@/lib/weight";

export type CartItem = {
  key: string;
  id: string;
  slug: string;
  name: string;
  /** Display unit ("1 كغ", "علبة", "½ كغ") */
  unit: string;
  /** Price of ONE line unit (for weight items: estimated price of `grams`) */
  price: number;
  grams?: number | null;
  image: string | null;
  qty: number;
  /** Max units available */
  stock: number;
  categoryIcon?: string;
};

export type AddInput = Omit<CartItem, "qty" | "key">;

type CartState = {
  items: CartItem[];
  open: boolean;
  bump: number;
  add: (p: AddInput, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
  sync: (lines: { id: string; grams: number | null; qty: number; price: number; stock: number }[]) => void;
  replaceAll: (items: CartItem[]) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      bump: 0,
      add: (p, qty = 1) =>
        set((s) => {
          const key = lineKey(p.id, p.grams);
          const ex = s.items.find((i) => i.key === key);
          const items = ex
            ? s.items.map((i) => (i.key === key ? { ...i, ...p, key, qty: Math.min(i.qty + qty, p.stock || 99) } : i))
            : [...s.items, { ...p, key, qty: Math.min(qty, p.stock || 99) }];
          return { items, bump: s.bump + 1 };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, i.stock || 99) } : i)),
          bump: s.bump + 1,
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
      sync: (lines) =>
        set((s) => ({
          items: s.items
            .map((i) => {
              const l = lines.find((x) => lineKey(x.id, x.grams) === i.key);
              return l ? { ...i, price: l.price, stock: l.stock, qty: Math.min(i.qty, l.stock) } : null;
            })
            .filter((i): i is CartItem => !!i && i.qty > 0),
        })),
      replaceAll: (items) => set((s) => ({ items, bump: s.bump + 1 })),
    }),
    {
      name: "ammar-cart-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

type PrefState = { currency: Currency; setCurrency: (c: Currency) => void; recent: string[]; pushRecent: (q: string) => void };
export const usePrefs = create<PrefState>()(
  persist(
    (set) => ({
      currency: "SYP",
      setCurrency: (currency) => set({ currency }),
      recent: [],
      pushRecent: (q) => set((s) => ({ recent: [q, ...s.recent.filter((x) => x !== q)].slice(0, 6) })),
    }),
    { name: "ammar-prefs" },
  ),
);

/** UI state for overlays (quick-view sheet, instant search). Not persisted. */
export type SheetProduct = {
  id: string; slug: string; name: string; brand: string | null; unit: string; price: number; comparePrice: number | null;
  stock: number; image: string | null; soldBy: string; weightOptions: string; description?: string | null; category?: { icon: string } | null;
};
type UiState = {
  sheet: SheetProduct | null;
  openSheet: (p: SheetProduct) => void;
  closeSheet: () => void;
  search: boolean;
  setSearch: (v: boolean) => void;
};
export const useUi = create<UiState>()((set) => ({
  sheet: null,
  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
  search: false,
  setSearch: (search) => set({ search }),
}));

export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0);
export const cartLines = (items: CartItem[]) => items.length;
export const cartTotal = (items: CartItem[]) => items.reduce((s, i) => s + i.qty * i.price, 0);
