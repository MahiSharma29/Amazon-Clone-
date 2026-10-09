'use strict';
// Shopzon backend – plain Node.js, no npm packages needed.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'dev-secret-change-me';
const PUB = path.join(__dirname, 'public');
const DBF = path.join(__dirname, 'data', 'db.json');
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8'));

let db = { users: [], reviews: [], wishlists: {}, orders: [] };
try { db = { ...db, ...JSON.parse(fs.readFileSync(DBF, 'utf8')) }; } catch (e) {}
const save = () => fs.writeFileSync(DBF, JSON.stringify(db, null, 2));

const E = (s, m) => Object.assign(new Error(m), { status: s });
const U = u => { if (!u) throw E(401, 'Please sign in first'); return u; };
const hmac = p => crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
const sign = d => { const p = Buffer.from(JSON.stringify(d)).toString('base64url'); return p + '.' + hmac(p); };
const verify = t => {
  try {
    const [p, s] = t.split('.'), ok = hmac(p);
    if (s.length !== ok.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(ok))) return null;
    const d = JSON.parse(Buffer.from(p, 'base64url'));
    return d.exp > Date.now() ? d : null;
  } catch (e) { return null; }
};
const hash = (pw, salt = crypto.randomBytes(16).toString('hex')) => salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
const check = (pw, st) => { const [salt, h] = st.split(':'); return crypto.timingSafeEqual(Buffer.from(hash(pw, salt).split(':')[1], 'hex'), Buffer.from(h, 'hex')); };
const pubUser = u => ({ id: u.id, name: u.name, email: u.email });
const session = u => ({ token: sign({ id: u.id, exp: Date.now() + 7 * 864e5 }), user: pubUser(u) });

const COUPONS = {
  SAVE10: { type: 'pct', v: 10, max: 500, min: 0, msg: '10% off applied (up to ₹500)' },
  WELCOME200: { type: 'flat', v: 200, min: 999, msg: '₹200 off applied' },
  FREESHIP: { type: 'ship', min: 0, msg: 'Free delivery applied' }
};
function coupon(code, sub) {
  const k = String(code || '').trim().toUpperCase(), c = COUPONS[k];
  if (!c) throw E(400, 'Invalid coupon code');
  if (sub < c.min) throw E(400, `This coupon needs a cart value of ₹${c.min} or more`);
  const d = c.type === 'pct' ? Math.min(Math.round(sub * c.v / 100), c.max) : c.type === 'flat' ? c.v : 0;
  return { code: k, discount: Math.min(d, sub), freeShip: c.type === 'ship', message: c.msg };
}

const routes = [];
const R = (m, p, h) => routes.push([m, new RegExp('^' + p.replace(/:\w+/g, '([^/]+)') + '$'), h]);

R('GET', '/api/products', () => products);
R('POST', '/api/register', ({ body }) => {
  const name = String(body.name || '').trim(), email = String(body.email || '').trim().toLowerCase(), pw = String(body.password || '');
  if (name.length < 2) throw E(400, 'Enter your name');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw E(400, 'Enter a valid email');
  if (pw.length < 6) throw E(400, 'Password must be at least 6 characters');
  if (db.users.some(u => u.email === email)) throw E(409, 'An account with this email already exists');
  const u = { id: crypto.randomUUID(), name, email, pass: hash(pw) };
  db.users.push(u); save();
  return session(u);
});
R('POST', '/api/login', ({ body }) => {
  const u = db.users.find(x => x.email === String(body.email || '').trim().toLowerCase());
  if (!u || !check(String(body.password || ''), u.pass)) throw E(401, 'Wrong email or password');
  return session(u);
});
R('GET', '/api/me', ({ user }) => ({ user: pubUser(U(user)) }));

R('GET', '/api/wishlist', ({ user }) => ({ ids: db.wishlists[U(user).id] || [] }));
R('POST', '/api/wishlist/:id', ({ user, params }) => {
  const id = +params[0];
  if (!products.some(p => p.id === id)) throw E(404, 'Product not found');
  const l = db.wishlists[U(user).id] || [];
  db.wishlists[user.id] = l.includes(id) ? l.filter(x => x !== id) : [...l, id];
  save();
  return { ids: db.wishlists[user.id] };
});

