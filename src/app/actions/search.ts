"use server";
import { searchProducts } from "@/lib/catalog";

export async function instantSearchAction(q: string) {
  const term = q.trim().slice(0, 40);
  if (term.length < 2) return [];
  return searchProducts(term, "popular", 12);
}
