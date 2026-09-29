// عمار للتسوق — database schema (Drizzle ORM + PostgreSQL)
// All money values are integers in NEW Syrian pounds (ل.س الجديدة — after removing two zeros).
import { relations, sql } from "drizzle-orm";
import {
  boolean, index, integer, pgEnum, pgTable, primaryKey, text, timestamp,
} from "drizzle-orm/pg-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const roleEnum = pgEnum("role", ["CUSTOMER", "STAFF", "DRIVER", "ADMIN"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
]);
export const paymentEnum = pgEnum("payment_method", ["COD_SYP", "COD_USD"]);
export const couponTypeEnum = pgEnum("coupon_type", ["PERCENT", "FIXED", "FREE_DELIVERY"]);

export type Role = (typeof roleEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentEnum.enumValues)[number];
export type CouponType = (typeof couponTypeEnum.enumValues)[number];

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("CUSTOMER").notNull(),
  points: integer("points").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  vehicle: text("vehicle"),
  createdAt: createdAt(),
});

export const zones = pgTable("delivery_zones", {
  id: id(),
  name: text("name").notNull().unique(),
  fee: integer("fee").notNull(),
  minutes: integer("minutes").default(35).notNull(),
  active: boolean("active").default(true).notNull(),
  sort: integer("sort").default(0).notNull(),
});

export const addresses = pgTable("addresses", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").default("المنزل").notNull(),
  zoneId: text("zone_id").notNull().references(() => zones.id),
  street: text("street").notNull(),
  building: text("building"),
  floor: text("floor"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const categories = pgTable("categories", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").default("ShoppingBasket").notNull(),
  image: text("image"),
  tint: text("tint").default("#FFF1F1").notNull(),
  sort: integer("sort").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const products = pgTable("products", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  brand: text("brand"),
  description: text("description"),
  unit: text("unit").default("قطعة").notNull(),
  /** "unit" = sold per piece; "weight" = sold by weight — price is PER KG, stock is in GRAMS. */
  soldBy: text("sold_by").default("unit").notNull(),
  /** Allowed weight options in grams (comma separated), e.g. "500,1000". */
  weightOptions: text("weight_options").default("500,1000").notNull(),
  price: integer("price").notNull(),
  comparePrice: integer("compare_price"),
  stock: integer("stock").default(0).notNull(),
  sku: text("sku").unique(),
  barcode: text("barcode"),
  image: text("image"),
  featured: boolean("featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  soldCount: integer("sold_count").default(0).notNull(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [index("products_category_idx").on(t.categoryId), index("products_active_idx").on(t.active, t.featured)]);

export const banners = pgTable("banners", {
  id: id(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  cta: text("cta").default("تسوّق الآن").notNull(),
  href: text("href").default("/offers").notNull(),
  image: text("image"),
  theme: text("theme").default("red").notNull(), // red | dark | light
  sort: integer("sort").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const coupons = pgTable("coupons", {
  id: id(),
  code: text("code").notNull().unique(),
  type: couponTypeEnum("type").notNull(),
  value: integer("value").default(0).notNull(),
  minOrder: integer("min_order").default(0).notNull(),
  maxUses: integer("max_uses"),
  used: integer("used").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  active: boolean("active").default(true).notNull(),
  createdAt: createdAt(),
});

export const orders = pgTable("orders", {
  id: id(),
  code: text("code").notNull().unique(),
  userId: text("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  zoneId: text("zone_id").notNull().references(() => zones.id),
  addressText: text("address_text").notNull(),
  notes: text("notes"),
  slot: text("slot").default("بأسرع وقت").notNull(),
  status: orderStatusEnum("status").default("PENDING").notNull(),
  payment: paymentEnum("payment").default("COD_SYP").notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  discount: integer("discount").default(0).notNull(),
  pointsUsed: integer("points_used").default(0).notNull(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  total: integer("total").notNull(),
  usdRate: integer("usd_rate").notNull(),
  couponCode: text("coupon_code"),
  driverId: text("driver_id").references(() => users.id),
  cashCollected: boolean("cash_collected").default(false).notNull(),
  rating: integer("rating"),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [index("orders_status_idx").on(t.status), index("orders_created_idx").on(t.createdAt)]);

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  image: text("image"),
  /** For weight products: grams per unit of this line (e.g. 500 = ½ كغ). Price is the estimated price of one such unit. */
  grams: integer("grams"),
  price: integer("price").notNull(),
  qty: integer("qty").notNull(),
});

export const favorites = pgTable("favorites", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
}, (t) => [primaryKey({ columns: [t.userId, t.productId] })]);

export const orderEvents = pgTable("order_events", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  createdAt: createdAt(),
});

export const pointsTx = pgTable("points_tx", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  createdAt: createdAt(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  storeName: text("store_name").default("عمار للتسوق").notNull(),
  tagline: text("tagline").default("احسبها صح.. بالمكان الأوفر").notNull(),
  phone: text("phone").default("+963 21 264 2156").notNull(),
  whatsapp: text("whatsapp").default("963212642156").notNull(),
  address: text("address").default("حلب، حي المحافظة — بعد مطعم حاج عبدو").notNull(),
  usdRate: integer("usd_rate").default(138).notNull(),
  minOrder: integer("min_order").default(200).notNull(),
  freeDeliveryOver: integer("free_delivery_over").default(2000).notNull(),
  pointsPerAmount: integer("points_per_amount").default(100).notNull(),
  pointValue: integer("point_value").default(1).notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  openHours: text("open_hours").default("يومياً من 8 صباحاً حتى 12 ليلاً").notNull(),
  announcement: text("announcement").default(sql`'توصيل مجاني للطلبات فوق 2,000 ل.س'`),
  slots: text("slots").default("بأسرع وقت|10:00 - 12:00|12:00 - 14:00|16:00 - 18:00|18:00 - 20:00|20:00 - 22:00").notNull(),
});

/* ---------- relations ---------- */
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders, { relationName: "customer" }),
  deliveries: many(orders, { relationName: "driver" }),
  pointsLog: many(pointsTx),
}));
export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
  zone: one(zones, { fields: [addresses.zoneId], references: [zones.id] }),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({ products: many(products) }));
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id], relationName: "customer" }),
  driver: one(users, { fields: [orders.driverId], references: [users.id], relationName: "driver" }),
  zone: one(zones, { fields: [orders.zoneId], references: [zones.id] }),
  items: many(orderItems),
  events: many(orderEvents),
}));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));
export const pointsTxRelations = relations(pointsTx, ({ one }) => ({
  user: one(users, { fields: [pointsTx.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Zone = typeof zones.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Settings = typeof settings.$inferSelect;