R('GET', '/api/products/:id/reviews', ({ params }) =>
  ({ reviews: db.reviews.filter(r => r.productId === +params[0]).sort((a, b) => b.date.localeCompare(a.date)) }));
R('POST', '/api/products/:id/reviews', ({ user, body, params }) => {
  U(user);
  const rating = Math.round(+body.rating), text = String(body.text || '').trim().slice(0, 500);
  if (!(rating >= 1 && rating <= 5)) throw E(400, 'Rating must be 1 to 5');
  if (!text) throw E(400, 'Write a few words about the product');
  const r = { id: crypto.randomUUID(), productId: +params[0], userId: user.id, name: user.name, rating, text, date: new Date().toISOString() };
  db.reviews.push(r); save();
  return r;
});

R('POST', '/api/coupon', ({ body }) => coupon(body.code, +body.subtotal || 0));

R('GET', '/api/orders', ({ user }) => ({ orders: db.orders.filter(o => o.userId === U(user).id) }));
R('POST', '/api/orders', ({ user, body }) => {
  U(user);
  const items = (body.items || []).map(i => ({ p: products.find(x => x.id === +i.id), q: Math.max(1, Math.min(10, +i.q || 1)) })).filter(i => i.p);
  if (!items.length) throw E(400, 'Your cart is empty');
  const name = String(body.name || '').trim(), addr = String(body.addr || '').trim(), phone = String(body.phone || ''), pin = String(body.pin || '');
  if (!name || !addr) throw E(400, 'Enter your name and address');
  if (!/^[6-9]\d{9}$/.test(phone)) throw E(400, 'Enter a valid 10-digit mobile number');
  if (!/^\d{6}$/.test(pin)) throw E(400, 'Enter a valid 6-digit pincode');
  const sub = items.reduce((a, i) => a + i.p.price * i.q, 0);
  let discount = 0, free = false;
  if (body.coupon) { const c = coupon(body.coupon, sub); discount = c.discount; free = c.freeShip; }
  const shipping = free || sub >= 499 ? 0 : 40;
  const o = {
    id: 'SZ-' + Date.now().toString().slice(-8), userId: user.id, date: new Date().toISOString(),
    name, phone, addr, pin, pay: String(body.pay || 'COD').slice(0, 20), coupon: body.coupon || null,
    items: items.map(i => ({ id: i.p.id, n: i.p.name, q: i.q, price: i.p.price, em: i.p.em })),
    subtotal: sub, discount, shipping, total: sub - discount + shipping
  };
  db.orders.unshift(o); save();
  return o;
});

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  const send = (c, d, t = 'application/json') => { res.writeHead(c, { 'Content-Type': t }); res.end(t === 'application/json' ? JSON.stringify(d) : d); };
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch (e) { return send(400, { error: 'Bad URL' }); }

  if (!url.pathname.startsWith('/api/')) {
    try {
      const f = path.join(PUB, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!f.startsWith(PUB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return send(404, 'Not found', 'text/plain');
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      return fs.createReadStream(f).pipe(res);
    } catch (e) { return send(400, 'Bad request', 'text/plain'); }
  }

  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 1e5) req.destroy(); });
  req.on('end', () => {
    try {
      const r = routes.find(([m, re]) => m === req.method && re.test(url.pathname));
      if (!r) throw E(404, 'Not found');
      const t = verify((req.headers.authorization || '').replace('Bearer ', ''));
      const user = (t && db.users.find(u => u.id === t.id)) || null;
      send(200, r[2]({ body: raw ? JSON.parse(raw) : {}, user, params: url.pathname.match(r[1]).slice(1) }));
    } catch (e) {
      const code = e.status || (e instanceof SyntaxError ? 400 : 500);
      if (code === 500) console.error(e);
      send(code, { error: code === 500 ? 'Server error' : e.message });
    }
  });
}).listen(PORT, () => console.log(`\n  Shopzon is running → http://localhost:${PORT}\n`));
