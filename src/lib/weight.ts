// Shared (client + server) helpers for products sold by weight.
export type SoldBy = "unit" | "weight";

export function weightOptions(s: string | null | undefined): number[] {
  const list = (s ?? "500,1000").split(",").map((x) => parseInt(x.trim(), 10)).filter((n) => n > 0 && n <= 10000);
  return list.length ? [...new Set(list)].sort((a, b) => a - b) : [500, 1000];
}

export function gramsLabel(g: number) {
  if (g === 250) return "ربع كغ";
  if (g === 500) return "½ كغ";
  if (g === 1000) return "1 كغ";
  if (g % 1000 === 0) return `${g / 1000} كغ`;
  if (g > 1000) return `${(g / 1000).toFixed(1).replace(/\.0$/, "")} كغ`;
  return `${g} غ`;
}

/** Estimated price for one line unit of `grams`, rounded to the nearest 5 SYP. */
export function weightPrice(pricePerKg: number, grams: number) {
  return Math.max(5, Math.round((pricePerKg * grams) / 1000 / 5) * 5);
}

/** Units of `grams` that the current stock (in grams) can cover. */
export function unitsInStock(stockGrams: number, grams: number) {
  return Math.floor(stockGrams / grams);
}

export function lineKey(id: string, grams?: number | null) {
  return grams ? `${id}@${grams}` : id;
}

export function kgText(grams: number) {
  const kg = grams / 1000;
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} كغ`;
}
