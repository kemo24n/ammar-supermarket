import * as L from "lucide-react";
import type { LucideProps } from "lucide-react";

const MAP = {
  Apple: L.Apple, Carrot: L.Carrot, Milk: L.Milk, Croissant: L.Croissant, Wheat: L.Wheat, Droplets: L.Droplets,
  Soup: L.Soup, CupSoda: L.CupSoda, Cookie: L.Cookie, Coffee: L.Coffee, Egg: L.Egg, SprayCan: L.SprayCan,
  Sparkles: L.Sparkles, Baby: L.Baby, Flame: L.Flame, Beef: L.Beef, Candy: L.Candy, IceCreamCone: L.IceCreamCone,
  ShoppingBasket: L.ShoppingBasket, Nut: L.Nut, Popcorn: L.Popcorn, Salad: L.Salad, Citrus: L.Citrus, Package: L.Package,
} as const;

export const ICON_NAMES = Object.keys(MAP) as (keyof typeof MAP)[];

export function CatIcon({ name, ...p }: { name?: string | null } & Omit<LucideProps, "name">) {
  const C = (name && (MAP as Record<string, L.LucideIcon>)[name]) || L.ShoppingBasket;
  return <C {...p} />;
}
