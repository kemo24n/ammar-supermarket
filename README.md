# عمار للتسوق — Ammar Supermarket Platform

A complete Arabic (RTL) online-ordering and delivery system for **سوبر ماركت عمار — حلب، حي المحافظة**, built by **Solunera** (Kamel Nassif).

It has four parts in one codebase:

| App | URL | Who uses it |
|---|---|---|
| Customer store (mobile-first PWA) | `/` | Customers in Aleppo |
| Admin dashboard | `/admin` | The owner and cashier staff |
| Driver app | `/driver` | Delivery drivers, from their phones |
| Order tracking | `/order/AM-xxxxx` | Customers, live status that refreshes itself |

---

## Features

**Store (built for phones first)**
- Swipeable hero slider, story-style category circles, a daily-offers countdown, a fresh-produce section, best sellers, category rails and a "buy again" row for returning customers
- **Produce sold by weight:** the customer picks ½ كغ or 1 كغ and sees an estimated price. After weighing, staff enter the real amount on the order and the totals update.
- **Quick-view bottom sheet:** tapping a product on a phone opens a sheet you can swipe down to close, instead of leaving the page
- **Instant search** with live results as you type, recent searches and popular terms
- A floating "view basket" bar with the total and how much is left for free delivery, and the product image "flies" into the basket when added (with a light vibration on phones)
- Favourites (heart) and one-tap **reorder** of a past order at today's prices
- Page transitions, skeleton loading screens and custom brand illustrations (empty basket, delivery scooter, order success, fresh produce, gift). Motion is turned off for users who ask for reduced motion.
- Installable as an app on Android and iPhone, with an install prompt, icons and an offline page
- Search by name, brand, category or barcode, with sorting and filters
- Cart drawer with a progress bar toward free delivery
- Checkout: Aleppo neighbourhood zones with their own fees and ETAs, delivery time slots, and cash on delivery in **SYP or USD**
- The **SYP / $** toggle converts every price with the exchange rate set by the admin
- Coupon codes (percentage, fixed amount or free delivery)
- **Loyalty points:** new accounts get 20 points; customers earn points on delivered orders and can pay up to 50% of the basket with them
- Live order tracking with a timeline, ETA, driver name and call button, and a star rating after delivery
- Customer accounts: order history, saved addresses and a points ledger
- Floating WhatsApp button and a "send your list on WhatsApp" band
- Forgot password: the customer messages the store on WhatsApp, and the admin generates a temporary password in one click. Customers can change their password from their account.

**Admin**
- Dashboard: today's sales vs. yesterday, orders by status, a 14-day sales chart, top products, low-stock alerts, latest orders and a switch to open or close the store
- Orders board with status tabs, search and date filters. It refreshes every 20 seconds and plays a **sound plus a pop-up** when a new order arrives.
- Order page: one-click next step (confirm → prepare → hand to driver → delivered), assign a driver, cancel (stock and points are restored automatically), a pre-written WhatsApp status message to the customer, Google Maps, and a **printable invoice**
- **Works on the owner's phone:** a bottom tab bar, orders shown as cards, and products as cards with inline price and stock editing
- Products: price and stock are edited **inline in the table**, sold by piece or **by weight** (price per kg, stock in kg), plus featured/visible toggles, image upload, **CSV/Excel import** (updates rows by SKU, which is ideal for daily price changes) and CSV export
- Categories (icon, colour, image), homepage banners, coupons, delivery zones, customers (total spend, manual point adjustments), team and driver accounts, and settings (exchange rate, minimum order, free-delivery threshold, time slots, points rules, announcement bar)

**Driver**
- Assigned orders, the amount of cash to collect (SYP/USD), and call, WhatsApp and Maps buttons
- A big "I've picked it up" button, then "Delivered and cash collected"
- A total of the cash collected today

