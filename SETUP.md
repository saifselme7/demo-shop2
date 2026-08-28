# سيف ستور — SETUP & MANUAL SUPABASE STEPS

This project is a complete Arabic Egyptian **clothing e-commerce store** built on
Next.js 14 + Supabase. It uses the new Supabase project:

- **Project URL:** `https://pluilmszldtetbumdbxt.supabase.co`
- **Credentials:** public / publishable key only (stored in `.env.local`, never
  committed). No service_role key is used anywhere.

> ⚠️ The application could **not** be live-tested against this Supabase project
> from the build sandbox because the sandbox has **no outbound internet** and
> only the publishable key was provided (no service_role / DB connection to run
> migrations remotely). The schema below is complete and must be applied once in
> the Supabase dashboard. These are the ONLY manual steps required.

---

## 1. Environment variables

Copy `.env.example` to `.env.local` (already present in this workspace, not
committed to git). It contains only:

```
NEXT_PUBLIC_SUPABASE_URL=https://pluilmszldtetbumdbxt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_E7w-tyjysvzUuFVCckj9vA_Rfm60Q-b
```

Never add a `service_role` key here.

## 2. Apply the database schema (MANUAL — required)

1. Open the Supabase dashboard for `pluilmszldtetbumdbxt.supabase.co`.
2. **SQL Editor → New query.**
3. Paste the **entire** contents of [`supabase/schema.sql`](supabase/schema.sql)
   and run it.

This creates all tables (`categories`, `products`, `product_images`,
`profiles`, `store_settings`, `orders`, `order_items`), enables **RLS on every
table**, creates the secure RPC functions (`create_order`,
`get_order_by_number`, `is_admin`), the storage policies, and seeds a complete
Egyptian Arabic clothing catalog (8 categories + 23 products) plus store
settings.

## 3. Storage buckets (MANUAL — recommended via dashboard)

The schema tries to create both buckets via SQL, but the guaranteed way is:

1. **Storage → New bucket**
2. **Bucket 1:** name `product-images`, **Public = ON** (storefront product photos)
3. **Bucket 2:** name `payment-proofs`, **Public = OFF** (private customer payment screenshots)

The schema already created the storage RLS policies:
- `product-images`: public read; only authenticated admin uploads.
- `payment-proofs`: **private**, customers can upload (anon INSERT) but only
  admins can read (signed URL in the admin order review).

## 4. Create the first admin account (MANUAL — one-time)

1. Open the site → visit `/admin/login`.
2. Click **"إنشاء حساب جديد (أول حساب يصبح مديراً)"** and register.
3. The **first** account to register automatically gets `role = admin` (full
   dashboard access). Every account registered afterwards becomes a regular
   customer with **no** dashboard access.

> If you prefer to designate a specific existing user as admin instead, run this
> in the SQL editor (replace the email):
> ```sql
> UPDATE public.profiles
> SET role = 'admin'
> WHERE id = (SELECT id FROM auth.users WHERE email = 'owner@example.com' LIMIT 1);
> ```

## 5. Run the app

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

---

## Owner workflow (no code edits needed)

- **Products** → `/admin/products` (add / edit / delete, price, old price,
  category, availability, featured, stock, sort order, image).
- **Categories** → `/admin/categories` (name, slug, description, image,
  active/inactive, sort order).
- **Orders & payment review** → `/admin/orders` (view full order, customer,
  items, totals, payment method, transfer number, **payment screenshot**; then
  Approve / Reject / Mark-pending, with rejection reason; separate order status).
- **Store settings** → `/admin/settings` (store name, contact, payment numbers,
  delivery fee, hero copy — reflected on the storefront immediately).

---

## Security notes

- Only the public/publishable key is exposed to the browser.
- RLS is enabled on **all** tables. Anonymous customers create orders only via
  the `create_order` RPC (server-side price/total validation, stock check) and
  track orders only via `get_order_by_number` (requires matching phone). They
  cannot read the `orders` / `order_items` tables directly.
- Payment screenshots are stored in a **private** bucket and shown to admins via
  short-lived signed URLs.
- Order status and payment status are independent fields.
