# Shopzon: Amazon-Style E-Commerce Web Application

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue)

Shopzon is a full-stack online shopping website inspired by Amazon. It combines a responsive storefront with a lightweight Node.js backend that handles authentication, wish lists, product reviews, coupon validation and order management.

The backend uses only Node.js built-in modules, so there are **no dependencies to install**.

**Live demo:** https://amazon-clone-zft3.onrender.com

## Features

**Storefront**
- Sticky header with category-aware search, category navigation bar, auto-sliding hero banner and category tiles
- 22 products across 6 categories: Electronics, Fashion, Home & Kitchen, Books, Beauty and Sports
- Filtering by department, price range and customer rating, plus sorting by price and rating
- Product detail view with quantity selector, Add to Cart and Buy Now
- Light and dark themes (follows the device setting) and a fully responsive layout

**Shopping**
- Cart with quantity controls and removal; free delivery above ₹499, otherwise ₹40
- Coupon codes validated on the server
- Checkout with input validation (name, 10-digit mobile number, address, 6-digit pincode)
- Payment options: Cash on Delivery, UPI and Card (demo only, no real payments)
- Order history for each signed-in user

**Accounts and engagement**
- Registration and login with scrypt-hashed passwords and HMAC-signed tokens (7-day expiry)
- Wish list, saved per user
- Product reviews and ratings from signed-in users

**Security and integrity**
- Order totals, discounts and delivery charges are always calculated server-side from the product catalogue
- Static file server is protected against path traversal
- Request body size is limited

## Tech Stack

| Layer    | Technology                                                  |
|----------|-------------------------------------------------------------|
| Frontend | HTML5, CSS3, vanilla JavaScript                             |
| Backend  | Node.js (built-in `http`, `crypto`, `fs`; no frameworks)    |
| Storage  | JSON files (`data/products.json`, `data/db.json`)           |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 18 or later (check with `node -v`)

### Installation and run
```bash
git clone https://github.com/USERNAME/REPO.git
cd REPO
npm start
```

Open **http://localhost:3000** in your browser. Press `Ctrl + C` in the terminal to stop the server.

> Do not open `index.html` directly from the file system. Products and authentication are served by the backend, so the server must be running.

### Configuration

| Variable | Default                | Description                                  |
|----------|------------------------|----------------------------------------------|
| `PORT`   | `3000`                 | Port the server listens on                   |
| `SECRET` | `dev-secret-change-me` | Secret key used to sign login tokens         |

Example: `PORT=4000 SECRET=my-long-random-string npm start`
(Windows PowerShell: `$env:PORT=4000; $env:SECRET="my-long-random-string"; npm start`)

Always set a strong `SECRET` in production.

## Project Structure

```
.
├── server.js            # Backend: REST API and static file server
├── package.json         # Project metadata and "npm start" script
├── .gitignore           # Excludes data/db.json and node_modules
├── data/
│   ├── products.json    # Product catalogue
│   └── db.json          # Created at runtime: users, reviews, wish lists, orders
└── public/
    ├── index.html       # Page structure (header, footer)
    ├── style.css        # Styling, themes and responsive layout
    └── app.js           # Frontend logic: slider, filters, cart, checkout, auth, reviews
```

## API Reference

All endpoints use JSON. Endpoints marked **Auth** require the header `Authorization: Bearer <token>`.

| Method | Endpoint                       | Auth | Description                               |
|--------|--------------------------------|------|-------------------------------------------|
| GET    | `/api/products`                | No   | List all products                         |
| POST   | `/api/register`                | No   | Create an account and receive a token     |
| POST   | `/api/login`                   | No   | Sign in and receive a token               |
| GET    | `/api/me`                      | Yes  | Get the current user                      |
| GET    | `/api/wishlist`                | Yes  | Get wish list product IDs                 |
| POST   | `/api/wishlist/:id`            | Yes  | Add or remove a product (toggle)          |
| GET    | `/api/products/:id/reviews`    | No   | List reviews for a product                |
| POST   | `/api/products/:id/reviews`    | Yes  | Post a review (rating 1 to 5, text)       |
| POST   | `/api/coupon`                  | No   | Validate a coupon against a subtotal      |
| GET    | `/api/orders`                  | Yes  | List the user's orders                    |
| POST   | `/api/orders`                  | Yes  | Place an order                            |

## Coupon Codes

| Code         | Offer                                           |
|--------------|-------------------------------------------------|
| `SAVE10`     | 10% off, up to ₹500                             |
| `WELCOME200` | ₹200 off on carts of ₹999 or more               |
| `FREESHIP`   | Free delivery                                   |

Coupons are defined in the `COUPONS` object in `server.js`.

## Customization

- **Add a product:** add an object to `data/products.json` with a unique `id`:
```json
  {
    "id": 23,
    "name": "Product name",
    "cat": "Electronics",
    "price": 999,
    "mrp": 1999,
    "r": 4.3,
    "rv": 120,
    "em": "🎁",
    "h": 200,
    "d": "Short description",
    "img": "images/photo.jpg"
  }
```
- **Use your own images:** place files in `public/images/` and set `"img"` to `"images/your-file.jpg"`.
- **Add a category:** add the name to the `CATS` array in `public/app.js` and use the same value in the product's `cat` field.

## Deployment

GitHub Pages cannot host this project because it serves static files only and Shopzon needs a Node.js server. Any Node.js hosting service works. The steps below use [Render](https://render.com).

1. Push the project to GitHub. Make sure `server.js` and `package.json` are in the **root** of the repository.
2. Sign up at https://render.com using your GitHub account.
3. Click **New +** → **Web Service** and select your repository.
4. Use these settings:

   | Setting       | Value        |
   |---------------|--------------|
   | Branch        | `main`       |
   | Runtime       | `Node`       |
   | Build Command | `npm install`|
   | Start Command | `npm start`  |
   | Instance Type | `Free`       |

5. Under **Environment Variables**, add `SECRET` with a long random string.
6. Click **Create Web Service**. After the build finishes, Render provides a public URL such as `https://shopzon-xxxx.onrender.com`.
7. Every `git push` to the connected branch triggers a new deployment automatically.

## Limitations

- **Free hosting behavior:** Render's free tier puts the service to sleep after a period of inactivity, so the first request afterwards can be slow. Open the site once before a demo.
- **Data persistence:** data is stored in a JSON file. On hosts with an ephemeral filesystem (including most free tiers), users, reviews and orders can be lost on restart or redeploy. For production use, replace the JSON storage with a database such as PostgreSQL, MongoDB or Firebase.
- **Payments:** UPI and Card options are for demonstration only. No real payment is processed.
- **Product images:** images are loaded from an external placeholder service and may not match the product exactly. If an image fails to load, the product's emoji is shown. Use your own images for presentations.
- This project is intended for learning and demonstration purposes.

## Roadmap

- Replace JSON storage with a database
- Real payment gateway integration
- Product search suggestions and pagination
- Admin panel for managing products and orders
- Email notifications for orders

## License

Released under the MIT License.r, Railway, etc.) par bhi chal jayega, bas start command `npm start` rakhein.