**Server-side safety**
- Prices, discounts and points are **always recalculated on the server**; the server never trusts the prices sent from the browser.
- Product rows are locked while an order is placed (`SELECT … FOR UPDATE`), so an item can't be oversold.
- The session is an httpOnly signed JWT. Roles are `CUSTOMER`, `STAFF`, `DRIVER` and `ADMIN`, enforced in both the middleware and every server action.
- Order-tracking links carry an HMAC token, so nobody can browse other people's orders by guessing codes.
- Passwords are hashed with bcrypt, inputs are validated with Zod, and image uploads are type- and size-checked.
- Login, sign-up, order and tracking requests are rate-limited against password guessing and fake-order spam.

---

## Tech stack

- **Next.js 15** (App Router, Server Actions) with **TypeScript** and **Tailwind CSS**
- **PostgreSQL** with **Drizzle ORM**. It is pure JavaScript, so there are no engine binaries to download, which suits servers in Syria.
- Cairo font, self-hosted (no Google Fonts dependency)
- Recharts, Zustand (cart), lucide-react icons and Papaparse (CSV)
- Docker and docker-compose. The app builds as a standalone Next.js output.

All money values are integers in **new Syrian pounds** (the 2026 lira, with two zeros removed).

---

## Run locally

```bash
cp .env.example .env              # set DATABASE_URL + AUTH_SECRET
npm install
npm run db:push                   # create tables
npm run db:seed                   # sample catalogue + demo orders (FORCE_SEED=1 to wipe and re-seed)
npm run dev                       # http://localhost:3000
```

## Deploy with Docker (VPS)

```bash
cp .env.example .env              # set AUTH_SECRET, DB_PASSWORD, SITE_URL; SEED_DEMO=0 for a clean launch
docker compose up -d --build
```

The `migrate` job creates the tables and seeds the database once. It won't wipe existing data. Uploaded images go to the `uploads` volume. Put Nginx or Caddy in front for HTTPS.

## Demo accounts (change them before going live)

| Role | Phone | Password |
|---|---|---|
| Admin | 0900000001 | Ammar@2026 |
| Staff | 0900000002 | Staff@2026 |
| Driver | 0900000011 / 0900000012 | Driver@2026 |
| Customer | register at `/register` | — |

Staff and drivers log in at **`/staff-login`**.

---

## Before launch: checklist with the client

1. **Logo:** `public/brand/mark.svg` is a vector redraw of the logo from their Instagram. Ask for the original file and swap it in.
2. **Products and prices:** the seeded catalogue (**216 items in 14 categories**, prices estimated from September 2026 Aleppo market levels at about 138 SYP per dollar) is a **sample**. Download the template at *Admin → Products → Import from Excel*, fill in the real items, then upload it.
3. **Product photos:** upload them per product or put image URLs in the CSV. Items without a photo show a branded tile automatically.
4. **WhatsApp:** set the store's **mobile** WhatsApp number in Settings. The seed uses the landline from Facebook (021 264 2156).
5. **Exchange rate, delivery zones and fees:** check them in Settings and in Delivery Zones.
6. **New-order WhatsApp alert:** fill in `CALLMEBOT_PHONE` and `CALLMEBOT_APIKEY` (free), or swap `src/lib/whatsapp.ts` for the WhatsApp Cloud API.
7. Change all demo passwords from *Admin → Team*.

## CSV columns

`sku, name, category, sold_by, price, compare_price, stock, unit, brand, barcode, image, description`. Set `sold_by` to `weight` for produce; then `price` is per kg and `stock` is in kg. Arabic headers work too: `الاسم, القسم, السعر, السعر_قبل, الكمية, الوحدة, الماركة, الرمز, الباركود, الصورة, الوصف`.
If a row's SKU already exists, that product is updated; otherwise a new one is created. Categories that don't exist yet are created automatically.

---

© Ammar Supermarket. Designed and developed by **Solunera** · [@soluneragency](https://instagram.com/soluneragency)
"# ammar-supermarket" 
