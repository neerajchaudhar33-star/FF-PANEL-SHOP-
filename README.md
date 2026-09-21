# ENZYYY — FF PANEL SHOP

A frontend prototype for the ENZYYY store.

## Included
- Responsive gaming-style storefront
- The 3 products and prices supplied in chat
- Product variant selection
- Cart
- Separate demo user accounts stored locally in the browser
- Orders page
- No payment gateway yet

## Important production note
The included localStorage account system is only a prototype. Do NOT use it as a production authentication system because passwords are stored in the browser.

For real accounts, use a backend/auth provider such as Supabase Auth + Postgres with Row Level Security.

## Hosting
The static prototype can be deployed on Vercel:
1. Create a GitHub repository.
2. Upload index.html, style.css and app.js.
3. In Vercel choose New Project and import the repository.
4. Deploy.
Vercel gives you a live *.vercel.app URL and supports custom domains.

## Production upgrade
Before accepting real payments:
- Replace localStorage auth with Supabase Auth.
- Store products/orders in a database.
- Add server-side authorization for admin.
- Add Razorpay only after confirming the products/services are permitted by Razorpay's current merchant policies.
- Verify payments server-side/webhook before marking orders paid.
