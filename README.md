# Shopzon – Amazon-style shopping website

Frontend (HTML/CSS/JS) + Node.js backend. Koi npm package install nahi karna padta.

## Features
- Amazon jaisa UI: header, search, category bar, hero slider, product grid, filters, sorting
- Real product images (internet se; na mile to emoji fallback dikhta hai)
- Real login/register (password scrypt se hash hota hai, token HMAC se signed)
- Wish list, product reviews (sirf logged-in users), coupon codes, cart, checkout, order history
- Data `data/db.json` file mein save hota hai (users, reviews, wishlist, orders)

## Run kaise karein
1. **Node.js install karein** (version 18 ya usse naya): https://nodejs.org -> LTS download karein.
   Check karne ke liye terminal mein `node -v` chalayein.
2. Zip ko **Extract** karein, phir terminal/CMD kholkar folder mein jayein:
   ```
   cd shopzon
   ```
3. Server start karein:
   ```
   npm start
   ```
   (ya `node server.js`)
4. Browser mein kholein: **http://localhost:3000**
   Server band karne ke liye terminal mein `Ctrl + C`.

Port badalna ho: `PORT=4000 npm start` (Windows PowerShell: `$env:PORT=4000; npm start`).
Note: `index.html` ko seedha double-click karke mat kholein, server (`npm start`) zaroori hai.

## Demo ke liye flow (show karte waqt)
1. "Account & Lists" par click karke **Create your account**
2. Kisi product par ♡ dabayein -> upar **Wish List** mein dikhega
3. Product kholkar **review** likhein
4. Add to Cart -> Cart mein coupon lagayein: `SAVE10` (10% off, max Rs 500), `WELCOME200` (Rs 999+ cart par Rs 200 off), `FREESHIP`
5. Proceed to Buy -> address bharein -> order place -> **Returns & Orders** mein dikhega

## Folder structure
```
shopzon/
|-- server.js          # backend: API + static files
|-- package.json
|-- data/
|   |-- products.json  # products (yahan edit karke naye products/images dalein)
|   `-- db.json        # auto-bnta hai: users, reviews, orders
`-- public/
    |-- index.html
    |-- style.css
    `-- app.js         # frontend logic
```

## Customize
- **Apni images lagana:** images `public/images/` mein rakhein, phir `data/products.json` mein us product ka `"img"` badal kar `"images/naam.jpg"` kar dein.
- **Naya product:** `data/products.json` mein ek object add karein (id unique rakhein).
- **Coupon badalna:** `server.js` mein `COUPONS` object edit karein.
- **Secret key:** deploy karte waqt `SECRET=koi-lambi-random-string` environment variable set karein.

## Dhyan dein
- Ye learning/demo project hai. Payment (UPI/Card) sirf demo hai, real payment nahi hota.
- Data JSON file mein save hota hai; real production ke liye database (MongoDB/PostgreSQL/Firebase) use karein.
- Online hosting (Render, Railway, etc.) par bhi chal jayega, bas start command `npm start` rakhein.
