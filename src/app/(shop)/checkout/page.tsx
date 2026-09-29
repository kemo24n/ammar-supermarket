import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, slotsOf } from "@/lib/settings";
import { CheckoutClient } from "@/components/shop/CheckoutClient";
import { prettyPhone } from "@/lib/format";

export const metadata = { title: "إتمام الطلب" };

export default async function Checkout() {
  const [zones, settings, user] = await Promise.all([
    db.select().from(schema.zones).where(eq(schema.zones.active, true)).orderBy(asc(schema.zones.sort)),
    getSettings(),
    getCurrentUser(),
  ]);
  const addresses = user ? await db.select().from(schema.addresses).where(eq(schema.addresses.userId, user.id)).orderBy(desc(schema.addresses.createdAt)) : [];
  return (
    <CheckoutClient
      zones={zones.map((z) => ({ id: z.id, name: z.name, fee: z.fee, minutes: z.minutes }))}
      slots={slotsOf(settings)}
      user={user ? { name: user.name, phone: prettyPhone(user.phone), points: user.points } : null}
      addresses={addresses.map((a) => ({ id: a.id, label: a.label, zoneId: a.zoneId, street: a.street, building: a.building ?? "", floor: a.floor ?? "" }))}
    />
  );
}
